'use server'

import { getSession } from "@/lib/session/manager";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { PostStatus } from "@prisma/client";

import slugify from 'slugify';
import { postSchema } from "@/types/post";


type PostResult =
    | { success: true; postId: string; slug: string }
    | { success: false; error: string; details?: z.ZodFormattedError<typeof postSchema> };

// Create post
export async function createPost(formData: FormData): Promise<PostResult> {
    try {
        // Get the current user session
        const session = await getSession();
        if (!session || !session.userId) {
            return { success: false, error: "Unauthorized, pleae login to continue!" };
        }

        // Extract and validate form data
        const rawData = {
            title: formData.get("title") as string,
            content: formData.get("content") as string,
            excerpt: formData.get("excerpt") as string || undefined,
            featuredImage: formData.get("featuredImage") as string || undefined,
            status: formData.get("status") as string,
            isFeatured: formData.get("isFeatured") === "true" ? true : false,
            categoryId: formData.get("categoryId") as string || undefined,
        };

        const validation = postSchema.safeParse(rawData);
        if (!validation.success) {
            return {
                success: false,
                error: "Invalid form data",
                details: validation.error.format()
            };
        }

        const validatedData = validation.data;

        // Generate unique slug from title
        let slug = slugify(validation.data.title, {
            replacement: '-',     // replace spaces with replacement character
            remove: /[*+~.()'"!:@]/g, // remove characters that match regex, defaults to `undefined`
            lower: true,         // convert to lower case
            strict: true,        // strip special characters
            locale: 'en',        // use English locale
            trim: true           // trim leading and trailing replacement chars
        });

        // If the slug is empty (e.g., all special characters or non-Latin characters),
        // create a timestamp-based slug with a prefix
        if (!slug || slug.length === 0) {
            const timestamp = Date.now().toString(36); // base36 for shorter string
            slug = `post-${timestamp}`;
        }

        // Ensure slug has a reasonable length (max 80 characters)
        if (slug.length > 80) {
            slug = slug.substring(0, 80);
        }

        // Check if slug exists and make unique if needed
        const existingPostWithSlug = await prisma.post.findFirst({ 
            where: { slug } 
        });
        
        if (existingPostWithSlug) {
            // Add a unique timestamp and random string
            const timestamp = Date.now().toString(36);
            const randomStr = Math.random().toString(36).substring(2, 6);
            slug = `${slug}-${timestamp}-${randomStr}`;
            
            // Ensure slug still has a reasonable length
            if (slug.length > 100) {
                slug = slug.substring(0, 100);
            }
        }

        // Create post
        const post = await prisma.post.create({
            data: {
                title: validatedData.title,
                content: validatedData.content,
                excerpt: validatedData.excerpt,
                featuredImage: validatedData.featuredImage,
                status: validatedData.status,
                isFeatured: validatedData.isFeatured,
                categoryId: validatedData.categoryId,
                slug,
                authorId: session.userId,
                publishedAt: validatedData.status === "PUBLISHED" ? new Date() : null,
            },
        });

        // Update correct paths
        revalidatePath("/posts/view");

        return { success: true, postId: post.id, slug: post.slug };
    } catch (error) {
        console.error("Post creation error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create post"
        };
    }
}

// Get all posts (paginated)
export async function getPosts(page = 1, limit = 10, status?: PostStatus) {
    try {
        const session = await getSession();
        if (!session || !session?.userId) {
            return null; // Caller should handle redirection
        }

        const skip = (page - 1) * limit;

        // Get posts with author information
        const posts = await prisma.post.findMany({
            skip,
            take: limit,
            where: {
                ...(status && { status }),
                authorId: session.userId,
            },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                category: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        // Get total count for pagination
        const total = await prisma.post.count({
            where: {
                ...(status && { status }),
                authorId: session.userId,
            },
        });

        return {
            posts,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                totalItems: total,
            },
        };
    } catch (error) {
        console.error("Error fetching posts:", error);
        return null;
    }
}

// Get single post by slug
export async function getPostBySlug(slug: string) {
    try {
        const session = await getSession();
        if (!session) {
            // Using return null instead of redirect to avoid NEXT_REDIRECT error
            // The component using this function should handle the redirection
            return null;
        }

        if (!session?.userId) return null;

        const post = await prisma.post.findUnique({
            where: {
                slug,
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                category: true,
            },
        });

        if (!post) return null;

        // Check if user is authorized to view this post
        const isAuthor = post.authorId === session.userId;
        const isAdmin = session.role === 'ADMIN';
        const isPublished = post.status === 'PUBLISHED';

        if (!isAuthor && !isAdmin && !isPublished) {
            return null;
        }

        return post;
    } catch (error) {
        console.error("Error fetching post:", error);
        return null;
    }
}

// Update post
export async function updatePost(postId: string, formData: FormData): Promise<PostResult> {
    try {
        const session = await getSession();
        if (!session || !session?.userId) {
            return { success: false, error: "Unauthorized: Please log in" };
        }

        // Find the post first
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return { success: false, error: "Post not found" };
        }

        // Check if user is authorized to update this post
        if (post.authorId !== session.userId && session.role !== 'ADMIN') {
            return { success: false, error: "Not authorized to update this post" };
        }

        // Extract and validate form data
        const rawData = {
            contentType: formData.get("contentType") as string,
            title: formData.get("title") as string,
            content: formData.get("content") as string,
            excerpt: formData.get("excerpt") as string || undefined,
            featuredImage: formData.get("featuredImage") as string || undefined,
            status: formData.get("status") as string,
            isFeatured: formData.get("isFeatured") === "true" ? true : false,
            categoryId: formData.get("categoryId") as string || undefined,
        };

        const validation = postSchema.safeParse(rawData);
        if (!validation.success) {
            return {
                success: false,
                error: "Invalid form data",
                details: validation.error.format()
            };
        }

        const validatedData = validation.data;

        // Check if title has changed, update slug if needed
        let slug = post.slug;
        if (post.title !== validatedData.title) {
            // Use the same slugify approach as createPost for consistency
            slug = slugify(validatedData.title, {
                replacement: '-',     // replace spaces with replacement character
                remove: /[*+~.()'"!:@]/g, // remove characters that match regex
                lower: true,         // convert to lower case
                strict: true,        // strip special characters
                locale: 'en',        // use Chinese locale
                trim: true           // trim leading and trailing replacement chars
            });

            // If the slug is empty (e.g., all special characters or non-Latin characters),
            // create a timestamp-based slug with a prefix
            if (!slug || slug.length === 0) {
                const timestamp = Date.now().toString(36); // base36 for shorter string
                slug = `post-${timestamp}`;
            }

            // Ensure slug has a reasonable length (max 80 characters)
            if (slug.length > 80) {
                slug = slug.substring(0, 80);
            }

            // Check if new slug exists and make unique if needed
            const existingPostWithSlug = await prisma.post.findFirst({
                where: {
                    slug,
                    id: { not: postId }
                }
            });
            
            if (existingPostWithSlug) {
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

        // Update publishedAt if status has changed to PUBLISHED
        let publishedAt = post.publishedAt;
        if (!publishedAt && validatedData.status === "PUBLISHED") {
            publishedAt = new Date();
        }

        // Update the post
        const updatedPost = await prisma.post.update({
            where: { id: postId },
            data: {
                title: validatedData.title,
                content: validatedData.content,
                excerpt: validatedData.excerpt,
                featuredImage: validatedData.featuredImage,
                status: validatedData.status,
                isFeatured: validatedData.isFeatured,
                categoryId: validatedData.categoryId,
                slug,
                publishedAt,
            },
        });

        // Update correct paths
        revalidatePath("/posts/view");
        revalidatePath(`/posts/view/${slug}`);

        return { success: true, postId: updatedPost.id, slug: updatedPost.slug };
    } catch (error) {
        console.error("Post update error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to update post"
        };
    }
}

// Delete post
export async function deletePost(postId: string) {
    try {
        const session = await getSession();
        if (!session || !session?.userId) {
            return { success: false, error: "Unauthorized: Please log in" };
        }

        // Find the post first
        const post = await prisma.post.findUnique({
            where: { id: postId },
        });

        if (!post) {
            return { success: false, error: "Post not found" };
        }

        // Check if user is authorized to delete this post
        if (post.authorId !== session.userId && session.role !== 'ADMIN') {
            return { success: false, error: "Not authorized to delete this post" };
        }

        // Delete the post
        await prisma.post.delete({
            where: { id: postId },
        });

        revalidatePath('/posts/view');

        return { success: true };
    } catch (error) {
        console.error("Post deletion error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete post"
        };
    }
}

// Get all categories
export async function getCategories() {
    try {
        const session = await getSession();
        if (!session || !session?.userId) {
            return null;
        }

        const categories = await prisma.postCategory.findMany({
            orderBy: {
                name: 'asc',
            },
        });

        return categories;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return null;
    }
} 