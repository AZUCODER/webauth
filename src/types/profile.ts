import { z } from 'zod';

// Enum for Gender to match Prisma schema
export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
  PREFER_NOT_TO_SAY = 'PREFER_NOT_TO_SAY',
}

// Social links schema - not in Prisma schema but kept for UI functionality
const socialLinksSchema = z.object({
  twitter: z.string().url("Invalid Twitter URL").optional().or(z.literal('')),
  facebook: z.string().url("Invalid Facebook URL").optional().or(z.literal('')),
  instagram: z.string().url("Invalid Instagram URL").optional().or(z.literal('')),
  linkedin: z.string().url("Invalid LinkedIn URL").optional().or(z.literal('')),
  github: z.string().url("Invalid GitHub URL").optional().or(z.literal('')),
  website: z.string().url("Invalid Website URL").optional().or(z.literal('')),
}).optional();

// Profile validation schema aligned with Prisma schema
export const profileSchema = z.object({
  id: z.string().optional(), // Will be auto-generated for new profiles
  userId: z.string(), // Required for linking to User model
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal('')),
  gender: z.nativeEnum(Gender).optional(),
  position: z.string().max(100, "Position is too long").optional().or(z.literal('')),
  idCard: z.string().max(30, "ID card number is too long").optional().or(z.literal('')),
  nationality: z.string().max(50, "Nationality is too long").optional().or(z.literal('')),
  homeDomicile: z.string().max(200, "Home address is too long").optional().or(z.literal('')),
  bio: z.string().max(1000, "Bio is too long").optional().or(z.literal('')),
  // Fields not in Prisma schema but needed for UI
  location: z.string().max(100, "Location is too long").optional().or(z.literal('')),
  socialLinks: socialLinksSchema,
  createdAt: z.date().optional(), // Read-only, set by the database
  updatedAt: z.date().optional(), // Read-only, set by the database
});

// Database Profile type - matches exact Prisma schema
export type ProfileDB = {
  id: string;
  userId: string;
  avatar: string | null;
  gender: Gender | null;
  position: string | null;
  idCard: string | null;
  nationality: string | null;
  homeDomicile: string | null;
  bio: string | null;
  createdAt: Date;
  updatedAt: Date;
};

// Extended Profile type for frontend use (includes social links not in DB)
export type Profile = Omit<ProfileDB, 'createdAt' | 'updatedAt'> & {
  location?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
};

// Form input type for creating/updating profiles
export type ProfileFormData = Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;

// Form state type for validation errors and success message
export type ProfileFormState = {
  errors: {
    avatar?: string;
    gender?: string;
    position?: string;
    idCard?: string;
    nationality?: string;
    homeDomicile?: string;
    bio?: string;
    location?: string;
    socialLinks?: string;
    general?: string;
  };
  success?: boolean;
};

// Helper function to convert ProfileFormData to Prisma data structure
export const transformProfileForDatabase = (formData: ProfileFormData): Omit<ProfileDB, 'id' | 'createdAt' | 'updatedAt'> => {
  // Extract only the fields that exist in the Prisma schema
  const { 
    userId, 
    avatar, 
    gender, 
    position, 
    idCard, 
    nationality, 
    homeDomicile, 
    bio 
  } = formData;
  
  return {
    userId,
    avatar: avatar || null,
    gender: gender || null,
    position: position || null,
    idCard: idCard || null,
    nationality: nationality || null,
    homeDomicile: homeDomicile || null,
    bio: bio || null,
  };
};