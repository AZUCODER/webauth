// src/lib/authorization/permissions.ts

import { Role} from '@prisma/client'; 
import { prisma } from '@/lib/prisma';
import { cache } from 'react';
import { getSession } from '@/lib/session/manager'


// Get all permissions for a role (cached for efficiency)
export const getRolePermissions = cache(async (role: Role): Promise<string[]> => {
    const rolePermissions = await prisma.rolePermission.findMany({
        where: { role },
        include: { permission: true }
    })

    return rolePermissions.map(rp => rp.permission.name)
})

// Get all user-specific permission overrides
export const getUserPermissionOverrides = cache(async (userId: string): Promise<Record<string, boolean>> => {
    const userPermissions = await prisma.userPermission.findMany({
        where: { userId },
        include: { permission: true }
    })

    return Object.fromEntries(
        userPermissions.map(up => [up.permission.name, up.granted])
    )
})

// Check if the current user has a specific permission
export async function hasPermission(permissionName: string): Promise<boolean> {
    const session = await getSession()
    if (!session) return false

    // Super admin check - admins have all permissions by default
    if (session.role === 'ADMIN') return true

    // Get role-based permissions
    const rolePermissions = await getRolePermissions(session.role as Role)

    // Get user-specific overrides
    const userOverrides = await getUserPermissionOverrides(session.userId)

    // Check for user-specific override first
    if (permissionName in userOverrides) {
        return userOverrides[permissionName]
    }

    // Fall back to role-based permission
    return rolePermissions.includes(permissionName)
}

// Check for multiple permissions (requires all)
export async function hasAllPermissions(permissionNames: string[]): Promise<boolean> {
    for (const permName of permissionNames) {
        const hasPerm = await hasPermission(permName)
        if (!hasPerm) return false
    }
    return true
}

// Check for any of the given permissions
export async function hasAnyPermission(permissionNames: string[]): Promise<boolean> {
    for (const permName of permissionNames) {
        const hasPerm = await hasPermission(permName)
        if (hasPerm) return true
    }
    return false
}

// Resource-action permission helper
export async function can(action: string, resource: string): Promise<boolean> {
    return hasPermission(`${resource}:${action}`)
}