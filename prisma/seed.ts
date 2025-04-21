// prisma/seed.ts

import { Role, SettingType } from '@prisma/client';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();


async function main() {
    console.log('Starting database seeding...');
    
    // Define resources and actions
    const resources = ['users', 'posts', 'profile', 'post-category', 'settings']
    const actions = ['create', 'read', 'update', 'delete', 'publish', 'manage', 'view']

    // Create permissions
    const createdPermissions = [];
    for (const resource of resources) {
        for (const action of actions) {
            // Skip irrelevant permissions
            if (
                // Posts-specific
                (resource === 'posts' && ['create', 'read', 'update', 'delete', 'publish'].includes(action)) ||
                // Post categories
                (resource === 'post-category' && ['create', 'read', 'update', 'delete', 'view'].includes(action)) ||
                // Users management
                (resource === 'users' && ['read', 'create', 'update', 'delete', 'manage'].includes(action)) ||
                // Profile
                (resource === 'profile' && ['read', 'update'].includes(action)) ||
                // Settings
                (resource === 'settings' && ['read', 'update', 'manage'].includes(action))
            ) {
                const permission = await prisma.permission.upsert({
                    where: { id: `${resource}:${action}` },
                    update: {},
                    create: {
                        id: `${resource}:${action}`,
                        name: `${resource}:${action}`,
                        description: `Can ${action} ${resource}`,
                        resource,
                        action
                    }
                });
                createdPermissions.push(permission);
                console.log(`Created permission: ${permission.name}`);
            }
        }
    }

    // Get all permissions
    const permissions = await prisma.permission.findMany();
    console.log(`Total permissions: ${permissions.length}`);

    // Define role permissions mapping
    const rolePermissions = {
        [Role.USER]: [
            // Post permissions - Users can create and manage their own posts
            'posts:create',
            'posts:read',
            'posts:update',
            'posts:delete',
            'posts:publish',
            // Category permissions - View only
            'post-category:read',
            'post-category:view',
            // Profile permissions
            'profile:read',
            'profile:update',
            // Settings - read only
            'settings:read'
        ],
        [Role.ADMIN]: [
            ...permissions.map(p => p.id), // Admin gets all permissions
            'settings:manage'
        ]
    };

    // Create role permissions
    for (const [role, permissionNames] of Object.entries(rolePermissions)) {
        console.log(`Setting up permissions for role: ${role}`);
        
        for (const permId of permissionNames) {
            const permission = permissions.find(p => p.id === permId);
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
                });
                console.log(`  - Added ${permission.id} to ${role}`);
            } else {
                console.warn(`  - Warning: Permission ${permId} not found`);
            }
        }
    }
    
    // Create default application settings
    console.log('Creating default application settings...');
    
    const defaultSettings = [
        {
            key: 'site.name',
            value: 'Next.js Web Auth',
            description: 'The name of the website',
            category: 'general',
            isPublic: true,
            type: SettingType.STRING
        },
        {
            key: 'site.description',
            value: 'A modern authentication system built with Next.js and Prisma',
            description: 'Site description for SEO and social sharing',
            category: 'general',
            isPublic: true,
            type: SettingType.STRING
        },
        {
            key: 'site.logo',
            value: '/images/logo.svg',
            description: 'Path to the site logo',
            category: 'general',
            isPublic: true,
            type: SettingType.IMAGE_URL
        },
        {
            key: 'auth.registration_enabled',
            value: 'true',
            description: 'Allow new users to register',
            category: 'security',
            isPublic: true,
            type: SettingType.BOOLEAN
        },
        {
            key: 'auth.email_verification_required',
            value: 'true',
            description: 'Require email verification before login',
            category: 'security',
            isPublic: false,
            type: SettingType.BOOLEAN
        },
        {
            key: 'auth.login_attempts_before_lockout',
            value: '5',
            description: 'Number of failed login attempts before account lockout',
            category: 'security',
            isPublic: false,
            type: SettingType.NUMBER
        },
        {
            key: 'auth.lockout_duration_minutes',
            value: '30',
            description: 'Duration of account lockout in minutes after failed login attempts',
            category: 'security',
            isPublic: false,
            type: SettingType.NUMBER
        },
        {
            key: 'content.posts_per_page',
            value: '10',
            description: 'Number of posts to display per page',
            category: 'content',
            isPublic: true,
            type: SettingType.NUMBER
        },
        {
            key: 'theme.primary_color',
            value: '#4F46E5',
            description: 'Primary theme color',
            category: 'appearance',
            isPublic: true,
            type: SettingType.COLOR
        },
        {
            key: 'theme.secondary_color',
            value: '#10B981',
            description: 'Secondary theme color',
            category: 'appearance',
            isPublic: true,
            type: SettingType.COLOR
        }
    ];
    
    for (const setting of defaultSettings) {
        await prisma.setting.upsert({
            where: { key: setting.key },
            update: {},
            create: setting
        });
        console.log(`  - Created setting: ${setting.key}`);
    }
    
    console.log('Seeding completed successfully!');
}

main()
    .then(async () => { 
        await prisma.$disconnect();
        console.log('Database connection closed.');
    })
    .catch(async (e) => {
        console.error('Error during seeding:', e);
        await prisma.$disconnect();
        process.exit(1);
    });