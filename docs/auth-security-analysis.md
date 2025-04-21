# Authentication and Authorization Security Analysis

## Overview

This document provides a comprehensive analysis of the authentication and authorization implementation in the project, evaluating its strengths, weaknesses, and suggesting improvements for enhanced security.

## Current Implementation Analysis

### Authentication System

The project implements a JWT-based authentication system with the following components:

1. **User Model**:
   - Email and password-based authentication
   - Email verification workflow
   - Password hashing using bcrypt
   - Session management with JWT
   - Role-based authorization (USER, ADMIN)

2. **Session Management**:
   - JWT-based sessions with secure cookie storage
   - Automatic session refresh mechanism
   - Session metadata tracking (IP, user agent)
   - Session expiration handling
   - Proper session termination on logout

3. **Token System**:
   - Support for multiple token types (EMAIL_VERIFICATION, PASSWORD_RESET)
   - Token expiration and invalidation mechanisms
   - Single-use tracking for sensitive tokens

4. **Security Features**:
   - CSRF protection through secure cookies
   - Password hashing using bcrypt
   - Audit logging for security events

### Authorization System

The project implements a comprehensive RBAC (Role-Based Access Control) with PBAC (Permission-Based Access Control) overlay:

1. **Role System**:
   - Simplified role structure (USER, ADMIN)
   - Role-based routing and middleware protection

2. **Permission System**:
   - Granular permission definitions with resource+action pairs
   - Role-Permission mappings
   - User-specific permission overrides
   - Permission checking utilities

3. **Middleware**:
   - Route protection based on authentication status
   - Route categorization (public, dashboard, admin-only)
   - JWT verification and validation
   - Role-based access enforcement

## Current Implementation Strengths

1. **JWT-Based Authentication**:
   - Secure token generation and validation
   - Cookie-based token storage with security options
   - Proper expiration and refresh mechanisms

2. **Role-Based Authorization**:
   - Clear separation between USER and ADMIN roles
   - Middleware-enforced route protection
   - Granular permission system for fine-grained access control

3. **Security Features**:
   - Password hashing with bcrypt
   - Secure session management
   - CSRF protection
   - Audit logging

4. **User Experience**:
   - Login redirect with callback URL preservation
   - Email verification workflow
   - Password reset functionality

## Current Implementation Issues

1. **Dashboard Access Control Problem**:
   - Dashboard routes are currently misconfigured in the middleware
   - Regular users with USER role are incorrectly being redirected
   - The logs show repeated redirect attempts when users try to access '/dashboard'

2. **API Route Protection**:
   - Some API routes may not be properly categorized in the middleware
   - Authentication checks may be bypassed for some API endpoints

3. **Middleware Configuration**:
   - Some routes are missing from public routes list
   - Admin routes may be overly restrictive
   - Dashboard routes should be accessible to all authenticated users

4. **JWT Secret Management**:
   - Fallback secret being used when environment variable is missing
   - Potential security risk in development environments

## Recommended Immediate Fixes

### 1. Fix Dashboard Access for Regular Users

The middleware logs show that regular users with the USER role are being incorrectly identified as attempting to access admin routes when visiting '/dashboard'. The fix is to:

```typescript
// Update isAdminRoute function to properly exclude dashboard routes
function isAdminRoute(path: string): boolean {
  // First check if it's a dashboard route (which is not admin-only)
  if (isDashboardRoute(path)) {
    return false;
  }
  
  // Then check if it's in the admin routes list
  return adminRoutes.some(route => path.startsWith(route));
}
```

Alternatively, remove '/dashboard' from the adminRoutes array if it's incorrectly included.

### 2. Update Route Categorization

Ensure API routes are properly categorized:

```typescript
// Add missing API routes to the public routes array
const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/auth/check',
  '/api/auth/session',
  '/api/auth/verify-email',
  '/api/auth/reset-password',
  '/api/upload-chunk' // For file uploads
];
```

### 3. Ensure JWT Secret Security

Improve JWT secret management:

```typescript
// In middleware.ts
const secretKey = process.env.JWT_SECRET;
if (!secretKey) {
  console.error('JWT_SECRET is not set! This is a critical security issue in production.');
  // In production, you might want to terminate the application
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  // Use a fallback only in development
  secretKey = 'fallback-secret-for-development-only';
}
```

## Medium-Term Improvements

### 1. Enhanced Error Handling

Improve error visibility and troubleshooting:

```typescript
// Add structured error logging
function logAuthError(error: unknown, context: string) {
  const errorMessage = error instanceof Error 
    ? error.message 
    : 'Unknown error';
    
  console.error(`[Auth Error] ${context}: ${errorMessage}`, {
    timestamp: new Date().toISOString(),
    context,
    error: process.env.NODE_ENV === 'development' ? error : errorMessage
  });
}
```

### 2. Rate Limiting for Authentication

Implement rate limiting to prevent brute force attacks:

```typescript
import { rateLimit } from '@/lib/rate-limit';

// In login handler
export async function POST(request: NextRequest) {
  // Get IP for rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  
  // Check rate limit (5 attempts per minute)
  const rateLimited = await rateLimit(`login:${ip}`, 5, 60);
  if (rateLimited) {
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { status: 429 }
    );
  }
  
  // Continue with login logic...
}
```

### 3. Permission Caching

Add caching for permission checks to improve performance:

```typescript
import NodeCache from 'node-cache';

const permissionCache = new NodeCache({ stdTTL: 300 }); // 5 minutes

export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  const cacheKey = `${userId}:${permission}`;
  
  // Check cache first
  const cachedResult = permissionCache.get(cacheKey);
  if (cachedResult !== undefined) {
    return cachedResult as boolean;
  }
  
  // If not in cache, check database
  const result = await checkPermissionInDatabase(userId, permission);
  
  // Cache the result
  permissionCache.set(cacheKey, result);
  
  return result;
}
```

### 4. Comprehensive Audit Logging

Enhance security event logging:

```typescript
export async function logSecurityEvent(event: {
  userId: string;
  action: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'ACCESS_DENIED' | 'PERMISSION_CHANGE';
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}) {
  await prisma.securityLog.create({
    data: {
      userId: event.userId,
      action: event.action,
      resource: event.resource,
      resourceId: event.resourceId,
      details: event.details ? JSON.stringify(event.details) : null,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: new Date()
    }
  });
}
```

## Long-Term Security Roadmap

### 1. Implement Two-Factor Authentication

Add TOTP-based two-factor authentication:

```typescript
// Example implementation for 2FA setup and verification
export async function setupTOTP(userId: string): Promise<{ secret: string; uri: string }> {
  const secret = authenticator.generateSecret();
  const uri = authenticator.keyuri(userId, 'WebAuth App', secret);
  
  await prisma.user.update({
    where: { id: userId },
    data: { 
      twoFactorSecret: secret,
      twoFactorEnabled: false // Requires verification first
    }
  });
  
  return { secret, uri };
}

export async function verifyAndEnableTOTP(userId: string, token: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { twoFactorSecret: true }
  });
  
  if (!user?.twoFactorSecret) return false;
  
  const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
  
  if (isValid) {
    await prisma.user.update({
      where: { id: userId },
      data: { twoFactorEnabled: true }
    });
  }
  
  return isValid;
}
```

### 2. Enhanced Session Management

Implement session awareness and device tracking:

```typescript
// Enhanced session creation with device awareness
export async function createSession(user: SessionUser, request: Request): Promise<void> {
  const userAgent = request.headers.get('user-agent') || 'Unknown';
  const ipAddress = request.headers.get('x-forwarded-for') || 'Unknown';
  
  // Generate a unique session ID
  const sessionId = crypto.randomUUID();
  
  // Store session in database for tracking
  await prisma.activeSession.create({
    data: {
      id: sessionId,
      userId: user.userId,
      userAgent,
      ipAddress,
      lastActive: new Date(),
      expiresAt: new Date(Date.now() + SESSION_CONSTANTS.MAX_AGE * 1000)
    }
  });
  
  // Create JWT with session ID reference
  const jwt = await generateJWT({
    ...user,
    sessionId
  });
  
  // Set cookie as before
  cookies().set(SESSION_CONSTANTS.COOKIE_NAME, jwt, DEFAULT_SESSION_OPTIONS);
}

// Session management UI to allow users to view and terminate sessions
export async function listActiveSessions(userId: string) {
  return prisma.activeSession.findMany({
    where: {
      userId,
      expiresAt: { gt: new Date() }
    },
    orderBy: { lastActive: 'desc' }
  });
}

export async function terminateSession(userId: string, sessionId: string) {
  return prisma.activeSession.delete({
    where: {
      id: sessionId,
      userId // Ensure user can only terminate their own sessions
    }
  });
}
```

### 3. API Key Management

Implement secure API key generation and management for programmatic access:

```typescript
// Generate secure API key
export async function generateApiKey(userId: string, name: string, permissions: string[]): Promise<string> {
  // Generate a secure random key
  const apiKey = `ak_${crypto.randomUUID().replace(/-/g, '')}`;
  const hashedKey = await bcrypt.hash(apiKey, 10);
  
  // Store the hashed key in database
  await prisma.apiKey.create({
    data: {
      userId,
      name,
      key: hashedKey,
      permissions,
      lastUsed: null,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  });
  
  // Return the plain key (will only be shown once)
  return apiKey;
}

// API key middleware for verification
export async function validateApiKey(request: NextRequest): Promise<{
  valid: boolean;
  userId?: string;
  permissions?: string[];
}> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { valid: false };
  }
  
  const apiKey = authHeader.substring(7);
  
  // Find all active API keys
  const allApiKeys = await prisma.apiKey.findMany({
    where: {
      expiresAt: { gt: new Date() }
    }
  });
  
  // Check each key (since we can't query by hashed value)
  for (const storedKey of allApiKeys) {
    const match = await bcrypt.compare(apiKey, storedKey.key);
    if (match) {
      // Update last used timestamp
      await prisma.apiKey.update({
        where: { id: storedKey.id },
        data: { lastUsed: new Date() }
      });
      
      return {
        valid: true,
        userId: storedKey.userId,
        permissions: storedKey.permissions
      };
    }
  }
  
  return { valid: false };
}
```

## Conclusion

This analysis identifies several immediate issues that need to be addressed, particularly with dashboard access for regular users and API route categorization. The middleware logs reveal that there's confusion in the role-based access control system that needs to be fixed.

By implementing the suggested fixes and following the medium and long-term improvement roadmap, the application's authentication and authorization system will be more secure, reliable, and maintainable. 