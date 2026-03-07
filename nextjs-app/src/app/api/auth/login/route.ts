import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    // Demo accounts for development
    if (process.env.NODE_ENV !== 'production') {
      if (email === 'owner@demo.com' && password === 'demo123') {
        return NextResponse.json({
          user: {
            id: 'demo-owner',
            email: 'owner@demo.com',
            name: 'Арам Петросян',
            role: 'owner',
          },
          message: 'Успешный вход',
        })
      }
      if (email === 'admin@tapmenu.am' && password === 'admin123') {
        return NextResponse.json({
          user: {
            id: 'demo-admin',
            email: 'admin@tapmenu.am',
            name: 'Admin TapMenu',
            role: 'superadmin',
          },
          message: 'Успешный вход',
        })
      }
    }

    // Real Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    // Get user role from DB
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, role: true, mustChangePassword: true },
    }).catch(() => null)

    return NextResponse.json({
      user: user || { id: data.user?.id, email, name: email, role: 'owner' },
      session: data.session,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
