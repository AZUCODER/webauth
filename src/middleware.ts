import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_CONSTANTS } from '@/lib/session/constants'

// Define routes that require authentication
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/settings',
  '/api/protected',
  '/posts/add',
  '/posts/edit',
  '/posts/view',
  '/post-categories/add',
  '/post-categories/edit',
  '/post-categories/view',
  // Additional admin routes
  '/users',
  '/permissions',
  '/audit-logs',
  // Ensure all route variations are protected
  '/users/create',
  '/users/edit',
  '/posts/edit',
  '/permissions/roles',
  '/permissions/create',
  '/permissions/edit',
]

// Define routes that are only accessible for non-authenticated users
const AUTH_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/verify-email'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user has session cookie
  const hasSessionCookie = request.cookies.has(SESSION_CONSTANTS.COOKIE_NAME)
  
  // Handle protected routes (redirect to login if no session)
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!hasSessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  // Handle auth routes (redirect to dashboard if already logged in)
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  return NextResponse.next()
}

// Configure matcher for routes that trigger the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
