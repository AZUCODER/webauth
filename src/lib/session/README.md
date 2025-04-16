# Session Management System

This directory contains a robust session management system for Next.js applications using server components and server actions.

## Features

- ✅ Secure JWT-based authentication
- 🍪 HTTP-only cookie session storage
- 🔄 Automatic session refresh mechanism
- 📊 Session metadata tracking in database
- 📝 Type-safe interfaces with TypeScript
- 🚀 Next.js App Router and Server Actions compatible
- 🛡️ Protection against common attack vectors
- 🔐 Role-based access control support

## Architecture

The system uses a streamlined architecture:

- `manager.ts` - Core implementation with all session management logic
- `constants.ts` - Configuration constants for sessions
- `types.ts` - TypeScript interfaces for type safety

All core functions are marked with `'use server'` directive to enable direct use in both server components and client components (via server actions).

## Usage

### Authentication Flow

```typescript
// In your login action
import { createSession } from '@/lib/session/manager';

// Create a new session
await createSession({
  userId: user.id,
  username: user.name || '',
  email: user.email,
  role: user.role,
  lastLogin: new Date().toISOString()
});
```

### Getting the Current User

```typescript
// In your server component or action
import { getSession } from '@/lib/session/manager';

// Get the current session
const session = await getSession();

if (!session) {
  // User is not authenticated 
  redirect('/login');
}

// User is authenticated, you can access session data
console.log(session.userId, session.username, session.role);
```

### Implementing Authorization

```typescript
// Role-based access control
import { getSession } from '@/lib/session/manager';

// Check if user has required role
async function checkUserRole(requiredRole: string): Promise<boolean> {
  const session = await getSession();
  
  if (!session) {
    return false;
  }
  
  return session.role === requiredRole;
}

// In your protected component or action
if (!(await checkUserRole('admin'))) {
  // User doesn't have required role
  throw new Error('Unauthorized: Admin access required');
}
```

### Logout

```typescript
// In your logout action
import { destroySession } from '@/lib/session/manager';

// Destroy the current session
await destroySession();
```

### Session Status and Refresh

```typescript
// Check detailed session status
import { checkSessionStatus, refreshSession } from '@/lib/session/manager';

const status = await checkSessionStatus();

if (status.isExpired) {
  // Session has expired
  redirect('/login');
}

if (status.remainingTime && status.remainingTime < 300) {
  // Session expires in less than 5 minutes
  await refreshSession();
}
```

### Client-Side Authentication

For client components, use the `useAuth` hook:

```typescript
// In your client component
'use client';
import { useAuth } from '@/hooks/useAuth';

export function ProfileComponent() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  
  if (isLoading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Please log in</div>;
  
  return (
    <div>
      <h1>Welcome, {user?.username}</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Log out</button>
    </div>
  );
}
```

## Configuration

Session configuration is managed through the `constants.ts` file:

- `SESSION_CONSTANTS.COOKIE_NAME`: Name of the session cookie
- `SESSION_CONSTANTS.MAX_AGE`: Session duration in seconds (default: 24 hours)
- `SESSION_CONSTANTS.REFRESH_THRESHOLD`: When to refresh the session (default: 30 minutes before expiry)
- `DEFAULT_SESSION_OPTIONS`: Default cookie options

## Security Considerations

This session management system implements several security best practices:

- **HTTP-Only Cookies**: Prevents client-side JavaScript from accessing cookies
- **Secure Cookies**: In production, cookies are only sent over HTTPS
- **SameSite Policy**: Default 'lax' setting to prevent CSRF attacks
- **Session Refresh**: Short-lived tokens are automatically refreshed
- **JWT Signing**: Uses HMAC SHA-256 algorithm for token signatures
- **Session Tracking**: All session activity is logged for security monitoring
- **Environment Variables**: JWT secret stored in environment variables

## Implementation Requirements

- Requires `JWT_SECRET` environment variable to be set
- Designed for Next.js 13+ with App Router
- Uses Prisma for database operations
- Compatible with any database supported by Prisma

## Error Handling

The system provides detailed error types:

```typescript
interface SessionError extends Error {
  code: 'SESSION_EXPIRED' | 'SESSION_INVALID' | 'SESSION_NOT_FOUND' | 'JWT_INVALID';
  timestamp: string;
}
```

Errors are consistently logged with timestamps and handled gracefully to prevent application crashes.

## Session Metadata

The system tracks important session metadata:

```typescript
interface SessionMetadata {
  createdAt: string;
  lastAccessed: string;
  expiresAt: string;
  userAgent?: string;
  ipAddress?: string;
}
```

This enables security monitoring and user awareness of their login activity. 