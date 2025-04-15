"use server"
import { prisma } from "@/lib/prisma";
import { RegisterFormState, RegisterSchema } from "@/types/auth";
import bcrypt from 'bcryptjs';
import { revalidatePath } from "next/cache";
import { z } from 'zod';
import { createEmailVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email/resend';



// Registration with email and password
export async function handleRegister(prevState: RegisterFormState, formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
        // Validate register form data using RegisterSchema
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
                    email: 'Email is already registered',
                    general: ''
                }
            };
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);

        // Create the user with email verification status as null (unverified)
        const user = await prisma.user.create({
            data: {
                name: validatedData.name,
                email: validatedData.email,
                password: hashedPassword,
                emailVerified: null, // User email is not verified yet
            }
        });

        // Generate email verification token
        const verificationToken = await createEmailVerificationToken(user.id);
        
        // Send verification email
        await sendVerificationEmail(user.email, verificationToken);

        revalidatePath('/login');
        return {
            errors: { general: '' },
            success: true,
            message: 'Registration successful! Please check your email to verify your account.'
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
                general: "Failed to create account. Please try again.",
                email: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            success: false
        };
    }
}
