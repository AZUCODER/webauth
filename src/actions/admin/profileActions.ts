'use server';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session/manager';
import { profileSchema, transformProfileForDatabase, type ProfileFormData, type Profile } from "@/types/profile";
import { revalidatePath } from 'next/cache';

// Get user profile
export async function getUserProfile() {
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                error: 'User not authenticated'
            };
        }

        const userId = session.userId;
        const profile = await prisma.profile.findUnique({
            where: { userId }
        });

        // Handle additional UI fields that aren't in the database
        const formattedProfile = profile ? {
            ...profile,
            location: '', // These fields aren't in DB but needed for UI
            socialLinks: {
                twitter: '',
                facebook: '',
                instagram: '',
                linkedin: '',
                github: '',
                website: ''
            }
        } : null;

        return {
            success: true,
            data: formattedProfile
        };
    } catch (error) {
        console.error('Error getting user profile:', error);
        return {
            success: false,
            error: 'Failed to retrieve user profile'
        };
    }
}

// Create or update user profile
export async function updateUserProfile(formData: FormData) {
    try {
        const session = await getSession();
        if (!session) {
            return {
                success: false,
                error: 'User not authenticated'
            };
        }

        const userId = session.userId;

        // Parse form data
        const rawData: Partial<ProfileFormData> = { userId };

        // Process form data fields
        formData.forEach((value, key) => {
            if (key === 'socialLinks') {
                try {
                    rawData.socialLinks = value ? JSON.parse(value.toString()) : {};
                } catch (e) {
                    console.error('Error parsing social links JSON:', e);
                    rawData.socialLinks = {};
                }
            } else if (key === 'gender' && value) {
                // Handle gender enum validation
                rawData.gender = value.toString() as any;
            } else {
                // @ts-ignore - Handle dynamic key assignment
                rawData[key] = value.toString();
            }
        });

        // Validate with schema
        const validation = profileSchema.safeParse({
            ...rawData,
            userId
        });

        if (!validation.success) {
            const errors = validation.error.flatten().fieldErrors;
            return {
                success: false,
                error: 'Form validation failed',
                details: errors
            };
        }

        // Transform validated data to match the database schema
        // Ensure the data is correctly typed as ProfileFormData with required userId
        const profileData: ProfileFormData = {
            userId,
            ...validation.data as any
        };
        
        const dbData = transformProfileForDatabase(profileData);

        // Check if profile exists
        const existingProfile = await prisma.profile.findUnique({
            where: { userId }
        });

        // Update or create profile with exactly the fields that exist in the Prisma schema
        let updatedProfile;
        if (existingProfile) {
            updatedProfile = await prisma.profile.update({
                where: { userId },
                data: dbData
            });
        } else {
            updatedProfile = await prisma.profile.create({
                data: dbData
            });
        }

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
            error: 'Failed to update profile'
        };
    }
}