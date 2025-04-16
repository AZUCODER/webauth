# Authentication and Authorization System

## Session Architecture

The application implements a robust JWT-based authentication system with these key components:

### Session Manager (src/lib/session/manager.ts)
* Core implementation handling JWT creation, verification, and management using jose library
* Includes functions for creating, retrieving, refreshing, and destroying sessions
* Stores session metadata in the database for tracking login history
* Uses secure HTTP-only cookies for session storage
* Automatically refreshes sessions approaching expiration
* Detailed error handling with typed error responses

### Server Actions (src/actions/auth)
* Server-side functions marked with 'use server' that expose authentication functionality
* Authentication workflows:
  * Registration (registerActions.ts): Creates accounts with email verification
  * Login (loginActions.ts): Validates credentials and creates sessions
  * Email Verification (verifyActions.ts): Handles email verification flow
  * Password Reset (passwordResetActions.ts): Manages password recovery
  * Logout (logoutActions.ts): Destroys sessions

### Token Management (src/lib/tokens)
* Secure token generation for email verification and password reset
* Database-backed token storage with expiration and invalidation
* Token lifecycle management (creation, validation, usage tracking)

### Client-Side Hook (src/hooks/useAuth.ts)
* React hook for client components to interact with authentication system
* Provides authentication state including loading status and user information
* Includes functions for checking auth status, logging out, and protecting routes 
* Interacts with API endpoints to maintain auth state

### Middleware (src/middleware.ts)
* Route protection at the network level
* Redirects unauthenticated users from protected routes to login
* Redirects authenticated users from auth routes (login/register) to dashboard

### API Routes
* /api/auth/check: Verifies authentication status for client components
* /api/auth/logout: Provides logout functionality for client components
* /api/sessions: Retrieves session history for the dashboard

## Authentication Flow

### 1. Registration Process
* User submits registration form with name, email, and password
* Server validates input and checks for existing accounts
* New user created with hashed password (using bcryptjs)
* Email verification token generated and stored in database
* Verification email sent to user's email address
* User redirected to login page with verification instructions

### 2. Email Verification
* User clicks verification link in email
* Server validates token against database record
* User's email marked as verified in database
* Welcome email sent to user
* User redirected to login page with success message

### 3. Login Process
* User submits credentials via LoginForm
* Server validates credentials and checks email verification status
* If not verified, sends new verification email
* If verified, calls createSession() with user information
* JWT token created and stored in HTTP-only cookie
* Session metadata recorded in database
* User redirected to dashboard

### 4. Session Verification
* Middleware checks for session cookie on protected routes
* Server components call getSession() to verify current user
* Client components use useAuth() hook to access authentication state
* Automatic session refresh when approaching expiration

### 5. Password Recovery
* User requests password reset via forgot password form
* Reset token generated and stored in database
* Reset link sent to user's email address
* User sets new password after token validation
* Previous sessions invalidated for security

### 6. Logout Process
* Server action destroySession() clears session cookie
* Client-side logout through API endpoint and useAuth().logout()
* User redirected to login page

## Security Features

### Route Protection
* Middleware redirects unauthenticated users from protected routes
* useAuth().requireAuth() protects client-side operations
* Server components verify session before displaying sensitive data

### JWT Security
* Signed tokens using HS256 algorithm with jose library
* Stored in HTTP-only cookies to prevent XSS attacks
* Environment variable JWT_SECRET for token encryption
* Short-lived tokens with automatic refresh mechanism

### Password Security
* Passwords hashed using bcryptjs with salt rounds
* Password reset flows with secure time-limited tokens
* No plain-text passwords stored or transmitted

### Session Monitoring
* Tracks IP address and user agent for each session
* Dashboard displays login history for security awareness
* API rate limiting for sensitive operations

### Token Management
* One-time use tokens for email verification and password reset
* Automatic invalidation of expired tokens
* Database tracking of token usage and status

## Dashboard Implementation

The dashboard (/dashboard) is a protected route that:
* Verifies authentication using getSession()
* Displays user information from the session
* Shows login history and session statistics
* Includes a session chart component that visualizes login patterns

## Best Practices

### Type Safety
* Strong typing with TypeScript interfaces for all session operations
* Well-defined error types and handling
* Zod schemas for input validation

### Error Handling
* Graceful degradation when sessions are invalid
* Logging of all session-related errors
* Clear error messages for debugging
* Consistent error response format

### Separation of Concerns
* Core session logic separate from server actions
* Client and server authentication clearly separated
* Token management isolated from authentication flows
* Well-documented API with README explaining usage

This authentication system provides comprehensive security while maintaining good user experience through features like automatic session refresh, email verification, and clear session status information.