'use server'

import { getSession } from "@/lib/session/manager";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import slugify from 'slugify';
import { categorySchema } from '@/types/post'


type CategoryResult =
    | { success: true; categoryId: string; slug: string }
    | {
        success: false; error: string; details?: z.ZodFormattedError<{
            name: string;
            description?: string;
        }>
    };

// Create category
export async function createCategory(formData: FormData): Promise<CategoryResult> {
    try {
        // Get the current user session
        const session = await getSession();
        if (!session || !session.userId) {
            return { success: false, error: "Please login to continue" };
        }

        // Check if user is admin
        if (session.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized action!" };
        }

        // Extract and validate form data
        const rawData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string || undefined,
        };

        const validation = categorySchema.safeParse(rawData);
        if (!validation.success) {
            return {
                success: false,
                error: "Invalid form input values",
                details: validation.error.format()
            };
        }

        const validatedData = validation.data;

        // Generate unique slug from name
        let slug = slugify(validation.data.name, {
            replacement: '-',
            remove: /[*+~.()'"!:@]/g,
            lower: true,         // convert to lower case
            strict: true,
            locale: 'en',
            trim: true
        });

        // If the slug is empty (e.g., all special characters or non-Latin characters),
        // create a timestamp-based slug with a prefix
        if (!slug || slug.length === 0) {
            const timestamp = Date.now().toString(36);
            slug = `category-${timestamp}`;
        }

        // Ensure slug has a reasonable length (max 80 characters)
        if (slug.length > 80) {
            slug = slug.substring(0, 80);
        }

        // Check if slug exists and make unique if needed
        const existingCategoryWithSlug = await prisma.postCategory.findFirst({ 
            where: { slug } 
        });
        
        if (existingCategoryWithSlug) {
            // Add a unique timestamp and random string
            const timestamp = Date.now().toString(36);
            const randomStr = Math.random().toString(36).substring(2, 6);
            slug = `${slug}-${timestamp}-${randomStr}`;
            
            // Ensure slug still has a reasonable length
            if (slug.length > 100) {
                slug = slug.substring(0, 100);
            }
        }

        // Create category
        const category = await prisma.postCategory.create({
            data: {
                name: validatedData.name,
                description: validatedData.description,
                slug,
            },
        });

        revalidatePath("/post-categories/view");
        return { success: true, categoryId: category.id, slug: category.slug };
    } catch (error) {
        console.error("Category creation error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Category creation failed!"
        };
    }
}

// Get all categories (paginated)
export async function getCategories(page = 1, limit = 10) {
    try {
        const session = await getSession();
        if (!session || !session?.userId) {
            return null;
        }

        const skip = (page - 1) * limit;

        // Get categories with post count
        const categories = await prisma.postCategory.findMany({
            skip,
            take: limit,
            include: {
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: {
                name: 'asc',
            },
        });

        // Get total count for pagination
        const total = await prisma.postCategory.count();

        return {
            categories,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
            },
        };
    } catch (error) {
        console.error("Error fetching categories:", error);
        return null;
    }
}

// Get single category by id
export async function getCategoryById(id: string) {
    try {
        const session = await getSession();
        if (!session || !session?.userId) {
            return null;
        }

        const category = await prisma.postCategory.findUnique({
            where: { id },
        });

        return category;
    } catch (error) {
        console.error("Error fetching category:", error);
        return null;
    }
}

// Update category
export async function updateCategory(categoryId: string, formData: FormData): Promise<CategoryResult> {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return { success: false, error: "Unauthorized, please login to continue." };
        }

        // Check if user is admin
        if (session.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized action denied!" };
        }

        // Extract and validate form data
        const rawData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string || undefined,
        };

        const validation = categorySchema.safeParse(rawData);
        if (!validation.success) {
            return {
                success: false,
                error: "Invalid form input values",
                details: validation.error.format()
            };
        }

        const validatedData = validation.data;

        // Get the existing category
        const existingCategory = await prisma.postCategory.findUnique({
            where: { id: categoryId },
        });

        if (!existingCategory) {
            return { success: false, error: "Category not found!" };
        }

        // Generate new slug only if name has changed
        let slug = existingCategory.slug;
        if (validatedData.name !== existingCategory.name) {
            slug = slugify(validatedData.name, {
                replacement: '-',
                remove: /[*+~.()'"!:@]/g,
                lower: true,         // convert to lower case
                strict: true,
                locale: 'en',
                trim: true
            });

            // If the slug is empty (e.g., all special characters or non-Latin characters),
            // create a timestamp-based slug with a prefix
            if (!slug || slug.length === 0) {
                const timestamp = Date.now().toString(36);
                slug = `category-${timestamp}`;
            }

            // Ensure slug has a reasonable length (max 80 characters)
            if (slug.length > 80) {
                slug = slug.substring(0, 80);
            }

            // Check if slug exists and make unique if needed
            const existingCategoryWithSlug = await prisma.postCategory.findFirst({
                where: {
                    slug,
                    id: { not: categoryId }
                }
            });
            
            if (existingCategoryWithSlug) {
                // Add a unique timestamp and random string
                const timestamp = Date.now().toString(36);
                const randomStr = Math.random().toString(36).substring(2, 6);
                slug = `${slug}-${timestamp}-${randomStr}`;
                
                // Ensure slug still has a reasonable length
                if (slug.length > 100) {
                    slug = slug.substring(0, 100);
                }
            }
        }

        // Update category
        const category = await prisma.postCategory.update({
            where: { id: categoryId },
            data: {
                name: validatedData.name,
                description: validatedData.description,
                slug,
            },
        });

        revalidatePath("/post-categories/view");
        return { success: true, categoryId: category.id, slug: category.slug };
    } catch (error) {
        console.error("Category update error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Category update failed!"
        };
    }
}

// Delete category
export async function deleteCategory(categoryId: string) {
    try {
        const session = await getSession();
        if (!session || !session.userId) {
            return { success: false, error: "Unauthorized action, please login to continue!" };
        }

        // Check if user is admin
        if (session.role !== 'ADMIN') {
            return { success: false, error: "Unauthorized action!" };
        }

        // Check if category has posts
        const categoryWithPostCount = await prisma.postCategory.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: { posts: true }
                }
            }
        });

        if (categoryWithPostCount?._count.posts && categoryWithPostCount._count.posts > 0) {
            return {
                success: false,
                error: `This category has ${categoryWithPostCount._count.posts} related posts. Please delete those posts first.`
            };
        }

        await prisma.postCategory.delete({
            where: { id: categoryId },
        });

        revalidatePath("/post-categories/view");
        return { success: true };
    } catch (error) {
        console.error("Category deletion error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete the category!"
        };
    }
} 