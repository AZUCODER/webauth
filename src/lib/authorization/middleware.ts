import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hasPermission} from '@/lib/authorization/permissions'
import { getSession } from '@/lib/session/manager'

/**
 * Middleware to protect API routes with permission-based authorization
 * 
 * @param req - The Next.js request object
 * @param permissionName - The permission name required to access this route
 * @param handler - The handler function to execute if authorized
 * @returns NextResponse
 * 
 * @example
 * // Usage in an API route:
 * export async function GET(req: NextRequest) {
 *   return withPermission(req, 'users:read', async () => {
 *     const users = await prisma.user.findMany();
 *     return NextResponse.json({ users });
 *   });
 * }
 */
export async function withPermission(
  req: NextRequest,
  permissionName: string,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // First check if user is authenticated
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Then check if user has the required permission
    const hasAccess = await hasPermission(permissionName);
    
    if (!hasAccess) {
      return NextResponse.json(
        { error: `Insufficient permissions. Required: "${permissionName}"` },
        { status: 403 }
      );
    }
    
    // If authorized, execute the handler
    return handler(req);
  } catch (error: unknown) {
    console.error(`Authorization middleware error:`, error);
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'Unknown error';
      
    return NextResponse.json(
      { 
        error: 'Server error during authorization',
        message: process.env.NODE_ENV === 'development' 
          ? errorMessage 
          : 'Something went wrong' 
      },
      { status: 500 }
    );
  }
}

/**
 * Resource-action middleware for API routes
 * 
 * @param req - The Next.js request object
 * @param action - The action being performed (e.g., 'create', 'read')
 * @param resource - The resource being accessed (e.g., 'users', 'posts')
 * @param handler - The handler function to execute if authorized
 * @returns NextResponse
 * 
 * @example
 * // Usage in an API route:
 * export async function POST(req: NextRequest) {
 *   return withResourcePermission(req, 'create', 'posts', async () => {
 *     const data = await req.json();
 *     const post = await prisma.post.create({ data });
 *     return NextResponse.json({ post }, { status: 201 });
 *   });
 * }
 */
export async function withResourcePermission(
  req: NextRequest,
  action: string,
  resource: string,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withPermission(req, `${resource}:${action}`, handler);
}

/**
 * Example of using the middleware in an API route
 *
 * src/app/api/users/route.ts:
 * 
 * ```typescript
 * import { NextRequest, NextResponse } from 'next/server';
 * import { withPermission } from '@/lib/authorization/middleware';
 * import { prisma } from '@/lib/prisma';
 * 
 * export async function GET(req: NextRequest) {
 *   return withPermission(req, 'users:list', async () => {
 *     const users = await prisma.user.findMany({
 *       select: {
 *         id: true,
 *         name: true,
 *         email: true,
 *         role: true,
 *       }
 *     });
 *     
 *     return NextResponse.json({ users });
 *   });
 * }
 * 
 * export async function POST(req: NextRequest) {
 *   return withResourcePermission(req, 'create', 'users', async () => {
 *     const data = await req.json();
 *     
 *     try {
 *       const user = await prisma.user.create({
 *         data: {
 *           name: data.name,
 *           email: data.email,
 *           // Other fields...
 *         }
 *       });
 *       
 *       return NextResponse.json({ user }, { status: 201 });
 *     } catch (error) {
 *       return NextResponse.json({ error: 'Failed to create user' }, { status: 400 });
 *     }
 *   });
 * }
 * ```
 */
