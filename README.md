# WebAuth - Next.js Authentication System

A robust, secure, and type-safe authentication system built with Next.js, TypeScript, and Prisma.

## Features

- 🔐 JWT-based authentication with HTTP-only cookies
- 📧 Email verification and password reset flows
- 🛡️ Route protection via middleware
- 🚪 Server-side authentication with Next.js server actions
- 🪝 Client-side authentication hooks for React components
- 📊 Session monitoring and login history
- 📱 Responsive and accessible authentication UI
- 🔄 Automatic session refresh
- 🧪 Type-safe with TypeScript and Zod validation

## Technology Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM with your preferred database
- **Authentication**: JWT (jose library)
- **Form Validation**: Zod
- **Styling**: Tailwind CSS
- **Email**: Integration with email service providers

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Database (PostgreSQL recommended)

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/webauth.git
cd webauth
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```
# Create a .env file with the following
DATABASE_URL="your-database-connection-string"
JWT_SECRET="your-secure-jwt-secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
EMAIL_SERVER_USER="your-email-user"
EMAIL_SERVER_PASSWORD="your-email-password"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT=587
EMAIL_FROM="noreply@example.com"
```

4. Initialize the database
```bash
npx prisma migrate dev
```

5. Start the development server
```bash
npm run dev
# or
yarn dev
```

## Authentication Documentation

The authentication system provides a comprehensive solution for user identity management. For detailed documentation, see:

- [Authentication System Documentation](docs/Auth.md)
- [Session Management API](src/lib/session/README.md)

## Key Components

- **Session Management**: Secure JWT-based sessions with automatic refresh
- **User Registration**: Email verification flow for new accounts
- **Password Recovery**: Secure password reset mechanism
- **Route Protection**: Both client and server-side route guards
- **Role-based Access**: Support for user roles and permissions
- **Session Monitoring**: Track login history and active sessions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
