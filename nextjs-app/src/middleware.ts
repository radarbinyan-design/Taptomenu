import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/admin']
// Routes only for non-authenticated users
const AUTH_ROUTES = ['/login', '/register', '/forgot-password']
// Admin-only routes
const ADMIN_ROUTES = ['/admin']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get auth token from cookies
  const authToken = request.cookies.get('sb-access-token')?.value ||
                    request.cookies.get('supabase-auth-token')?.value

  const isAuthenticated = !!authToken
  const userRole = request.cookies.get('user-role')?.value

  // Redirect unauthenticated users to login
  if (PROTECTED_ROUTES.some((route) => pathname.startsWith(route)) && !isAuthenticated) {
    // Allow in development for demo purposes
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next()
    }
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users away from auth pages
  if (AUTH_ROUTES.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Admin routes require admin role
  if (ADMIN_ROUTES.some((route) => pathname.startsWith(route)) && isAuthenticated) {
    if (userRole !== 'admin' && userRole !== 'superadmin') {
      if (process.env.NODE_ENV !== 'development') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
