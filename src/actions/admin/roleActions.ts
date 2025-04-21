'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session/manager';
import prisma from '@/lib/prisma';
import { logAuditEvent } from '@/lib/audit/auditLogger';
import { Role } from '@prisma/client';

// Get permissions for a specific role
export async function getRolePermissions(roleName: string) {
  try {
    // Verify user is authenticated and has admin privileges
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized. You must be an admin to view role permissions.',
      };
    }

    // Get permissions for the role
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { role: roleName as Role },
      include: {
        permission: true,
      },
    });

    // Log the view action
    await logAuditEvent({
      userId: session.userId,
      action: 'view',
      resource: 'role-permissions',
      resourceId: roleName,
      metadata: {
        role: roleName
      }
    });

    return {
      success: true,
      role: roleName,
      permissions: rolePermissions.map(rp => rp.permission.id),
    };
  } catch (error) {
    console.error(`Error getting permissions for role ${roleName}:`, error);
    return {
      success: false,
      message: 'An error occurred while getting role permissions.',
    };
  }
}

export async function updateRolePermissions(
  roleName: string,
  permissionIds: string[]
) {
  try {
    // Verify user is authenticated and has admin privileges
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return {
        success: false,
        message: 'Unauthorized. You must be an admin to update role permissions.',
      };
    }

    // Verify roleName
    // Check against valid roles directly
    const validRoles = ['USER', 'ADMIN'];
    if (!validRoles.includes(roleName)) {
      return {
        success: false,
        message: `Role '${roleName}' is not a valid role.`,
      };
    }

    // Get existing role permissions for audit log
    const existingRolePermissions = await prisma.rolePermission.findMany({
      where: { role: roleName as Role },
      include: {
        permission: true,
      },
    });

    const previousPermissionIds = existingRolePermissions.map(rp => rp.permissionId);

    // Validate that all permissionIds exist
    const permissions = await prisma.permission.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
    });

    if (permissions.length !== permissionIds.length) {
      return {
        success: false,
        message: 'One or more permissions are invalid.',
      };
    }

    // Update role permissions by first removing all existing role permissions
    // and then adding the new ones
    await prisma.$transaction([
      prisma.rolePermission.deleteMany({
        where: {
          role: roleName as Role,
        },
      }),
      ...permissionIds.map(permissionId =>
        prisma.rolePermission.create({
          data: {
            role: roleName as Role,
            permissionId,
          },
        })
      ),
    ]);

    // Log the update action
    await logAuditEvent({
      userId: session.userId,
      action: 'role:update',
      resource: 'role-permissions',
      resourceId: roleName,
      metadata: {
        role: roleName,
        previousPermissions: previousPermissionIds,
        newPermissions: permissionIds,
        added: permissionIds.filter(id => !previousPermissionIds.includes(id)),
        removed: previousPermissionIds.filter(id => !permissionIds.includes(id))
      }
    });

    // Revalidate related paths
    revalidatePath('/permissions/roles');
    revalidatePath(`/permissions/roles/${roleName}`);

    return {
      success: true,
      message: `Permissions for role '${roleName}' updated successfully.`,
    };
  } catch (error) {
    console.error('Error updating role permissions:', error);
    return {
      success: false,
      message: 'An error occurred while updating role permissions.',
    };
  }
} 