'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session/manager';
import { type SocialLinks } from "@/types/profile";
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { hasPermission } from '@/lib/authorization/permissions';
import { logAuditEvent } from '@/lib/audit/auditLogger';


type ProfileResponse = {
    id?: string;
    userId: string;
    avatar?: string | null;
    position?: string | null;
    bio?: string | null;
    socialLinks?: SocialLinks;
};

// Get user profile
export async function getUserProfile() {
    try {
        const session = await getSession();
        if (!session) {
            redirect('/login');
        }

        const userId = session.userId;
        
        // Check if user has permission to view profiles
        // Users always have permission to view their own profile
        const canViewProfiles = await hasPermission('profile:view-all') || session.role === 'ADMIN';
        const isOwnProfile = true; // In this case, always the user's own profile
        
        if (!canViewProfiles && !isOwnProfile) {
            return {
                success: false,
                error: "You don't have permission to view this profile"
            };
        }

        console.log('Looking up profile for user:', userId);

        const profile = await prisma.profile.findUnique({
            where: { userId }
        });

        // Create an empty default profile if none exists yet
        if (!profile) {
            console.log('No profile found for user, returning default empty profile');
            return {
                success: true,
                data: {
                    userId,
                    avatar: null,
                    bio: '',
                    position: '',
                    socialLinks: {
                        website: '',
                    }
                }
            };
        }

        // Parse any existing social links
        let socialLinks: SocialLinks = {
            website: '',
        };

        if (profile.socialLinks) {
            try {
                const parsedLinks = typeof profile.socialLinks === 'string'
                    ? JSON.parse(profile.socialLinks)
                    : profile.socialLinks;

                // Ensure all required fields are present by spreading default values first
                socialLinks = { ...socialLinks, ...parsedLinks };
            } catch (e) {
                console.error('Error parsing existing social links:', e);
            }
        }

        // Format the profile with additional UI fields
        const formattedProfile: ProfileResponse = {
            ...profile,
            socialLinks
        };

        return {
            success: true,
            data: formattedProfile
        };
    } catch (error) {
        console.error('Error getting user profile:', error);
        return {
            success: false,
            error: 'Failed to retrieve user profile: ' + (error instanceof Error ? error.message : 'Unknown error')
        };
    }
}

// Simple direct profile update function that doesn't use FormData
export async function updateProfile(
    bio: string,
    position: string,
    avatar: string,
    socialLinks: SocialLinks
) {
    console.log('Starting direct profile update...');
    
    try {
        const session = await getSession();
        if (!session) {
            console.error('No session found');
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        const userId = session.userId;
        console.log('Updating profile for user:', userId);

        // Check if user has permission to update their profile
        const isAdmin = session.role === 'ADMIN';
        const hasUpdateAllPermission = await hasPermission('profile:update-all');
        const hasUpdatePermission = await hasPermission('profile:update');
        const canUpdateProfile = isAdmin || hasUpdateAllPermission || hasUpdatePermission;

        if (!canUpdateProfile) {
            console.error('Permission denied to update profile');
            return {
                success: false,
                error: 'You do not have permission to update this profile'
            };
        }

        // Validate profile data
        if (position && position.length > 100) {
            return {
                success: false,
                error: 'Position is too long (maximum 100 characters)'
            };
        }

        if (bio && bio.length > 1000) {
            return {
                success: false,
                error: 'Bio is too long (maximum 1000 characters)'
            };
        }

        // Get existing profile for audit log and comparison
        const existingProfile = await prisma.profile.findUnique({
            where: { userId }
        });

        // Format social links properly
        const formattedSocialLinks = typeof socialLinks === 'string' 
            ? JSON.parse(socialLinks) 
            : socialLinks;

        // Prepare profile data
        const profileData = {
            userId,
            bio: bio || '',
            position: position || '',
            avatar: avatar || '',
            socialLinks: Object.keys(formattedSocialLinks || {}).length > 0 
                ? JSON.stringify(formattedSocialLinks) 
                : null
        };

        console.log('Profile data to save:', JSON.stringify(profileData, null, 2));

        let updatedProfile;
        
        if (existingProfile) {
            updatedProfile = await prisma.profile.update({
                where: { userId },
                data: profileData
            });
            console.log('Profile updated with ID:', updatedProfile.id);
        } else {
            updatedProfile = await prisma.profile.create({
                data: profileData
            });
            console.log('Profile created with ID:', updatedProfile.id);
        }

        // Log the action
        await logAuditEvent({
            userId: session.userId,
            action: existingProfile ? 'update' : 'create',
            resource: 'profile',
            resourceId: updatedProfile.id,
            metadata: {
                profileId: updatedProfile.id,
                previous: existingProfile ? {
                    position: existingProfile.position,
                    hasAvatar: !!existingProfile.avatar,
                    hasSocialLinks: !!existingProfile.socialLinks
                } : null,
                updated: {
                    position: updatedProfile.position,
                    hasAvatar: !!updatedProfile.avatar,
                    hasSocialLinks: !!updatedProfile.socialLinks
                }
            }
        });

        // Revalidate paths
        revalidatePath('/profile');
        revalidatePath('/dashboard');

        return {
            success: true,
            data: updatedProfile
        };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return {
            success: false,
            error: 'Failed to update profile: ' + (error instanceof Error ? error.message : 'Unknown error')
        };
    }
}

// Create or update user profile
export async function updateUserProfile(formData: FormData) {
    console.log('Starting profile update...');
    
    try {
        // Make sure we have a valid FormData object
        if (!formData || !(formData instanceof FormData)) {
            console.error('Invalid form data provided');
            return {
                success: false,
                error: 'Invalid form data provided'
            };
        }

        const session = await getSession();
        if (!session) {
            console.error('No session found');
            return {
                success: false,
                error: 'Authentication required'
            };
        }

        const userId = session.userId;
        console.log('Updating profile for user:', userId);

        // Check permissions to update this profile
        // Either user is updating their own profile or has the permission to update other profiles
        const isOwnProfile = session.userId === userId;
        const canUpdateOtherProfiles = await hasPermission('profile:update-all');
        const hasUpdatePermission = await hasPermission('profile:update');

        if (!((isOwnProfile && hasUpdatePermission) || canUpdateOtherProfiles || session.role === 'ADMIN')) {
            console.error('Permission denied to update profile');
            return {
                success: false,
                error: 'You do not have permission to update this profile'
            };
        }

        // Get existing profile for audit log
        const existingProfile = await prisma.profile.findUnique({
            where: { userId }
        });

        // Log what's in the form data
        console.log('Form data entries:');
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }

        // Extract data from FormData
        const bio = formData.get('bio') as string || '';
        const position = formData.get('position') as string || '';
        const avatar = formData.get('avatar') as string || '';
        
        let socialLinksData = {};
        const socialLinksStr = formData.get('socialLinks');
        if (socialLinksStr) {
            try {
                socialLinksData = typeof socialLinksStr === 'string' 
                    ? JSON.parse(socialLinksStr) 
                    : socialLinksStr;
                console.log('Parsed social links:', socialLinksData);
            } catch (error) {
                console.error('Error parsing social links:', error);
                // Default to empty object if parsing fails
                socialLinksData = {};
            }
        }
        
        // Prepare profile data
        const profileData = {
            userId,
            bio,
            position,
            avatar,
            socialLinks: Object.keys(socialLinksData).length > 0 
                ? JSON.stringify(socialLinksData) 
                : null
        };
        
        console.log('Profile data to save:', JSON.stringify(profileData, null, 2));
        
        let updatedProfile;
        
        if (existingProfile) {
            updatedProfile = await prisma.profile.update({
                where: { userId },
                data: profileData
            });
            console.log('Profile updated with ID:', updatedProfile.id);
        } else {
            updatedProfile = await prisma.profile.create({
                data: profileData
            });
            console.log('Profile created with ID:', updatedProfile.id);
        }
        
        // Log the action
        await logAuditEvent({
            userId: session.userId,
            action: existingProfile ? 'update' : 'create',
            resource: 'profile',
            resourceId: updatedProfile.id,
            metadata: {
                profileId: updatedProfile.id,
                previous: existingProfile ? {
                    position: existingProfile.position,
                    hasAvatar: !!existingProfile.avatar,
                    hasSocialLinks: !!existingProfile.socialLinks
                } : null,
                updated: {
                    position: updatedProfile.position,
                    hasAvatar: !!updatedProfile.avatar,
                    hasSocialLinks: !!updatedProfile.socialLinks
                }
            }
        });
        
        // Revalidate paths
        revalidatePath('/profile');
        revalidatePath('/dashboard');
        
        return {
            success: true,
            data: updatedProfile
        };
    } catch (error) {
        console.error('Error updating profile with form data:', error);
        return {
            success: false,
            error: 'Failed to update profile: ' + (error instanceof Error ? error.message : 'Unknown error')
        };
    }
}