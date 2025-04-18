'use server';

import { revalidatePath } from 'next/cache';
import { getSession } from '@/lib/session/manager';
import prisma from '@/lib/prisma';

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
      where: { role: roleName as any },
      include: {
        permission: true,
      },
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
    // Since Role is an enum, not a model, we need to check the validity differently
    const isValidRole = await prisma.user.findFirst({
      where: { role: roleName as any },
      select: { id: true }
    });

    if (!isValidRole) {
      return {
        success: false,
        message: `Role '${roleName}' is not a valid role.`,
      };
    }

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
          role: roleName as any,
        },
      }),
      ...permissionIds.map(permissionId =>
        prisma.rolePermission.create({
          data: {
            role: roleName as any,
            permissionId,
          },
        })
      ),
    ]);

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