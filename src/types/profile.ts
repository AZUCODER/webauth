import { z } from 'zod';


// Define social links type
export type SocialLinks = {
  website?: string;
  github?: string;
  tiktok?: string;
  wechat?: string;
};

// Social links schema - not in Prisma schema but kept for UI functionality
const socialLinksSchema = z.object({
  tiktok: z.string().url("Invalid TikTok URL").optional().or(z.literal('')),
  wechat: z.string().url("Invalid WeChat URL").optional().or(z.literal('')),
  github: z.string().url("Invalid GitHub URL").optional().or(z.literal('')),
  website: z.string().url("Invalid Website URL").optional().or(z.literal('')),
}).optional();

// Profile validation schema aligned with Prisma schema
export const profileSchema = z.object({
  id: z.string().optional(), // Will be auto-generated for new profiles
  userId: z.string().optional(), // Required for linking to User model but will be filled automatically
  avatar: z.string().url("Invalid avatar URL").optional().or(z.literal('')),
  position: z.string().max(100, "Position is too long").min(1, "Position is required").optional().or(z.literal('')),
  bio: z.string().max(1000, "Bio is too long").min(1, "Bio is required").optional().or(z.literal('')),
  // Fields not in Prisma schema but needed for UI
  socialLinks: socialLinksSchema,
  createdAt: z.date().optional(), // Read-only, set by the database
  updatedAt: z.date().optional(), // Read-only, set by the database
});

// Form schema for client-side validation (stricter than the profile schema)
export const profileFormSchema = z.object({
  bio: z.string().min(1, "Bio is required").max(1000, "Bio is too long"),
  position: z.string().min(1, "Position is required").max(100, "Position is too long"),
  avatar: z.string().min(1, "Profile picture is required").url("Invalid avatar URL"),
  socialLinks: z.object({
    website: z.string().url("Invalid Website URL").optional().or(z.literal('')),
  }),
});

// Form state type for validation errors and success message
export type ProfileFormState = {
  errors: {
    avatar?: string;
    position?: string;
    bio?: string;
    socialLinks?: string;
  };
  success?: boolean;
};

