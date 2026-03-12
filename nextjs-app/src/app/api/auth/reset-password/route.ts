import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json()

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Токен и новый пароль обязательны' },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Пароль должен быть не менее 8 символов' },
        { status: 400 }
      )
    }

    try {
      // Find valid token
      const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      })

      if (!resetToken) {
        return NextResponse.json(
          { error: 'Ссылка недействительна или уже была использована' },
          { status: 400 }
        )
      }

      // Check expiration
      if (new Date() > resetToken.expiresAt) {
        // Delete expired token
        await prisma.passwordResetToken.delete({
          where: { id: resetToken.id },
        })

        return NextResponse.json(
          { error: 'Ссылка для сброса пароля истекла. Запросите новую.' },
          { status: 400 }
        )
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 12)

      // Update user password
      await prisma.user.update({
        where: { id: resetToken.userId },
        data: {
          passwordHash,
          mustChangePassword: false,
        },
      })

      // Delete used token (and any other tokens for this user)
      await prisma.passwordResetToken.deleteMany({
        where: { userId: resetToken.userId },
      })

      return NextResponse.json({
        message: 'Пароль успешно изменён!',
      })
    } catch (dbError: any) {
      if (
        dbError?.message?.includes('connect') ||
        dbError?.message?.includes('ECONNREFUSED') ||
        dbError?.code === 'P1001'
      ) {
        console.warn('[reset-password] DB not configured')
        return NextResponse.json(
          { error: 'Сервис временно недоступен. Попробуйте позже.' },
          { status: 503 }
        )
      }
      throw dbError
    }
  } catch (err) {
    console.error('[reset-password] Unhandled error:', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
