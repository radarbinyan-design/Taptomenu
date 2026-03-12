import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.tapmenu.am'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email обязателен' },
        { status: 400 }
      )
    }

    // Always return success for security (don't reveal if email exists)
    const successResponse = NextResponse.json({
      message: 'Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля.',
    })

    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      })

      if (!user) {
        // Don't reveal that user doesn't exist — return success anyway
        return successResponse
      }

      // Delete any existing reset tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id },
      })

      // Generate secure token
      const token = randomBytes(32).toString('hex')

      // Token expires in 1 hour
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 1)

      // Store token in DB
      await prisma.passwordResetToken.create({
        data: {
          token,
          userId: user.id,
          expiresAt,
        },
      })

      // Build reset link
      const resetLink = `${BASE_URL}/reset-password?token=${token}`

      // Send email (non-blocking)
      sendPasswordResetEmail(email, resetLink).catch((err) =>
        console.error('[forgot-password] Email send error:', err)
      )
    } catch (dbError: any) {
      // If DB is not configured, log and return success
      if (
        dbError?.message?.includes('connect') ||
        dbError?.message?.includes('ECONNREFUSED') ||
        dbError?.code === 'P1001'
      ) {
        console.warn('[forgot-password] DB not configured, demo mode')
      } else {
        console.error('[forgot-password] DB error:', dbError)
      }
    }

    return successResponse
  } catch (err) {
    console.error('[forgot-password] Unhandled error:', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
