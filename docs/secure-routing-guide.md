# Secure Routing and API Endpoints Guide

## Introduction

This guide provides best practices for implementing secure routes and API endpoints in our Next.js application, building on our existing authentication and authorization infrastructure.

## Route Protection

### Client-Side Route Protection

While server-side protection is critical, client-side route guards improve user experience by preventing navigation to unauthorized routes:

```tsx
// src/components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { checkSessionStatus } from "@/lib/session/client";
import { Spinner } from "@/components/ui/spinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
}

export function ProtectedRoute({ 
  children, 
  requiredPermissions = [] 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { isValid } = await checkSessionStatus();
        
        if (!isValid) {
          router.push('/login');
          return;
        }
        
        if (requiredPermissions.length) {
          const hasRequiredPermissions = await checkPermissions(requiredPermissions);
          if (!hasRequiredPermissions) {
            router.push('/unauthorized');
            return;
          }
        }
        
        setAuthorized(true);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [router, requiredPermissions]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>;
  }
  
  return authorized ? <>{children}</> : null;
}

// Client-side permission check
async function checkPermissions(permissions: string[]): Promise<boolean> {
  try {
    const response = await fetch('/api/auth/check-permissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions }),
    });
    
    if (!response.ok) return false;
    
    const data = await response.json();
    return data.hasPermission;
  } catch (error) {
    console.error('Permission check failed:', error);
    return false;
  }
}
```

### Server-Side Route Protection (Middleware)

Our middleware provides protection for all routes, but here are some enhancements:

```typescript
// src/middleware.ts - Enhancing existing middleware
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_CONSTANTS } from '@/lib/session/constants'

// Define routes with required permissions
const PERMISSION_REQUIRED_ROUTES: Record<string, string[]> = {
  '/admin': ['admin:access'],
  '/dashboard': ['dashboard:access'],
  '/posts/add': ['posts:create'],
  '/posts/edit': ['posts:update'],
  '/posts/delete': ['posts:delete'],
  '/users': ['users:list'],
  '/settings': ['settings:access'],
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if user has session cookie
  const hasSessionCookie = request.cookies.has(SESSION_CONSTANTS.COOKIE_NAME)
  
  // Handle protected routes (redirect to login if no session)
  if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    if (!hasSessionCookie) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Additional security header for protected routes
    const response = NextResponse.next()
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    return response
  }
  
  // Handle auth routes (redirect to dashboard if already logged in)
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }
  
  // Add security headers to all responses
  const response = NextResponse.next()
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }
  
  return response
}
```

## API Endpoint Security

### Secure API Route Pattern

For API routes in Next.js, use this secure pattern:

```typescript
// src/app/api/protected-resource/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session/manager';
import { hasPermission } from '@/lib/authorization/permissions';
import prisma from '@/lib/prisma';
import { ZodSchema } from 'zod';

// Secure handler wrapper
async function withAuth<T>(
  request: NextRequest,
  handler: (session: SessionUser, data: T) => Promise<NextResponse>,
  options: {
    requiredPermission?: string;
    schema?: ZodSchema<T>;
  } = {}
) {
  try {
    // 1. Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check authorization (if permission specified)
    if (options.requiredPermission) {
      const permitted = await hasPermission(options.requiredPermission);
      if (!permitted) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    
    // 3. Validate input data (if schema provided)
    let data: any = {};
    if (options.schema) {
      try {
        // For GET requests
        if (request.method === 'GET') {
          const url = new URL(request.url);
          const queryData = Object.fromEntries(url.searchParams);
          data = options.schema.parse(queryData);
        } 
        // For other methods with body
        else {
          const body = await request.json();
          data = options.schema.parse(body);
        }
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid input data', details: error },
          { status: 400 }
        );
      }
    }

    // 4. Execute handler with valid session and data
    return await handler(session, data);
    
  } catch (error) {
    console.error(`API error:`, error);
    
    // 5. Standardized error handling
    return NextResponse.json(
      { 
        error: 'Server error',
        message: process.env.NODE_ENV === 'development' 
          ? error.message 
          : 'Something went wrong' 
      },
      { status: 500 }
    );
  }
}

// Example: GET handler using the secure pattern
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (session) => {
      // Your secure business logic here
      const items = await prisma.secureResource.findMany({
        where: { userId: session.userId }
      });
      
      return NextResponse.json({ items });
    },
    { requiredPermission: 'resources:read' }
  );
}

// Example: POST handler with data validation
export async function POST(request: NextRequest) {
  const schema = z.object({
    name: z.string().min(3),
    description: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE'])
  });
  
  return withAuth(
    request,
    async (session, data) => {
      // Create resource with validated data
      const newItem = await prisma.secureResource.create({
        data: {
          ...data,
          userId: session.userId
        }
      });
      
      // Log action
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'CREATE',
          resource: 'SecureResource',
          resourceId: newItem.id,
          metadata: JSON.stringify(data)
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        item: newItem 
      });
    },
    { 
      requiredPermission: 'resources:create',
      schema 
    }
  );
}
```

## Working with Posts - Secure Implementation Example

Drawing from our project's Post model, here's a complete secure implementation example:

### 1. Post Schema Enhancement

```typescript
// src/types/post.ts
import { z } from 'zod';
import { PostStatus } from '@prisma/client';

// Validation schema for creating/updating posts
export const postSchema = z.object({
  title: z.string().min(3).max(200),
  content: z.string().min(10),
  excerpt: z.string().max(500).optional(),
  featuredImage: z.string().url().optional(),
  status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED, PostStatus.ARCHIVED]),
  isFeatured: z.boolean().default(false),
  categoryId: z.string().optional(),
});

export type PostFormData = z.infer<typeof postSchema>;

// Schema for post listing/filtering
export const postFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED, PostStatus.ARCHIVED]).optional(),
  search: z.string().optional(),
  categoryId: z.string().optional(),
});

export type PostFilter = z.infer<typeof postFilterSchema>;
```

### 2. Secure API Route for Posts

```typescript
// src/app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session/manager';
import { hasPermission, can } from '@/lib/authorization/permissions';
import prisma from '@/lib/prisma';
import { postFilterSchema, postSchema } from '@/types/post';

// GET: List posts with filtering and pagination
export async function GET(request: NextRequest) {
  return withAuth(
    request,
    async (session, filter) => {
      // Build query conditions
      const where = {
        ...(filter.status && { status: filter.status }),
        ...(filter.categoryId && { categoryId: filter.categoryId }),
        ...(filter.search && { 
          OR: [
            { title: { contains: filter.search, mode: 'insensitive' } },
            { content: { contains: filter.search, mode: 'insensitive' } },
          ]
        }),
        // Only admins can see all posts, others see only their own
        ...(session.role !== 'ADMIN' && { authorId: session.userId })
      };
      
      // Get paginated posts
      const posts = await prisma.post.findMany({
        where,
        skip: (filter.page - 1) * filter.limit,
        take: filter.limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          category: true,
        },
        orderBy: { updatedAt: 'desc' },
      });
      
      // Get total count for pagination
      const total = await prisma.post.count({ where });
      
      return NextResponse.json({
        posts,
        pagination: {
          page: filter.page,
          limit: filter.limit,
          totalPages: Math.ceil(total / filter.limit),
          totalItems: total,
        },
      });
    },
    { 
      requiredPermission: 'posts:read',
      schema: postFilterSchema 
    }
  );
}

// POST: Create a new post
export async function POST(request: NextRequest) {
  return withAuth(
    request,
    async (session, data) => {
      // Create slug from title
      let slug = slugify(data.title, { lower: true, strict: true });
      
      // Ensure slug uniqueness
      const existingPostWithSlug = await prisma.post.findFirst({ 
        where: { slug } 
      });
      
      if (existingPostWithSlug) {
        const randomStr = Math.random().toString(36).substring(2, 6);
        slug = `${slug}-${randomStr}`;
      }
      
      // Create post with validated data
      const post = await prisma.post.create({
        data: {
          ...data,
          slug,
          authorId: session.userId,
          publishedAt: data.status === "PUBLISHED" ? new Date() : null,
        },
      });
      
      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'CREATE',
          resource: 'Post',
          resourceId: post.id,
          metadata: JSON.stringify({
            title: post.title,
            status: post.status
          })
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        post
      });
    },
    { 
      requiredPermission: 'posts:create',
      schema: postSchema 
    }
  );
}
```

### 3. Secure API Route for a Specific Post

```typescript
// src/app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session/manager';
import { hasPermission, can } from '@/lib/authorization/permissions';
import prisma from '@/lib/prisma';
import { postSchema } from '@/types/post';

// Helper to check post ownership or admin status
async function canAccessPost(postId: string, userId: string, role: string) {
  if (role === 'ADMIN') return true;
  
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true }
  });
  
  return post?.authorId === userId;
}

// GET: Retrieve a specific post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(
    request,
    async (session) => {
      const post = await prisma.post.findUnique({
        where: { id: params.id },
        include: {
          author: {
            select: {
              id: true,
              name: true,
            },
          },
          category: true,
        },
      });
      
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      
      // Check if user can access this post
      const hasAccess = await canAccessPost(
        post.id,
        session.userId,
        session.role
      );
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Not authorized to view this post' },
          { status: 403 }
        );
      }
      
      return NextResponse.json({ post });
    },
    { requiredPermission: 'posts:read' }
  );
}

// PUT: Update a post
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(
    request,
    async (session, data) => {
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: params.id },
      });
      
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      
      // Check if user can update this post
      const hasAccess = await canAccessPost(
        post.id, 
        session.userId,
        session.role
      );
      
      if (!hasAccess) {
        return NextResponse.json(
          { error: 'Not authorized to update this post' },
          { status: 403 }
        );
      }
      
      // Handle slug update if title changed
      let slug = post.slug;
      if (data.title && post.title !== data.title) {
        slug = slugify(data.title, { lower: true, strict: true });
        
        // Check for duplicate slug
        const existingPostWithSlug = await prisma.post.findFirst({
          where: { 
            slug,
            id: { not: post.id }
          }
        });
        
        if (existingPostWithSlug) {
          const randomStr = Math.random().toString(36).substring(2, 6);
          slug = `${slug}-${randomStr}`;
        }
      }
      
      // Handle publishedAt field
      let publishedAt = post.publishedAt;
      if (!publishedAt && data.status === "PUBLISHED") {
        publishedAt = new Date();
      }
      
      // Update the post
      const updatedPost = await prisma.post.update({
        where: { id: params.id },
        data: {
          ...data,
          slug,
          publishedAt,
        },
      });
      
      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'UPDATE',
          resource: 'Post',
          resourceId: updatedPost.id,
          metadata: JSON.stringify({
            title: updatedPost.title,
            status: updatedPost.status
          })
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        post: updatedPost 
      });
    },
    { 
      requiredPermission: 'posts:update',
      schema: postSchema 
    }
  );
}

// DELETE: Remove a post
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(
    request,
    async (session) => {
      // Check if post exists
      const post = await prisma.post.findUnique({
        where: { id: params.id },
      });
      
      if (!post) {
        return NextResponse.json(
          { error: 'Post not found' },
          { status: 404 }
        );
      }
      
      // Check if user can delete this post
      const hasAccess = await canAccessPost(
        post.id,
        session.userId,
        session.role
      );
      
      if (!hasAccess && session.role !== 'ADMIN') {
        return NextResponse.json(
          { error: 'Not authorized to delete this post' },
          { status: 403 }
        );
      }
      
      // Delete the post
      await prisma.post.delete({
        where: { id: params.id },
      });
      
      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.userId,
          action: 'DELETE',
          resource: 'Post',
          resourceId: params.id,
          metadata: JSON.stringify({
            postId: params.id,
            title: post.title
          })
        }
      });
      
      return NextResponse.json({ success: true });
    },
    { requiredPermission: 'posts:delete' }
  );
}
```

## Security Best Practices Summary

1. **Authentication First**: Always check for valid session before processing any protected route or API request.

2. **Granular Permissions**: Use RBAC and resource-specific permissions to ensure precise access control.

3. **Input Validation**: Validate all user input using Zod schemas before processing.

4. **Resource Ownership**: Check if the authenticated user owns or has rights to access specific resources.

5. **Audit Logging**: Log all important security actions, especially for sensitive operations.

6. **Error Handling**: Use standardized error responses without leaking internal details in production.

7. **Security Headers**: Apply appropriate security headers to all responses.

8. **Rate Limiting**: Implement rate limiting on sensitive endpoints to prevent abuse.

9. **JWT Security**: Use secure, HTTP-only cookies for session management.

10. **HTTPS Only**: Enforce HTTPS in production environments.

By following these practices, our routes and API endpoints will maintain a high security standard while providing a seamless user experience. 