# Secure Routing and API Endpoints Guide

## Introduction

This guide provides comprehensive documentation for implementing secure routes and API endpoints in our Next.js application, explaining our current middleware-based authentication and authorization system.

## Route Protection Overview

Our application uses a middleware-based approach to protect routes based on:
1. Authentication status (is the user logged in?)
2. Role-based access control (does the user have the right role?)
3. Route type categorization (public vs. protected routes)

## Middleware Implementation

### Route Categories

The middleware categorizes routes into several types:

```typescript
// Public routes - accessible without authentication
const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
];

// Dashboard routes - for regular authenticated users
const dashboardRoutes = [
  '/dashboard',
  '/profile',
  '/files',
  '/account',
];

// Admin-only routes - require ADMIN role
const adminRoutes = [
  '/admin',
  '/settings',
  '/permissions',
];

// Public assets - accessible without authentication
const publicAssets = [
  '/placeholder.svg',
  '/images/',
  '/assets/',
  '/logo.svg',
  '/favicon.ico'
];
```

### Authentication Flow

The middleware implements the following authentication flow:

1. Skip middleware for static assets
2. Handle configured redirects
3. Allow access to public routes without authentication
4. For protected routes:
   - Check for session cookie
   - Verify JWT token validity
   - Check token expiration
   - Verify role-based access for admin routes
   - Grant access if all checks pass

### Implementation Details

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Use consistent response object
  let response = NextResponse.next();
  
  // Skip middleware for static assets
  if (isPublicAsset(pathname)) {
    return response;
  }
  
  // Handle redirects first
  for (const redirect of redirects) {
    if (pathname === redirect.source) {
      const url = request.nextUrl.clone();
      url.pathname = redirect.destination;
      return NextResponse.redirect(url);
    }
  }
  
  // Skip auth checks for public routes
  if (isPublicRoute(pathname)) {
    return response;
  }

  // Get session cookie
  const sessionCookie = request.cookies.get(SESSION_CONSTANTS.COOKIE_NAME);
  
  // Redirect to login if no session cookie
  if (!sessionCookie) {
    return redirectToLogin(request);
  }
  
  try {
    // Verify JWT token
    const encoder = new TextEncoder();
    const secretKey = process.env.JWT_SECRET || 'fallback-secret-for-development';
    
    const { payload } = await jwtVerify(
      sessionCookie.value,
      encoder.encode(secretKey)
    );
    
    // Check token expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return redirectToLogin(request);
    }
    
    // Role-based access control for admin routes
    if (isAdminRoute(pathname) && payload.role !== 'ADMIN') {
      // Redirect non-admin users to dashboard
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    
    // Grant access if all checks pass
    return response;
  } catch (error) {
    // Handle JWT verification failure
    return redirectToLogin(request);
  }
}
```

## Role-Based Access Control

Our application implements a dual-layer approach to authorization:

### 1. Role-Based Routes (Middleware Level)

The middleware enforces role-based access at the route level:
- All users must authenticate to access protected routes
- Only users with the `ADMIN` role can access admin routes
- Regular users with the `USER` role are redirected to the dashboard if they attempt to access admin routes

### 2. Permission-Based Actions (Application Level)

For more granular control, especially within components and API routes, we use permission-based authorization:

```typescript
// Example of permission-based check in an API route
export async function POST(req: NextRequest) {
  return withPermission(req, 'posts:create', async () => {
    // Handler implementation
    const post = await createPost(data);
    return NextResponse.json({ post }, { status: 201 });
  });
}
```

## Session Management

Our authentication system uses JWT-based sessions stored in cookies:

1. **Session Creation**: Upon successful login, a JWT token is generated and stored in a secure cookie
2. **Session Verification**: The middleware verifies the JWT token on each request to protected routes
3. **Session Expiration**: Tokens include an expiration time to enforce re-authentication
4. **Session Refreshing**: Tokens are automatically refreshed when approaching expiration
5. **Session Termination**: Logging out removes the session cookie

## Security Best Practices

### Cookie Security

Session cookies are configured with security-focused options:

```typescript
export const DEFAULT_SESSION_OPTIONS: SessionOptions = {
  maxAge: SESSION_CONSTANTS.MAX_AGE,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  sameSite: 'strict',
} as const;
```

### JWT Token Security

JWT tokens include:
- User identifier
- Username and email
- Role information
- Issue time (iat)
- Expiration time (exp)

### Redirect Management

When redirecting unauthenticated users to login, we preserve their intended destination:

```typescript
function redirectToLogin(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('callbackUrl', encodeURIComponent(request.nextUrl.pathname));
  
  const response = NextResponse.redirect(url);
  response.cookies.delete(SESSION_CONSTANTS.COOKIE_NAME);
  
  return response;
}
```

## Client-Side Authentication

For client components, we provide a `useAuth` hook:

```typescript
'use client';

export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null
  });

  const checkAuth = useCallback(async () => {
    try {
      const response = await api.get('/api/auth/check');
      setAuthState({
        isAuthenticated: response.data.authenticated,
        isLoading: false,
        error: null,
        user: response.data.user
      });
    } catch (error) {
      // Error handling
    }
  }, []);

  // Check auth on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // ...other auth functions

  return {
    ...authState,
    checkAuth,
    logout,
    requireAuth
  };
}
```

## API Route Protection

For API routes, we use our permissions middleware:

```typescript
// Protect API route with permissions
export async function GET(req: NextRequest) {
  return withPermission(req, 'dashboard:view', async () => {
    const dashboardData = await fetchDashboardData();
    return NextResponse.json({ dashboardData });
  });
}

// Protect resource-based actions
export async function POST(req: NextRequest) {
  return withResourcePermission(req, 'create', 'posts', async () => {
    const data = await req.json();
    const post = await prisma.post.create({ data });
    return NextResponse.json({ post }, { status: 201 });
  });
}
```

## Common Issues and Troubleshooting

### Issue: Middleware Redirect Loops

If you experience redirect loops (browser error: "ERR_TOO_MANY_REDIRECTS"), check:

1. That `publicRoutes` includes all necessary public paths
2. The route is not incorrectly classified as admin-only
3. Dashboard routes are properly handled for regular users

### Issue: JWT Verification Failures

If authentication fails with JWT errors:

1. Ensure `JWT_SECRET` is properly set in environment variables
2. Check cookie expiration and same-site settings
3. Verify JWT token format and encoding

### Issue: Role-Based Access Problems

If users can't access routes they should, or can access routes they shouldn't:

1. Verify user role assignment in the database
2. Check `isAdminRoute` logic in middleware
3. Ensure role information is correctly included in the JWT payload

## Security Recommendations

1. **Environment Variables**: Always set proper `JWT_SECRET` in production
2. **Cookie Security**: Use `secure: true` and `sameSite: 'strict'` in production
3. **Token Lifetime**: Balance security and usability with appropriate token expiration
4. **Error Handling**: Avoid exposing sensitive information in error messages
5. **Logging**: Implement security event logging for audit purposes 