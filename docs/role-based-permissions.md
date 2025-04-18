# Role-Based Permissions System

## Overview

The WebAuth system implements a role-based access control (RBAC) mechanism where permissions are assigned to roles, and users inherit permissions based on their assigned role. Each role represents a set of responsibilities and access levels within the application.

## Key Components

### Roles

The system defines four primary roles with increasing access levels:

1. **USER** - Basic access for regular users
2. **EDITOR** - Standard access for content creators
3. **MANAGER** - Extended access for administrators
4. **ADMIN** - Full access to all system features

Roles are implemented as an enum in the Prisma schema, not as a database model.

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

## Implementation Details

### Database Schema

```prisma
// Role enum
enum Role {
  USER
  EDITOR
  MANAGER
  ADMIN
}

// Permission model
model Permission {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  resource    String
  action      String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  rolePermissions RolePermission[]
  userPermissions UserPermission[]
}

// RolePermission model
model RolePermission {
  id           String     @id @default(cuid())
  role         Role
  permissionId String
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  createdAt    DateTime   @default(now())

  @@unique([role, permissionId])
}
```

### Server Actions

The system provides two main server actions for permission management:

1. **`getRolePermissions(roleName)`**: Retrieves all permissions assigned to a specific role
   - Authenticates the requester as an admin
   - Returns permission IDs for the specified role

2. **`updateRolePermissions(roleName, permissionIds)`**: Assigns permissions to a role
   - Authenticates the requester as an admin
   - Validates the role and permissions
   - Replaces existing permissions with the new set
   - Revalidates cache for affected routes

### UI Components

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