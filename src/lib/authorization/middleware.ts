import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { hasPermission, can } from '@/lib/authorization/permissions'

// Middleware to protect actions by permission
export async function withPermission(
  req: NextRequest,
  permissionName: string,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const hasAccess = await hasPermission(permissionName)
  
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return handler(req)
}

// Resource-action middleware
export async function withResourcePermission(
  req: NextRequest,
  action: string,
  resource: string,
  handler: (req: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withPermission(req, `${resource}:${action}`, handler)
}
