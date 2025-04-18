# Permission and Role-Based Authorization Strategy

## Overview

This document outlines the authorization architecture that complements the authentication system. The authorization system uses a hybrid approach combining role-based access control (RBAC) with discretionary access control through user-specific permission overrides.

## Database Schema

The authorization system is built on three main models:

### Permission Model
```prisma
model Permission {
  id               String           @id @default(cuid())
  name             String           @unique
  description      String?
  resource         String           // The resource this permission applies to (e.g., "posts", "users")
  action           String           // The action allowed (e.g., "create", "read", "update", "delete")
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  // Relations
  rolePermissions  RolePermission[]
  userPermissions  UserPermission[]
}
```

### RolePermission Model
```prisma
model RolePermission {
  id               String     @id @default(cuid())
  role             Role
  permissionId     String
  permission       Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  createdAt        DateTime   @default(now())
  
  @@unique([role, permissionId])
  @@index([role])
  @@index([permissionId])
}
```

### UserPermission Model
```prisma
model UserPermission {
  id               String     @id @default(cuid())
  userId           String
  user             User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  permissionId     String
  permission       Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  granted          Boolean    @default(true) // true=allow, false=deny (override)
  
  createdAt        DateTime   @default(now())
  
  @@unique([userId, permissionId])
  @@index([userId])
  @@index([permissionId])
}
```

## Authorization Architecture

### Permission Structure
Permissions follow a resource-action naming pattern:
- Format: `{resource}:{action}`
- Examples: `posts:create`, `users:read`, `settings:manage`

This structure enables both coarse and fine-grained permission control.

### Authorization Flow

1. **User Authentication**:
   - User logs in and receives a session with role information
   - Session maintains the user's role (USER, ADMIN, MODERATOR, EDITOR)

2. **Permission Resolution**:
   - Each request that requires authorization follows this resolution path:
     1. Check for user-specific permission override
     2. If no override exists, check for role-based permission
     3. Default to denying access if no permission is found

3. **Role Hierarchy**:
   - Implicit role hierarchy with ADMIN at the top
   - Each role inherits permissions from less privileged roles
   - Explicit permissions still needed to be defined in RolePermission

## Implementation Components

### 1. Permission Seeding

Initialize core permissions and role assignments during application setup:

```typescript
// Key resources in the system
const resources = ['users', 'posts', 'profile', 'categories', 'settings']

// Common actions that can be performed on resources
const actions = ['create', 'read', 'update', 'delete', 'publish', 'manage']

// Permission mapping by role
const rolePermissions = {
  [Role.USER]: [
    'posts:read',
    'profile:read',
    'profile:update',
    'categories:read'
  ],
  [Role.EDITOR]: [
    'posts:create', 'posts:read', 'posts:update', 'posts:delete',
    'categories:read',
    'profile:read', 'profile:update'
  ],
  [Role.MODERATOR]: [
    'posts:read', 'posts:update', 'posts:delete', 'posts:publish',
    'categories:read', 'categories:create', 'categories:update',
    'users:read',
    'profile:read'
  ],
  [Role.ADMIN]: [] // Admin gets all permissions
}
```

### 2. Permission Checking Utilities

Core utilities for checking permissions:

```typescript
// Check if user has a specific permission
async function hasPermission(permissionName: string): Promise<boolean>

// Check if user has all of the specified permissions
async function hasAllPermissions(permissionNames: string[]): Promise<boolean>

// Check if user has any of the specified permissions
async function hasAnyPermission(permissionNames: string[]): Promise<boolean>

// Resource-action helper (shorthand for hasPermission)
async function can(action: string, resource: string): Promise<boolean>
```

### 3. Server-Side Authorization

Server components and API routes use these patterns:

```typescript
// In server components
const canEditPost = await can('update', 'posts')
if (!canEditPost) {
  return <AccessDenied message="You cannot edit posts" />
}

// For API routes
export async function POST(request: NextRequest) {
  const canCreateUser = await can('create', 'users')
  if (!canCreateUser) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  // Handle the request...
}
```

### 4. Client-Side Authorization

The `usePermissions` hook provides permission checking in client components:

```typescript
'use client'

function PostEditor() {
  const { can, loading } = usePermissions()
  const [canEdit, setCanEdit] = useState(false)
  
  useEffect(() => {
    async function checkPermission() {
      const hasEditPermission = await can('update', 'posts')
      setCanEdit(hasEditPermission)
    }
    
    checkPermission()
  }, [can])
  
  if (loading) return <div>Loading permissions...</div>
  if (!canEdit) return <div>You don't have permission to edit posts</div>
  
  return (
    <form>
      {/* Post editor form */}
    </form>
  )
}
```

### 5. Permission Management Interface

Admin dashboard for managing permissions:
- View all permissions in the system
- Assign/unassign permissions to roles
- Create user-specific permission overrides
- Track permission changes in audit logs

## Best Practices

### 1. Fine-Grained Permissions

Define specific, granular permissions:
- ✅ `posts:publish`, `posts:unpublish`
- ❌ Generic `posts:manage`

### 2. Resource-Action Consistency

Maintain consistent naming conventions:
- Resources: lowercase, singular nouns (`post` not `Posts`)
- Actions: verb forms (`create`, `read`, `update`, `delete`)

### 3. Default Deny

Always implement "deny by default":
- Explicitly grant necessary permissions
- Never assume access unless specifically allowed
- Handle edge cases with explicit denials

### 4. Permission Caching

Cache permission checks to improve performance:
- Cache role permissions at the session level
- Invalidate cache when permissions change
- Use React Server Components cache for efficiency

### 5. Audit Logging

Track all permission-related activities:
- Log permission grants and revocations
- Record when permission checks deny access
- Include detailed context (user, IP, resource)

### 6. Hierarchical Resources

For complex resources, use hierarchical permission naming:
- `posts:comments:create`
- `posts:comments:delete`
- `posts:tags:manage`

### 7. Context-Based Permissions

Implement context-aware permission checks:
- Check ownership for user-created content
- Apply different rules based on resource status
- Consider the relationship between user and resource

## Implementation Examples

### Permission Checking in Controllers

```typescript
// Get posts with permission-based filtering
async function getPosts(req: NextRequest) {
  const session = await getSession()
  if (!session) return []
  
  const canReadAllPosts = await can('read', 'posts')
  const isAdmin = session.role === 'ADMIN'
  
  return prisma.post.findMany({
    where: {
      // If can't read all posts, limit to own posts
      ...(!canReadAllPosts ? { authorId: session.userId } : {}),
      // If not admin, only show published unless own posts
      ...(!isAdmin ? {
        OR: [
          { published: true },
          { authorId: session.userId }
        ]
      } : {})
    }
  })
}
```

### User Permission Override Function

```typescript
// Grant or deny a specific permission to a user
async function setUserPermission(
  userId: string,
  permissionName: string,
  granted: boolean | null // null removes override
): Promise<void> {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    throw new Error('Only admins can modify permissions')
  }
  
  // Find the permission
  const permission = await prisma.permission.findUnique({
    where: { name: permissionName }
  })
  
  if (!permission) {
    throw new Error(`Permission ${permissionName} not found`)
  }
  
  if (granted === null) {
    // Remove override
    await prisma.userPermission.deleteMany({
      where: {
        userId,
        permissionId: permission.id
      }
    })
  } else {
    // Upsert permission override
    await prisma.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId,
          permissionId: permission.id
        }
      },
      update: { granted },
      create: {
        userId,
        permissionId: permission.id,
        granted
      }
    })
  }
  
  // Log the action
  await prisma.auditLog.create({
    data: {
      userId: session.userId,
      action: granted === null ? 'PERMISSION_RESET' :
              granted ? 'PERMISSION_GRANTED' : 'PERMISSION_DENIED',
      resource: 'permission',
      resourceId: permission.id,
      metadata: JSON.stringify({
        permissionName,
        targetUserId: userId,
        value: granted
      })
    }
  })
}
```

## Authorization vs. Authentication

This authorization system complements the authentication system by:

1. **Authentication** establishes *identity* (who you are):
   - Verifies credentials and creates sessions
   - Manages user login state
   - Handles session lifecycle

2. **Authorization** establishes *permissions* (what you can do):
   - Determines resource access rights
   - Controls feature availability
   - Filters data based on permissions

Together, they form a comprehensive identity and access management solution.

## Integration with Other Security Features

The authorization system integrates with:

- **Audit Logging**: Tracks permission usage and changes
- **Session Management**: Uses session data for permission context
- **Data Access Control**: Powers row-level security in queries
- **UI Element Visibility**: Controls feature visibility in UI 