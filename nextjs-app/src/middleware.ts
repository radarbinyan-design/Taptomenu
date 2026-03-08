import { createServerClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/* ─── Route groups ───────────────────────────────────────────────────────── */
const PROTECTED_ROUTES = ['/dashboard', '/admin']
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']
const ADMIN_ROUTES = ['/admin']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ─── /dev: block in production ────────────────────────────────────────────
  if (pathname.startsWith('/dev')) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  // ─── Build mutable response so Supabase can refresh cookies ──────────────
  const res = NextResponse.next({
    request: { headers: request.headers },
  })

  /* ── Supabase session (works with or without real credentials) ──────────── */
  let session: { user: { id: string } } | null = null
  let supabaseRole: string | null = null

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  const isRealSupabase =
    supabaseUrl.startsWith('https://') && !supabaseUrl.includes('your-project')

  if (isRealSupabase) {
    try {
      // createServerClient needs cookie read/write to refresh tokens
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          get(name) {
            return request.cookies.get(name)?.value
          },
          set(name, value, options) {
            // Write refreshed cookie back to both request and response
            request.cookies.set({ name, value, ...options })
            res.cookies.set({ name, value, ...options })
          },
          remove(name, options) {
            request.cookies.set({ name, value: '', ...options })
            res.cookies.set({ name, value: '', ...options })
          },
        },
      })

      const {
        data: { session: sbSession },
      } = await supabase.auth.getSession()

      if (sbSession) {
        session = sbSession

        // Fetch role from users table (single DB call, cached by Supabase edge)
        const { data: userRow } = await supabase
          .from('users')
          .select('role')
          .eq('id', sbSession.user.id)
          .single()

        supabaseRole = userRow?.role ?? null
      }
    } catch {
      // Supabase call failed — fall through to cookie-based auth
    }
  }

  // ─── Cookie-based auth fallback (demo / dev without real Supabase) ────────
  // Our /api/auth/login sets these cookies on demo login
  const cookieToken =
    request.cookies.get('sb-access-token')?.value ||
    request.cookies.get('supabase-auth-token')?.value

  const isAuthenticated = !!(session ?? cookieToken)
  const userRole =
    supabaseRole ??
    request.cookies.get('user-role')?.value ??
    null

  // ─── Protect /dashboard and /admin ───────────────────────────────────────
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r)) && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ─── Redirect authenticated users away from /login, /register, etc. ──────
  if (AUTH_ROUTES.some((r) => pathname.startsWith(r)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // ─── /admin requires admin or superadmin role ─────────────────────────────
  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && isAuthenticated) {
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static  (static files)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public/       (static assets)
     * - api/          (API routes handle their own auth)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
