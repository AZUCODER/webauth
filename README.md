# WebAuth - Enterprise-Grade Next.js Authentication & Authorization Platform

A comprehensive, production-ready authentication and authorization system built with Next.js 15, TypeScript, and Prisma. This platform provides enterprise-grade security features including role-based access control, audit logging, session management, and advanced content management capabilities.

## 🚀 Key Features

### 🔐 Advanced Authentication
- **JWT-based authentication** with HTTP-only cookies and automatic refresh
- **Multi-provider support** (Google, TikTok, WeChat) via OAuth
- **Email verification** with secure token-based flows
- **Password reset** with secure token expiration
- **Two-factor authentication** support (infrastructure ready)
- **Account lockout** protection against brute force attacks
- **Session management** with device tracking and IP monitoring

### 🛡️ Enterprise Authorization
- **Role-based access control (RBAC)** with granular permissions
- **Resource-action based permissions** (`resource:action` pattern)
- **User-specific permission overrides** for fine-grained control
- **Permission caching** for optimal performance
- **Audit logging** for compliance and security monitoring
- **Middleware-based route protection** with automatic redirects

### 📝 Content Management System
- **Rich text editor** powered by TiptapJS with advanced formatting
- **Image upload** with Ali OSS integration and chunk upload support
- **Post management** with categories, featured posts, and SEO optimization
- **Content moderation** with draft/published status management
- **SEO-friendly URLs** with automatic slug generation

### 🎨 Modern UI/UX
- **Responsive design** with mobile-first approach
- **Dark/light theme** support with system preference detection
- **Component library** built on Radix UI primitives
- **Advanced data tables** with sorting, filtering, and pagination
- **Interactive charts** and analytics dashboard
- **Accessibility compliant** with ARIA standards

### 🔧 Developer Experience
- **TypeScript** with strict type checking
- **Server Actions** for seamless client-server communication
- **Form validation** with Zod schemas
- **Error handling** with comprehensive error boundaries
- **Hot reloading** with development optimizations
- **ESLint & Prettier** configuration for code quality

## 📊 Technology Stack

### Core Framework
- **Next.js 15** - App Router with Server Components
- **React 19** - Latest React features and hooks
- **TypeScript 5** - Strict type safety throughout

### Backend & Database
- **Prisma ORM** - Type-safe database operations
- **PostgreSQL** - Primary database (configurable)
- **Server Actions** - Native Next.js server-side functions

### Authentication & Security
- **jose** - JWT token handling
- **bcryptjs** - Password hashing
- **Custom session management** - Secure session handling
- **Rate limiting** - Built-in protection mechanisms

### UI & Styling
- **Tailwind CSS 4** - Modern utility-first styling
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Modern icon library

### Development Tools
- **ESLint 9** - Code linting and quality checks
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🏗️ Architecture Overview

### Directory Structure
```
webauth/
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets and images
├── src/
│   ├── actions/           # Server actions for data mutations
│   ├── app/               # Next.js app router pages
│   │   ├── (admin)/       # Admin dashboard layout group
│   │   ├── (auth)/        # Authentication layout group
│   │   ├── (client)/      # Public client layout group
│   │   └── api/           # API routes
│   ├── components/        # Reusable UI components
│   ├── config/           # Application configuration
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries and services
│   ├── middleware.ts     # Global middleware
│   ├── styles/           # Global styles and CSS
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
└── docs/                 # Project documentation
```

### Database Schema
The application uses a comprehensive database schema with:
- **User management** with profiles and social accounts
- **Permission system** with roles and granular permissions
- **Session tracking** with device and IP information
- **Content management** with posts and categories
- **Audit logging** for security and compliance
- **Token management** for various verification flows

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** (LTS recommended)
- **npm/yarn/pnpm** package manager
- **PostgreSQL 12+** database
- **Git** for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/webauth.git
   cd webauth
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/webauth_db"
   
   # JWT Configuration
   JWT_SECRET="your-super-secure-jwt-secret-key-here"
   
   # Application URLs
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   NEXT_PUBLIC_API_URL="http://localhost:3000/api"
   
   # Email Configuration (Resend)
   RESEND_API_KEY="your-resend-api-key"
   EMAIL_FROM="noreply@yourdomain.com"
   COMPANY_NAME="Your Company Name"
   LOGO_URL="https://yourdomain.com/logo.svg"
   
   # Ali OSS Configuration (Optional)
   OSS_BUCKET_NAME="your-bucket-name"
   OSS_ENDPOINT="oss-region.aliyuncs.com"
   OSS_ACCESS_KEY_ID="your-access-key"
   OSS_ACCESS_KEY_SECRET="your-secret-key"
   
   # Development
   NODE_ENV="development"
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   
   # Seed the database (optional)
   npx prisma db seed
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ | - |
| `JWT_SECRET` | Secret key for JWT signing | ✅ | - |
| `NEXT_PUBLIC_APP_URL` | Public application URL | ✅ | - |
| `RESEND_API_KEY` | Resend email service API key | ✅ | - |
| `EMAIL_FROM` | Default sender email address | ✅ | - |
| `OSS_BUCKET_NAME` | Ali OSS bucket name | ❌ | - |
| `OSS_ENDPOINT` | Ali OSS endpoint | ❌ | - |
| `COMPANY_NAME` | Company name for emails | ❌ | WebAuth |

### Database Configuration

The application supports PostgreSQL by default. To use a different database:

1. Update the `provider` in `prisma/schema.prisma`
2. Update your `DATABASE_URL` environment variable
3. Run migrations: `npx prisma migrate dev`

## 🏷️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev # Run migrations
npx prisma db seed   # Seed database
npx prisma generate  # Generate Prisma client

# Deployment
npm run deploy-dev   # Build without mangling (development)
```

## 🚀 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Set production environment variables**
   - Update `NODE_ENV` to "production"
   - Use secure `JWT_SECRET`
   - Configure production database
   - Set up email service

3. **Run database migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the application**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 📚 Documentation

### Core Concepts

- **[Session Management](src/lib/session/README.md)** - Comprehensive session handling
- **[Authorization System](docs/authorization.md)** - Role-based permissions
- **[API Documentation](docs/api.md)** - Server actions and API routes
- **[Database Schema](docs/database.md)** - Data model relationships

### Development Guides

- **[Component Development](docs/components.md)** - UI component guidelines
- **[Form Handling](docs/forms.md)** - Form validation and submission
- **[State Management](docs/state.md)** - Client-side state patterns
- **[Testing](docs/testing.md)** - Testing strategies and examples

## 🛡️ Security Features

- **CSRF Protection** - Built-in request validation
- **XSS Prevention** - Content sanitization
- **SQL Injection Prevention** - Prisma ORM protection
- **Rate Limiting** - API endpoint protection
- **Session Security** - HTTP-only cookies, secure flags
- **Password Security** - bcrypt hashing with salt
- **Token Expiration** - Automatic token invalidation
- **Audit Logging** - Comprehensive activity tracking

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation for new features
- Follow the existing code style
- Add proper error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing framework
- **Prisma Team** - For the excellent ORM
- **Radix UI** - For accessible components
- **Tailwind CSS** - For the utility-first approach
- **Resend** - For reliable email delivery

## 📞 Support

- **GitHub Issues** - Bug reports and feature requests
- **Documentation** - Comprehensive guides in `/docs`
- **Community** - Join our Discord server
- **Email** - support@webauth.com

---

Built with ❤️ by the WebAuth Team
