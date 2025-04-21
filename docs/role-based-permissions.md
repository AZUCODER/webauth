# Role-Based Permissions System

## Overview

The WebAuth system implements a role-based access control (RBAC) mechanism where permissions are assigned to roles, and users inherit permissions based on their assigned role. Each role represents a set of responsibilities and access levels within the application.

## Key Components

### Roles

The system defines two primary roles with distinct access levels:

1. **USER** - Standard access for regular users, allowing them to:
   - Access the dashboard interface
   - Manage their own profile
   - Upload and manage files
   - View and edit their own content

2. **ADMIN** - Full access to all system features and administration capabilities:
   - Access to admin-only routes
   - User management
   - System settings configuration
   - Permission management
   - Content moderation

Roles are implemented as an enum in the Prisma schema, not as a database model.

### Middleware-Based Access Control

The application uses a middleware-based approach to control access to different routes:

```typescript
// Public routes - accessible without authentication
const publicRoutes = [
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  // API routes for authentication
];

// Dashboard routes - for authenticated users (both USER and ADMIN roles)
const dashboardRoutes = [
  '/dashboard',
  '/profile',
  '/files',
  '/account',
];

// Admin-only routes - require ADMIN role
const adminRoutes = [
  '/admin',
  '/settings',
  '/permissions',
];
```

### Permissions

Permissions are granular access rights defined by:
- **Resource**: The entity being accessed (e.g., users, posts, profiles)
- **Action**: The operation performed (e.g., create, read, update, delete)

Each permission has:
- Unique ID
- Name (typically in format `resource:action`)
- Description
- Resource identifier
- Action identifier

### Role-Permission Relationship

The `RolePermission` model establishes a many-to-many relationship between roles and permissions. Each record contains:
- Reference to a role (enum value)
- Reference to a permission (ID)

## Current Implementation

### Route Protection with Middleware

The middleware checks for authentication and role-based access:

```typescript
export async function middleware(request: NextRequest) {
  // Skip auth checks for public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Verify JWT token
  try {
    const { payload } = await jwtVerify(
      sessionCookie.value,
      encoder.encode(secretKey)
    );
    
    // Check role-based permissions for admin routes
    if (isAdminRoute(pathname) && payload.role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
    
    // Grant access if all checks pass
    return NextResponse.next();
  } catch (error) {
    // Handle JWT verification failure
    return redirectToLogin(request);
  }
}
```

### Known Issue: Dashboard Access

**Current Issue**: The middleware has a configuration problem where the dashboard routes are being incorrectly treated as admin-only routes, causing regular users with the USER role to be redirected in a loop when trying to access the dashboard.

**Manifest Symptoms**:
- Users with USER role get "too many redirects" error
- Server logs show repeated access denied messages
- Error in the console: `User with role USER attempted to access admin route: /dashboard`

**Solution**: The `isAdminRoute` function needs to be updated to properly consider dashboard routes as accessible to all authenticated users:

```typescript
// Fix for isAdminRoute function
function isAdminRoute(path: string): boolean {
  // First check if it's a dashboard route (which all authenticated users can access)
  if (isDashboardRoute(path)) {
    return false;
  }
  
  // Then check if it's in the admin routes list
  return adminRoutes.some(route => path.startsWith(route));
}
```

### Default Role Permissions

1. **USER Role Permissions**:
   - Access dashboard interface (`dashboard:access`)
   - Manage their own profile (`profile:read`, `profile:update`)
   - Manage their own files (`files:upload`, `files:download`, `files:delete`)
   - Create and manage their own posts (`posts:create`, `posts:read`, `posts:update`, `posts:delete`)

2. **ADMIN Role Permissions**:
   - All permissions in the system
   - User management permissions (`users:list`, `users:create`, `users:update`, `users:delete`)
   - Settings management (`settings:read`, `settings:update`)
   - Permission management (`permissions:read`, `permissions:update`)

### Permission Checking

In addition to the middleware-based route protection, the system provides utility functions for checking permissions within components and API handlers:

```typescript
// Check if user has a specific permission
export async function hasPermission(
  permissionName: string
): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  
  // Check user's role permissions
  const rolePermissions = await getRolePermissions(session.role);
  if (rolePermissions.includes(permissionName)) {
    return true;
  }
  
  // Check user-specific permission overrides
  const userPermission = await getUserPermission(
    session.userId,
    permissionName
  );
  
  return !!userPermission;
}

// API route protection with permissions
export async function withPermission(
  req: NextRequest,
  permissionName: string,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const hasAccess = await hasPermission(permissionName);
  
  if (!hasAccess) {
    return NextResponse.json(
      { error: 'Permission denied' },
      { status: 403 }
    );
  }
  
  return handler();
}
```

## Best Practices

1. **Consistent Route Categorization**: All routes should be correctly categorized as public, dashboard (authenticated), or admin-only.

2. **Proper Role Assignment**: Ensure users are assigned the appropriate role during registration or user creation.

3. **Permission Checks**: Always use permission checks for sensitive operations, especially in API routes.

4. **Audit Logging**: Log permission changes and access denied events for security auditing.

5. **Error Messages**: Provide clear but not overly detailed error messages for authorization failures.

## Implementation Notes

- The current middleware implementation grants access to dashboard routes for all authenticated users but requires the ADMIN role for admin-only routes.
- API routes should implement their own permission checks using the `withPermission` helper.
- The system supports role-based permissions with the ability to override permissions for specific users.
- The dashboard access issue needs to be fixed by properly excluding dashboard routes from admin-only routes.

By adhering to these practices, the application maintains secure access control while providing appropriate functionality to users based on their roles.

## Server Actions

The system provides two main server actions for permission management:

1. **`getRolePermissions(roleName)`**: Retrieves all permissions assigned to a specific role
   - Authenticates the requester as an admin
   - Returns permission IDs for the specified role

2. **`updateRolePermissions(roleName, permissionIds)`**: Assigns permissions to a role
   - Authenticates the requester as an admin
   - Validates the role and permissions
   - Replaces existing permissions with the new set
   - Revalidates cache for affected routes

## UI Components

The permission management interface consists of:

1. **Role List View** (`/permissions/roles`)
   - Displays all roles with their descriptions and access levels
   - Provides links to manage permissions for each role

2. **Role Permission Form** (`/permissions/roles/[role]`)
   - Groups permissions by resource
   - Allows toggling permissions individually or by resource group
   - Shows permission descriptions for context
   - Provides save/cancel functionality with proper feedback

## Usage Flow

1. **Admin Access**: Navigate to the permissions management area
2. **Select Role**: Choose a role to modify from the roles list
3. **Manage Permissions**: Toggle permissions on/off for the selected role
4. **Save Changes**: Submit the updated permission set
5. **Verification**: All users with the modified role immediately inherit the new permissions

## Authorization Logic

When a user attempts to perform an action:

1. The system retrieves the user's role
2. It checks if the role has the required permission for the action
3. If the permission exists, the action is allowed; otherwise, it's denied

This approach ensures that permission changes immediately affect all users with the corresponding role, providing an efficient way to manage access control at scale.

## Security Considerations

- Only administrators can view and modify role permissions
- Server-side validation prevents assigning invalid permissions
- Transactions ensure atomic updates to prevent partial permission sets
- Cache revalidation ensures permission changes take effect immediately 