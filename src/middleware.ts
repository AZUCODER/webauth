import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_CONSTANTS } from '@/lib/session/constants';

// Define public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  '/search',
];

// Define dashboard routes (authenticated but not admin-only)
const dashboardRoutes = [
  '/dashboard',
  '/profile',
  '/files',
  '/account',
];

// Define public assets that don't require authentication
const publicAssets = [
  '/placeholder.svg',
  '/images/',
  '/assets/',
  '/logo.svg',
  '/favicon.ico'
];

// Define admin-only routes
const adminRoutes = [
  '/admin',
  '/settings',
  '/permissions',
];

// Define route redirects that were previously in next.config.ts
const redirects = [
  {
    source: '/register/verification-pending',
    destination: '/verify-email/pending',
  },
  {
    source: '/resend-verification',
    destination: '/verify-email/resend',
  },
  {
    source: '/forgot-password',
    destination: '/reset-password/request',
  }
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Use NextResponse.next() to continue to the route when appropriate
  let response = NextResponse.next();
  
  // Debug current request
  console.log(`[Middleware] Processing request for: ${pathname}`);
  
  // Skip middleware entirely for static assets
  if (isPublicAsset(pathname)) {
    console.log(`[Middleware] Skipping middleware for public asset: ${pathname}`);
    return response;
  }
  
  // Handle redirects first
  for (const redirect of redirects) {
    if (pathname === redirect.source) {
      console.log(`[Middleware] Redirecting from ${pathname} to ${redirect.destination}`);
      const url = request.nextUrl.clone();
      url.pathname = redirect.destination;
      return NextResponse.redirect(url);
    }
  }
  
  // Skip auth checks for public routes
  if (isPublicRoute(pathname)) {
    console.log(`[Middleware] Allowing access to public route: ${pathname}`);
    return response;
  }

  // Get the session JWT token from cookies using the constant
  const sessionCookie = request.cookies.get(SESSION_CONSTANTS.COOKIE_NAME);
  
  // Print cookie info for debugging
  console.log(`[Middleware] Session cookie present: ${!!sessionCookie}, path: ${pathname}`);
  
  // If attempting to access a protected route without a session cookie, redirect to login
  if (!sessionCookie) {
    console.log(`[Middleware] No session cookie found, redirecting to login from: ${pathname}`);
    return redirectToLogin(request);
  }
  
  try {
    // Verify the JWT token
    const encoder = new TextEncoder();
    const secretKey = process.env.JWT_SECRET || 'fallback-secret-for-development';
    
    // Add debug log to help troubleshoot
    if (!process.env.JWT_SECRET) {
      console.warn('[Middleware] Using fallback JWT secret - consider setting JWT_SECRET in your env');
    }
    
    const { payload } = await jwtVerify(
      sessionCookie.value,
      encoder.encode(secretKey)
    );
    
    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log(`[Middleware] Session expired at ${new Date(payload.exp * 1000).toISOString()}, current time: ${new Date().toISOString()}`);
      return redirectToLogin(request);
    }
    
    // Log successful auth
    console.log(`[Middleware] Successfully authenticated user for ${pathname} with role: ${payload.role}`);
    
    // Check role-based permissions for admin routes
    if (isAdminRoute(pathname) && payload.role !== 'ADMIN') {
      console.log(`[Middleware] User with role ${payload.role} attempted to access admin route: ${pathname}`);
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    
    // If all checks pass, proceed to the requested page
    console.log(`[Middleware] Access granted to ${pathname}`);
    return response;
  } catch (error) {
    // If JWT verification fails, clear cookie and redirect to login
    console.error(`[Middleware] JWT verification failed for ${pathname}:`, error);
    return redirectToLogin(request);
  }
}

// Helper function to redirect to login with callback URL
function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('callbackUrl', encodeURIComponent(request.nextUrl.pathname));
  
  // Create the response with redirect
  const response = NextResponse.redirect(url);
  
  // Clear the invalid session cookie if present
  response.cookies.delete(SESSION_CONSTANTS.COOKIE_NAME);
  
  console.log(`[Middleware] Redirecting to login with callback to: ${request.nextUrl.pathname}`);
  
  return response;
}

// Helper function to check if a path is public
function isPublicRoute(path: string): boolean {
  const isPublic = publicRoutes.some(route => path.startsWith(route)) ||
    path.includes('/_next') || 
    path.includes('/api/public') ||
    isPublicAsset(path);
  
  console.log(`[Middleware] Path ${path} is public: ${isPublic}`);
  return isPublic;
}

// Helper function to check if a path is a dashboard route
function isDashboardRoute(path: string): boolean {
  return dashboardRoutes.some(route => path.startsWith(route));
}

// Helper function to check if a path is a public asset
function isPublicAsset(path: string): boolean {
  return publicAssets.some(asset => path.startsWith(asset)) ||
    path.includes('/public') || 
    path.includes('/favicon.ico') ||
    path.includes('/static') ||
    path.includes('/_next/image') ||
    path.includes('/_next/static');
}

// Helper function to check if a path is admin-only
function isAdminRoute(path: string): boolean {
  return adminRoutes.some(route => path.startsWith(route));
}

// Match all pages except for specific Next.js internals
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}; 