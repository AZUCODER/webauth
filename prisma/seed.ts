// prisma/seed.ts

import { Role } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function main() {
    // Define resources and actions
    const resources = ['users', 'posts', 'profile', 'postcategories']
    const actions = ['create', 'read', 'update', 'delete', 'publish', 'manage']

    // Create permissions
    for (const resource of resources) {
        for (const action of actions) {
            if (resource === 'posts' && action === 'publish' ||
                resource === 'settings' && action === 'manage' ||
                ['create', 'read', 'update', 'delete'].includes(action)) {
                await prisma.permission.upsert({
                    where: { name: `${resource}:${action}` },
                    update: {},
                    create: {
                        name: `${resource}:${action}`,
                        description: `Can ${action} ${resource}`,
                        resource,
                        action
                    }
                })
            }
        }
    }

    // Assign permissions to roles
    const permissions = await prisma.permission.findMany()

    // Define role permissions mapping
    const rolePermissions = {
        [Role.USER]: [
            'posts:read',
            'profile:read',
            'profile:update',
            'categories:read'
        ],
        [Role.EDITOR]: [
            'posts:create',
            'posts:read',
            'posts:update',
            'posts:delete',
            'categories:read',
            'profile:read',
            'profile:update'
        ],
        [Role.MANAGER]: [
            'posts:read',
            'posts:update',
            'posts:delete',
            'posts:publish',
            'categories:read',
            'categories:create',
            'categories:update',
            'users:read',
            'profile:read'
        ],
        [Role.ADMIN]: permissions.map(p => p.name) // Admin gets all permissions
    }

    // Create role permissions
    for (const [role, permissionNames] of Object.entries(rolePermissions)) {
        for (const permName of permissionNames) {
            const permission = permissions.find(p => p.name === permName)
            if (permission) {
                await prisma.rolePermission.upsert({
                    where: {
                        role_permissionId: {
                            role: role as Role,
                            permissionId: permission.id
                        }
                    },
                    update: {},
                    create: {
                        role: role as Role,
                        permissionId: permission.id
                    }
                })
            }
        }
    }
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })