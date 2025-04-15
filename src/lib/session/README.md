# Session Management System

This directory contains a robust session management system for Next.js applications using server components.

## Features

- Secure JWT-based authentication
- Cookie-based session storage
- Automatic session refresh
- Session metadata tracking
- Type-safe interfaces
- Next.js App Router and Server Actions compatible

## Usage

### Authentication Flow

```typescript
// In your login action
import { createSession } from '@/lib/session/actions';

// Create a new session
await createSession({
  userId: user.id,
  username: user.name || '',
  email: user.email,
  role: user.role,
  lastLogin: new Date().toISOString()
});
```

### Checking Authentication Status

```typescript
// In your server component or action
import { getSession } from '@/lib/session/actions';

// Get the current session
const session = await getSession();

if (!session) {
  // User is not authenticated 
  redirect('/login');
}

// User is authenticated, you can access session data
console.log(session.userId, session.username, session.role);
```

### Logout

```typescript
// In your logout action
import { destroySession } from '@/lib/session/actions';

// Destroy the current session
await destroySession();
```

### Session Status

```typescript
// Check detailed session status
import { checkSessionStatus } from '@/lib/session/actions';

const status = await checkSessionStatus();

if (status.isExpired) {
  // Session has expired
}

if (status.remainingTime && status.remainingTime < 300) {
  // Session expires in less than 5 minutes
}
```

## Configuration

Session configuration is managed through the `constants.ts` file:

- `SESSION_CONSTANTS.COOKIE_NAME`: Name of the session cookie
- `SESSION_CONSTANTS.MAX_AGE`: Session duration in seconds (default: 24 hours)
- `SESSION_CONSTANTS.REFRESH_THRESHOLD`: When to refresh the session (default: 30 minutes before expiry)
- `DEFAULT_SESSION_OPTIONS`: Default cookie options

## Implementation Notes

- Requires `JWT_SECRET` environment variable to be set
- Uses Next.js server actions (`'use server'`)
- Compatible with Next.js App Router
- Handles both creation and verification of JWT tokens

## Architecture

The system uses a two-part architecture:

1. `manager.ts` - Core implementation with all session management logic
2. `actions.ts` - Server actions that expose the manager functionality

This separation allows us to comply with Next.js's "only async functions can be exported from a 'use server' file" requirement while maintaining a clean implementation. 