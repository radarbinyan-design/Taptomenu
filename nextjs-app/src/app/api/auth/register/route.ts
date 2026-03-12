import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, restaurantName, plan } = await request.json()

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Имя, email и пароль обязательны' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 8 символов' },
        { status: 400 }
      )
    }

    // Check if user already exists
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Пользователь с таким email уже зарегистрирован' },
          { status: 409 }
        )
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 12)

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          name,
          phone: phone || null,
          passwordHash,
          role: 'owner',
          isEmailVerified: false,
          mustChangePassword: false,
        },
      })

      // Create restaurant if name provided
      if (restaurantName) {
        const slug = restaurantName
          .toLowerCase()
          .replace(/[^a-zA-Z0-9а-яА-Я]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .substring(0, 50) || `rest-${user.id.substring(0, 8)}`

        await prisma.restaurant.create({
          data: {
            userId: user.id,
            name: restaurantName,
            slug: `${slug}-${user.id.substring(0, 6)}`,
            country: 'AM',
            primaryColor: '#F59E0B',
            accentColor: '#1F2937',
            templateId: 'classic',
          },
        })
      }

      // Create subscription (trial)
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 14)

      await prisma.subscription.create({
        data: {
          userId: user.id,
          plan: (plan as any) || 'pro',
          status: 'trial',
          trialEndsAt,
          maxMenus: plan === 'starter' ? 1 : plan === 'premium' ? 10 : 3,
          maxDishes: plan === 'starter' ? 30 : plan === 'premium' ? 500 : 100,
          maxLanguages: plan === 'starter' ? 2 : plan === 'premium' ? 20 : 5,
          maxNfcTags: plan === 'starter' ? 1 : plan === 'premium' ? 20 : 5,
        },
      })

      // Send welcome email (non-blocking)
      sendWelcomeEmail(
        email,
        name,
        restaurantName || 'Ваш ресторан'
      ).catch((err) => console.error('[register] Welcome email failed:', err))

      return NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        message: 'Регистрация успешна! Проверьте email.',
      })
    } catch (dbError: any) {
      // If database is not configured, return demo response
      if (
        dbError?.message?.includes('connect') ||
        dbError?.message?.includes('ECONNREFUSED') ||
        dbError?.code === 'P1001'
      ) {
        console.warn('[register] DB not configured, returning demo response')

        // Still try to send welcome email
        sendWelcomeEmail(
          email,
          name,
          restaurantName || 'Ваш ресторан'
        ).catch(() => {})

        return NextResponse.json({
          user: {
            id: `demo-${Date.now()}`,
            email,
            name,
            role: 'owner',
          },
          message: 'Регистрация успешна (demo mode)',
          source: 'demo',
        })
      }
      throw dbError
    }
  } catch (err) {
    console.error('[register] Unhandled error:', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
