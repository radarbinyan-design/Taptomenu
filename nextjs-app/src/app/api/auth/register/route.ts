/**
 * POST /api/auth/register
 *
 * Creates a new user account with Supabase Auth + inserts user/restaurant/subscription
 * rows in the database. Falls back to Prisma-only if Supabase is not configured.
 *
 * Body: { name, email, password, phone?, restaurantName, plan? }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { RegisterSchema, formatZodErrors } from '@/lib/validators'
import { isSupabaseConfigured, supabaseAdmin } from '@/lib/supabase'
import { z } from 'zod'

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0400-\u04ff\s-]/g, '')
    .replace(/[\s]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'restaurant'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = RegisterSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: formatZodErrors(parsed.error) },
        { status: 400 }
      )
    }

    const { name, email, password, phone, restaurantName, plan } = parsed.data

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже зарегистрирован' },
        { status: 409 }
      )
    }

    let supabaseUserId: string | null = null

    // Create Supabase auth user if configured
    if (isSupabaseConfigured()) {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm for MVP
        user_metadata: { name, phone },
      })
      if (authError) {
        return NextResponse.json(
          { error: `Auth error: ${authError.message}` },
          { status: 400 }
        )
      }
      supabaseUserId = authData.user.id
    }

    // Generate unique slug
    let slug = generateSlug(restaurantName)
    const existingSlug = await prisma.restaurant.findUnique({ where: { slug } })
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`
    }

    // Create user + restaurant + subscription in a transaction
    const result = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: {
          id: supabaseUserId || undefined,
          email,
          name,
          phone: phone || null,
          role: 'owner',
        },
      })

      const restaurant = await tx.restaurant.create({
        data: {
          userId: user.id,
          name: restaurantName,
          slug,
          primaryColor: '#F59E0B',
          accentColor: '#1F2937',
          templateId: 'classic',
          country: 'AM',
        },
      })

      // Plan limits
      const limits: Record<string, { menus: number; dishes: number; languages: number; nfcTags: number }> = {
        starter: { menus: 1, dishes: 30, languages: 2, nfcTags: 1 },
        pro: { menus: 3, dishes: 100, languages: 5, nfcTags: 5 },
        premium: { menus: 10, dishes: 500, languages: 20, nfcTags: 20 },
        luxe: { menus: 999, dishes: 9999, languages: 33, nfcTags: 999 },
      }
      const planLimits = limits[plan] || limits.pro

      const trialEnd = new Date()
      trialEnd.setDate(trialEnd.getDate() + 14) // 14-day trial

      const subscription = await tx.subscription.create({
        data: {
          userId: user.id,
          plan,
          status: 'trial',
          trialEndsAt: trialEnd,
          maxMenus: planLimits.menus,
          maxDishes: planLimits.dishes,
          maxLanguages: planLimits.languages,
          maxNfcTags: planLimits.nfcTags,
        },
      })

      return { user, restaurant, subscription }
    })

    // Set session cookies
    const response = NextResponse.json(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        restaurant: {
          id: result.restaurant.id,
          name: result.restaurant.name,
          slug: result.restaurant.slug,
        },
        subscription: {
          plan: result.subscription.plan,
          status: result.subscription.status,
          trialEndsAt: result.subscription.trialEndsAt,
        },
        message: 'Регистрация успешна!',
      },
      { status: 201 }
    )

    const maxAge = 7 * 24 * 60 * 60 // 7 days
    response.cookies.set('user-role', result.user.role, {
      httpOnly: true,
      maxAge,
      path: '/',
    })
    response.cookies.set('user-name', encodeURIComponent(result.user.name), {
      maxAge,
      path: '/',
    })

    return response
  } catch (err: unknown) {
    console.error('[register] Error:', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
