import { NextRequest, NextResponse } from 'next/server'

// Demo accounts — always work regardless of NODE_ENV
const DEMO_ACCOUNTS = [
  {
    email: 'owner@demo.com',
    password: 'demo1234',
    user: { id: 'demo-owner', email: 'owner@demo.com', name: 'Арам Петросян', role: 'owner' },
  },
  {
    email: 'admin@tapmenu.am',
    password: 'admin1234',
    user: { id: 'demo-admin', email: 'admin@tapmenu.am', name: 'Admin TapMenu', role: 'superadmin' },
  },
]

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    // Check demo accounts first (always available)
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    )

    if (demo) {
      const res = NextResponse.json({ user: demo.user, message: 'Успешный вход' })
      // Set auth cookie so middleware lets them through
      res.cookies.set('sb-access-token', `demo-token-${demo.user.role}`, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        sameSite: 'lax',
      })
      res.cookies.set('user-role', demo.user.role, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      })
      res.cookies.set('user-name', demo.user.name, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      })
      return res
    }

    // No real DB connected yet
    return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })

  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
