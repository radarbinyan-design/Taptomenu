/**
 * POST /api/auth/forgot-password
 *
 * Sends a password reset email via Supabase Auth.
 * If Supabase is not configured, returns a helpful message.
 *
 * Body: { email }
 */

import { NextRequest, NextResponse } from 'next/server'
import { isSupabaseConfigured, supabase } from '@/lib/supabase'
import { z } from 'zod'

const ForgotPasswordSchema = z.object({
  email: z.string().email('Укажите корректный email'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = ForgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues.map(i => i.message).join('; ') },
        { status: 400 }
      )
    }

    const { email } = parsed.data

    if (!isSupabaseConfigured()) {
      // In dev mode without Supabase, return a helpful message
      return NextResponse.json({
        message: 'Supabase не настроен. В рабочей среде на этот email будет отправлена ссылка для сброса пароля.',
        demo: true,
      })
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    })

    if (error) {
      console.error('[forgot-password] Supabase error:', error.message)
      // Don't reveal if email exists or not (security)
      return NextResponse.json({
        message: 'Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля.',
      })
    }

    return NextResponse.json({
      message: 'Если аккаунт с таким email существует, мы отправили ссылку для сброса пароля.',
    })
  } catch (err: unknown) {
    console.error('[forgot-password] Error:', err)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
