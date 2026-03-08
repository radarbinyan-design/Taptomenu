import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

/* ─── Demo accounts (always available, no Supabase needed) ──────────────── */
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

/** Returns true when real Supabase credentials are configured */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.startsWith('https://') && !url.includes('your-project')
}

/** Cookie max-age: 7 days */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email и пароль обязательны' }, { status: 400 })
    }

    /* ── 1. Demo accounts check (always first) ──────────────────────────── */
    const demo = DEMO_ACCOUNTS.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
    )

    if (demo) {
      const res = NextResponse.json({
        user: demo.user,
        message: 'Успешный вход (demo)',
        source: 'demo',
      })
      res.cookies.set('sb-access-token', `demo-token-${demo.user.role}`, {
        httpOnly: true,
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
      })
      res.cookies.set('user-role', demo.user.role, {
        httpOnly: true,
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
      })
      res.cookies.set('user-name', demo.user.name, {
        path: '/',
        maxAge: COOKIE_MAX_AGE,
        sameSite: 'lax',
      })
      return res
    }

    /* ── 2. Real Supabase Auth ───────────────────────────────────────────── */
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 })
    }

    const cookieStore = cookies()
    const res = NextResponse.json({ message: 'pending' }) // placeholder, replaced below

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value
          },
          set(name, value, options) {
            res.cookies.set({ name, value, ...options })
          },
          remove(name, options) {
            res.cookies.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.session) {
      console.error('[login] Supabase auth error:', error?.message)
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      )
    }

    /* ── 3. Fetch user role from public.users table ──────────────────────── */
    const { data: userRow } = await supabase
      .from('users')
      .select('id, name, role')
      .eq('id', data.session.user.id)
      .single()

    const role = userRow?.role ?? 'owner'
    const name = userRow?.name ?? data.session.user.email ?? ''

    /* ── 4. Build final response with user info ──────────────────────────── */
    const finalRes = NextResponse.json({
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        name,
        role,
      },
      message: 'Успешный вход',
      source: 'supabase',
    })

    // Copy Supabase session cookies (sb-access-token, sb-refresh-token) already
    // set by createServerClient into the final response
    res.cookies.getAll().forEach((cookie) => {
      finalRes.cookies.set(cookie)
    })

    // Also set our helper cookies for middleware
    finalRes.cookies.set('user-role', role, {
      httpOnly: true,
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
    })
    finalRes.cookies.set('user-name', name, {
      path: '/',
      maxAge: COOKIE_MAX_AGE,
      sameSite: 'lax',
    })

    return finalRes

  } catch (err) {
    console.error('[login] Unhandled error:', err)
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
