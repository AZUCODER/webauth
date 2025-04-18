import { PostStatus } from "@prisma/client";
import { z } from "zod";

// Define form schema using Prisma types for better type safety
export const postSchema = z.object({
    title: z.string().min(1, "title is required").max(255, "title is too long"),
    content: z.string().min(1, "content is required"),
    excerpt: z.string().optional(),
    featuredImage: z.string().url("image url is invalid").optional(),
    status: z.nativeEnum(PostStatus),
    isFeatured: z.boolean(),
    categoryId: z.string().optional(),
});

// Define post form data type based on the schema
export type PostFormData = z.infer<typeof postSchema>;


//define post category type
export type Category = {
    id: string;
    name: string;
    slug: string;
    description: string | null;
};

// Define the schema for category creation/updating
export const categorySchema = z.object({
    name: z.string().min(1, "title is requuired.").max(100, "title is too long."),
    description: z.string().optional(),
});

export type CateFormData = z.infer<typeof categorySchema>