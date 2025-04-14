# Next.js Authentication & Authorization System

## Core Features
- JWT-based authentication (jose library)
- Secure token refresh mechanism
- Email verification (Resend)
- Two-factor authentication (Alibaba Cloud SMS)
- Session management (Redis + PostgreSQL)
- Role-based authorization

## Database Architecture

### PostgreSQL (Core Data)
```prisma

```

### Redis (Session & Token Store)
- `sessions:{userId}:{sessionId}` → Session data (JSON)
- `sessions:user:{userId}` → Set of active session IDs
- `tokens:refresh:{tokenId}` → Refresh token data
- `tokens:blacklist:{jti}` → Blacklisted token expiration
- `verification:{token}` → Email verification user ID
- `2fa:{userId}` → 2FA code with expiration

## Authentication Flow

### Registration
1. User submits registration form
2. Server validates input with Zod schema
3. Check for existing user
4. Hash password with bcrypt
5. Create user record in PostgreSQL
6. Generate verification token, store in Redis
7. Send verification email via Resend
8. Return success response with instructions

### Email Verification
1. User clicks email verification link
2. Server retrieves user ID from Redis using token
3. Update user record (emailVerified = true)
4. Delete verification token from Redis
5. Redirect to login page

### Login
1. User submits credentials
2. Validate credentials & check email verification
3. If 2FA enabled:
   - Generate and store 6-digit code in Redis
   - Send SMS via Alibaba Cloud
   - Create temporary session cookie
   - Return response requesting 2FA code
4. If 2FA not enabled or verified:
   - Generate session ID
   - Create JWT access token (15m) and refresh token (7d)
   - Store session data in Redis
   - Set HTTP-only cookie with refresh token
   - Return access token to client
   - Redirect to dashboard

### Token Refresh
1. Client sends refresh token (automatic on expiry)
2. Server validates token and checks Redis for session
3. Generate new access token
4. Optionally rotate refresh token
5. Update Redis records
6. Return new tokens

### Logout
1. Client requests logout
2. Server invalidates Redis session
3. Clear client-side tokens and cookies
4. Redirect to login page

## Implementation Structure

### Server Actions (app/actions/auth.ts)
- `register`: User registration with validation
- `login`: Authentication with 2FA handling
- `verifyTwoFactor`: 2FA code verification
- `logout`: Session termination
- `refreshTokens`: Token refresh mechanism
- `resetPassword`: Password reset flow

### Utility Functions
- `generateTokens`: JWT creation with jose
- `verifyToken`: JWT validation
- `hashPassword`: Password hashing with bcrypt
- `sendVerificationEmail`: Email delivery with Resend
- `sendTwoFactorSms`: SMS delivery with Alibaba Cloud

### Client Components
- `RegisterForm`: Registration form with validation
- `LoginForm`: Authentication form
- `TwoFactorForm`: 2FA code entry
- `ProtectedRoute`: Authorization wrapper

### Middleware (middleware.ts)
- JWT validation for protected routes
- Role-based access control
- Request rate limiting

## Security Measures
- Password hashing (bcrypt, 12 rounds)
- HTTP-only, secure cookies for tokens
- Token rotation on suspicious activity
- Input validation with Zod
- CSRF protection via Next.js Forms
- Session timeout and absolute expiration
- Rate limiting on auth endpoints

## Environment Variables
```
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=secure-random-string
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Email (Resend)
RESEND_API_KEY=...

# SMS (Alibaba Cloud)
ALIBABA_ACCESS_KEY_ID=...
ALIBABA_ACCESS_KEY_SECRET=...
ALIBABA_SMS_SIGN_NAME=...
ALIBABA_SMS_TEMPLATE_CODE=...

# Redis
REDIS_URL=...
REDIS_TOKEN=...
```

## Implementation Approach
- Server Actions for auth endpoints (not API Routes)
- Zod for validation
- React Server Components where possible
- Edge compatibility via Redis

## Visual Authentication Flow

```
┌─────────────┐     ┌────────────────┐     ┌──────────────────┐
│  Register   │────►│ Verify Email   │────►│      Login       │
└─────────────┘     └────────────────┘     └──────────────────┘
                                                    │
                                                    ▼
                                           ┌──────────────────┐  Yes  ┌──────────────────┐
                                           │   2FA Enabled?   │──────►│   Verify 2FA     │
                                           └──────────────────┘       └──────────────────┘
                                                    │                         │
                                                   No                         │
                                                    │                         │
                                                    ▼                         ▼
                                           ┌──────────────────┐       ┌──────────────────┐
                                           │  Generate Tokens │◄──────┤   2FA Success    │
                                           └──────────────────┘       └──────────────────┘
                                                    │
                                                    ▼
                          ┌─────────────────────────────────────────────────┐
                          │                                                 │
                          ▼                                                 │
             ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
             │ Protected Routes │────►│ Token Expired?   │────►│  Token Refresh   │
             └──────────────────┘     └──────────────────┘     └──────────────────┘
                          │                                                 │
                          ▼                                                 │
             ┌──────────────────┐                                           │
             │     Logout      │                                           │
             └──────────────────┘                                           │
                          │                                                 │
                          └─────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌───────────────┐        ┌───────────────┐        ┌───────────────┐
│               │        │               │        │               │
│    Client     │◄──────►│ Server Action │◄──────►│     Redis     │
│   (Browser)   │        │ (Edge/Node.js)│        │ (Sessions,    │
│               │        │               │        │  Tokens, 2FA) │
└───────────────┘        └───────────────┘        └───────────────┘
                                 │
                                 │
                                 ▼
                         ┌───────────────┐
                         │               │
                         │  PostgreSQL   │
                         │  (User Data)  │
                         │               │
                         └───────────────┘
```

