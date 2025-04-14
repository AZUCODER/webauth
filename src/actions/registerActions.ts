"use server"
import { prisma } from "@/lib/prisma";
import { RegisterFormState, RegisterSchema } from "@/types/auth";
import bcrypt from 'bcryptjs';
import { revalidatePath } from "next/cache";
import { z } from 'zod';



// Registration with email and password
export async function registerHandler(prevState: RegisterFormState, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
        // Validate form data using RegisterSchema
        const validatedData = RegisterSchema.parse({
            name,
            email,
            password,
            confirmPassword
        });

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (existingUser) {
            return {
                errors: {
                    email: 'email is taken',
                    general: ''
                }
            };
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
            }
        });

        revalidatePath('/login');
        return {
            errors: { general: '' },
            success: true
        };

    } catch (error) {
        console.error('Registration error:', error);
        if (error instanceof z.ZodError) {
            return {
                errors: {
                    ...error.errors.reduce((acc, curr) => ({
                        ...acc,
                        [curr.path[0]]: curr.message
                    }), {}),
                    general: ''
                }
            };
        }
        return {
            errors: {
                general: "failed to create account. please try again",
                email: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            success: false
        };
    }
}
