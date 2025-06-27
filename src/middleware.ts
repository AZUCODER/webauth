import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_CONSTANTS } from '@/lib/session/constants';

// Route configurations
const ROUTES = {
  public: [
    '/',
    '/login',
    '/register',
    '/verify-email',
    '/reset-password',
    '/search',
  ],
  admin: [
    '/admin',
    '/settings/admin',
  ],
  assets: [
    '/placeholder.svg',
    '/images/',
    '/assets/',
    '/logo.svg',
    '/favicon.ico',
    '/_next', 
    '/public', 
    '/favicon.ico',
    '/static',
  ],
  redirects: [
    { source: '/register/verification-pending', destination: '/verify-email/pending' },
    { source: '/resend-verification', destination: '/verify-email/resend' },
    { source: '/forgot-password', destination: '/reset-password/request' },
  ]
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();
  
  // 1. Skip middleware for static assets
  if (isAssetPath(pathname)) {
    return response;
  }
  
  // 2. Handle redirects
  const redirect = ROUTES.redirects.find(r => r.source === pathname);
  if (redirect) {
    const url = request.nextUrl.clone();
    url.pathname = redirect.destination;
    return NextResponse.redirect(url);
  }
  
  // 3. Skip auth checks for public routes
  if (isPublicPath(pathname)) {
    return response;
  }

  // 4. Verify authentication
  const sessionCookie = request.cookies.get(SESSION_CONSTANTS.COOKIE_NAME);
  if (!sessionCookie) {
    return redirectToLogin(request);
  }
  
  // 5. Validate JWT token
  try {
    const { payload } = await verifyJwtToken(sessionCookie.value);
    
    // 6. Handle dashboard routes explicitly
    if (isDashboardPath(pathname)) {
      return response;
    }
    
    // 7. Check admin route access
    if (isAdminPath(pathname) && payload.role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    
    // 8. All checks passed
    return response;
  } catch (error) {
    return redirectToLogin(request);
  }
}

// Helper functions
function isPublicPath(path: string): boolean {
  return ROUTES.public.some(route => path.startsWith(route)) || 
         path.includes('/api/public') ||
         isAssetPath(path);
}

function isAssetPath(path: string): boolean {
  return ROUTES.assets.some(asset => path.startsWith(asset) || path.includes(asset)) ||
         path.includes('/_next/image') ||
         path.includes('/_next/static');
}

function isDashboardPath(path: string): boolean {
  return path.startsWith('/dashboard') || path.startsWith('/app');
}

function isAdminPath(path: string): boolean {
  return !isDashboardPath(path) && 
         ROUTES.admin.some(route => path.startsWith(route));
}

function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('callbackUrl', encodeURIComponent(request.nextUrl.pathname));
  
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_CONSTANTS.COOKIE_NAME);
  
  return response;
}

async function verifyJwtToken(token: string) {
  const encoder = new TextEncoder();
  const secretKey = process.env.JWT_SECRET || 'fallback-secret-for-development';
  
  if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    console.warn('[Security Warning] Using fallback JWT secret in production');
  }
  
  const result = await jwtVerify(token, encoder.encode(secretKey));
  
  // Check if token is expired
  const now = Math.floor(Date.now() / 1000);
  if (result.payload.exp && result.payload.exp < now) {
    throw new Error('Token expired');
  }
  
  return result;
}

// Match all pages except for specific Next.js internals
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 