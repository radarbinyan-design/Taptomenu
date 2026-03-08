import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/** Returns true when real Supabase credentials are configured */
function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  return url.startsWith('https://') && !url.includes('your-project')
}

export async function POST() {
  const res = NextResponse.json({ message: 'Выход выполнен' })

  /* ── Real Supabase signOut ──────────────────────────────────────────────── */
  if (isSupabaseConfigured()) {
    try {
      const cookieStore = cookies()
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
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[logout] Supabase signOut error:', err)
      // Non-fatal — clear cookies anyway
    }
  }

  /* ── Clear all auth cookies ─────────────────────────────────────────────── */
  const cookiesToClear = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'user-role',
    'user-name',
  ]

  cookiesToClear.forEach((name) => {
    res.cookies.set(name, '', { maxAge: 0, path: '/' })
  })

  return res
}
