'use server'

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session/manager';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Permission, Role } from '@prisma/client';
import { logAuditEvent, safeStringify } from '@/lib/audit/auditLogger';

// Permission validation schema
const PermissionSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().optional(),
  resource: z.string().min(1),
  action: z.string().min(1),
});

// Return type for permission actions
export type PermissionActionReturn = {
  success: boolean;
  error?: string;
  permission?: Permission | Permission[];
};

// Return type for role permission actions
export type RolePermissionActionReturn = {
  success: boolean;
  error?: string;
  role?: string;
  permissions?: string[];
  message?: string; 
};

// Get all permissions
export async function getPermissions(): Promise<PermissionActionReturn> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' };
    }

    const permissions = await prisma.permission.findMany({
      orderBy: { resource: 'asc' },
    });

    return { success: true, permission: permissions };
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return { success: false, error: 'Failed to fetch permissions' };
  }
}

// Get permission by ID
export async function getPermissionById(id: string): Promise<PermissionActionReturn> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' };
    }

    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      return { success: false, error: 'Permission not found' };
    }

    return { success: true, permission };
  } catch (error) {
    console.error('Error fetching permission:', error);
    return { success: false, error: 'Failed to fetch permission info' };
  }
}

// Create new permission
export async function createPermission(formData: FormData): Promise<PermissionActionReturn> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const resource = formData.get('resource') as string;
    const action = formData.get('action') as string;

    // Validate input data
    const validatedData = PermissionSchema.parse({
      name,
      description,
      resource,
      action,
    });

    // Check if permission already exists
    const existingPermission = await prisma.permission.findUnique({
      where: { name: validatedData.name },
    });

    if (existingPermission) {
      return { success: false, error: 'Permission name already exists' };
    }

    // Create permission
    const newPermission = await prisma.permission.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        resource: validatedData.resource,
        action: validatedData.action,
      },
    });

    // Log the action
    await logAuditEvent({
      userId: session.userId,
      action: 'create',
      resource: 'permission',
      resourceId: newPermission.id,
      metadata: {
        name: newPermission.name,
        resource: newPermission.resource,
        action: newPermission.action
      }
    });

    revalidatePath('/permissions');

    return { success: true, permission: newPermission };
  } catch (error) {
    console.error('Error creating permission:', error);
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { success: false, error: 'Failed to create permission.' };
  }
}

// Update permission
export async function updatePermission(id: string, formData: FormData): Promise<PermissionActionReturn> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const resource = formData.get('resource') as string;
    const action = formData.get('action') as string;

    // Validate input data
    const validatedData = PermissionSchema.parse({
      name,
      description,
      resource,
      action,
    });

    // Check if permission exists
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    });

    if (!existingPermission) {
      return { success: false, error: 'Permission not found' };
    }

    // Check if name is already taken by another permission
    if (validatedData.name !== existingPermission.name) {
      const duplicateName = await prisma.permission.findUnique({
        where: { name: validatedData.name },
      });

      if (duplicateName) {
        return { success: false, error: 'Permission name already exists' };
      }
    }

    // Update permission
    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        resource: validatedData.resource,
        action: validatedData.action,
      },
    });

    // Log the action
    await logAuditEvent({
      userId: session.userId,
      action: 'update',
      resource: 'permission',
      resourceId: updatedPermission.id,
      metadata: {
        previous: {
          name: existingPermission.name,
          resource: existingPermission.resource,
          action: existingPermission.action
        },
        updated: {
          name: updatedPermission.name,
          resource: updatedPermission.resource,
          action: updatedPermission.action
        }
      }
    });

    revalidatePath('/permissions');

    return { success: true, permission: updatedPermission };
  } catch (error) {
    console.error('Error updating permission:', error);
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: error.errors.map(e => e.message).join(', ') 
      };
    }
    return { success: false, error: 'Failed to update permission.' };
  }
}

// Delete permission
export async function deletePermission(id: string): Promise<PermissionActionReturn> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' };
    }

    // Get permission details before deletion for audit log
    const permissionToDelete = await prisma.permission.findUnique({
      where: { id },
    });

    if (!permissionToDelete) {
      return { success: false, error: 'Permission not found' };
    }

    // Delete permission
    await prisma.permission.delete({
      where: { id },
    });

    // Log the action
    await logAuditEvent({
      userId: session.userId,
      action: 'delete',
      resource: 'permission',
      resourceId: id,
      metadata: {
        name: permissionToDelete.name,
        resource: permissionToDelete.resource,
        action: permissionToDelete.action
      }
    });

    revalidatePath('/permissions');

    return { success: true };
  } catch (error) {
    console.error('Error deleting permission:', error);
    return { success: false, error: 'Failed to delete permission' };
  }
}

// Get permissions assigned to a role
export async function getRolePermissions(role: Role): Promise<RolePermissionActionReturn> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' };
    }

    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role },
      include: { permission: true },
    });

    const permissions = rolePermissions.map(rp => rp.permission.name);

    return { success: true, role: role, permissions };
  } catch (error) {
    console.error(`Error fetching permissions for role ${role}:`, error);
    return { success: false, error: 'Failed to fetch role permissions' };
  }
}

// Update role permissions
export async function updateRolePermissions(role: Role, permissionIds: string[]): Promise<RolePermissionActionReturn> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' };
    }

    // Get existing permissions for the role for audit log
    const existingRolePermissions = await prisma.rolePermission.findMany({
      where: { role },
      include: {
        permission: true,
      },
    });

    const previousPermissionIds = existingRolePermissions.map(rp => rp.permissionId);

    // Update role permissions by first removing all existing role permissions
    // and then adding the new ones
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: {
          role,
        },
      }),
      ...permissionIds.map(permissionId =>
        prisma.rolePermission.create({
          data: {
            role,
            permissionId,
          },
        })
      ),
    ]);

    // Log the action
    await logAuditEvent({
      userId: session.userId,
      action: 'role:update',
      resource: 'role-permissions',
      resourceId: role.toString(),
      metadata: {
        role,
        previousPermissions: previousPermissionIds,
        newPermissions: permissionIds,
        added: permissionIds.filter(id => !previousPermissionIds.includes(id)),
        removed: previousPermissionIds.filter(id => !permissionIds.includes(id))
      }
    });

    // Revalidate related paths
    revalidatePath('/permissions/roles');
    revalidatePath(`/permissions/roles/${role}`);

    return {
      success: true,
      message: `Permissions for role '${role}' updated successfully.`,
    };
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return { success: false, error: 'An error occurred while updating role permissions.' };
  }
}

// Get user permissions (including role permissions and overrides)
export async function getUserPermissions(userId: string): Promise<{
  success: boolean;
  error?: string;
  rolePermissions?: string[];
  userOverrides?: Record<string, boolean>;
}> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' };
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Get role permissions
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role: user.role },
      include: { permission: true },
    });

    // Get user-specific overrides
    const userPermissions = await prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    });

    return { 
      success: true, 
      rolePermissions: rolePermissions.map(rp => rp.permission.name),
      userOverrides: Object.fromEntries(
        userPermissions.map(up => [up.permission.name, up.granted])
      )
    };
  } catch (error) {
    console.error(`Error fetching permissions for user ${userId}:`, error);
    return { success: false, error: 'Failed to fetch user permissions' };
  }
}

// Update user permission overrides
export async function updateUserPermissions(
  userId: string, 
  permissionOverrides: Record<string, boolean>
): Promise<{ success: boolean; error?: string; }> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' };
    }

    // Get existing user permissions for audit log
    const existingUserPermissions = await prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: true,
      },
    });

    const previousOverrides = Object.fromEntries(
      existingUserPermissions.map(up => [up.permissionId, up.granted])
    );

    // Process the updates in a transaction
    await prisma.$transaction(async (tx) => {
      // First, delete all existing overrides for this user
      await tx.userPermission.deleteMany({
        where: { userId }
      });

      // Then create new overrides based on the input
      for (const [permissionId, granted] of Object.entries(permissionOverrides)) {
        await tx.userPermission.create({
          data: {
            userId,
            permissionId,
            granted
          }
        });
      }
    });

    // Log the action
    await logAuditEvent({
      userId: session.userId,
      action: 'permission:update',
      resource: 'user-permissions',
      resourceId: userId,
      metadata: {
        targetUserId: userId,
        previousOverrides,
        newOverrides: permissionOverrides,
      }
    });

    // Revalidate paths
    revalidatePath('/permissions/users');
    revalidatePath(`/permissions/users/${userId}`);

    return { 
      success: true 
    };
  } catch (error) {
    console.error('Error updating user permissions:', error);
    return { 
      success: false,
      error: 'Failed to update user permissions: ' + (error instanceof Error ? error.message : 'Unknown error')
    };
  }
}

// Get paginated permissions
export async function getPaginatedPermissions(
  page: number = 1,
  pageSize: number = 10,
  searchTerm: string = '',
  resourceFilter: string = ''
): Promise<{
  success: boolean;
  error?: string;
  permissions?: Permission[];
  totalCount?: number;
  totalPages?: number;
}> {
  try {
    const session = await getSession();
    
    // Check if user is admin
    if (!session || session.role !== 'ADMIN') {
      return { success: false, error: 'Unauthorized!' };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize;

    // Create the where condition based on search and filters
    const where: any = {};
    
    if (searchTerm) {
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
        { resource: { contains: searchTerm, mode: 'insensitive' } },
        { action: { contains: searchTerm, mode: 'insensitive' } }
      ];
    }
    
    if (resourceFilter) {
      where.resource = resourceFilter;
    }

    // Get paginated permissions
    const [permissions, totalCount] = await Promise.all([
      prisma.permission.findMany({
        where,
        orderBy: { resource: 'asc' },
        skip,
        take: pageSize,
      }),
      prisma.permission.count({ where })
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / pageSize);

    return { 
      success: true, 
      permissions, 
      totalCount,
      totalPages
    };
  } catch (error) {
    console.error('Error fetching paginated permissions:', error);
    return { success: false, error: 'Failed to fetch permissions' };
  }
} 