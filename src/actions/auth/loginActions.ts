"use server"
import prisma from "@/lib/prisma";
import { LoginFormState, LoginSchema } from "@/types/auth";
import bcrypt from 'bcryptjs';
import { revalidatePath } from "next/cache";
import { z } from 'zod';
import { createSession } from '@/lib/session/actions';
import { createEmailVerificationToken } from '@/lib/tokens';
import { sendVerificationEmail } from '@/lib/email/resend';

export default async function handleLogin(prevState: LoginFormState, formData: FormData) {
    // Check for JWT secret
    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is not configured')
        return { errors: { email: 'Server configuration error', general: '' } }
    };
    
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
        // 1. Validate login form data
        const validatedData = LoginSchema.parse({ email, password });

        // 2. Find the user in DB
        const user = await prisma.user.findUnique({
            where: { email: validatedData.email }
        });

        if (!user) {
            return { errors: { email: 'User does not exist.', general: '' } }
        };

        // 3. Verify password
        const passwordMatch = await bcrypt.compare(validatedData.password, user.password);
        if (!passwordMatch) {
            return { errors: { password: 'Email or Password incorrect!', general: '' } }
        };

        // 4. Check if email is verified
        if (!user.emailVerified) {
            // Email not verified - generate a new token and send verification email
            const verificationToken = await createEmailVerificationToken(user.id);
            await sendVerificationEmail(user.email, verificationToken);
            
            return { 
                errors: { 
                    general: 'Email not verified. We have sent a new verification email to your address.' 
                },
                success: false,
                requiresVerification: true
            };
        }

        // 5. Create session
        await createSession({
            userId: user.id,
            username: user.name || '',
            email: user.email,
            role: user.role,
            lastLogin: new Date().toISOString()
        });

        // 6. Update lastLogin
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() }
        });

        // 7. Revalidate the dashboard path
        revalidatePath('/dashboard');

        return {
            errors: { general: '' },
            success: true
        };
    } catch (error) {
        console.error('Login error:', error)
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
                email: 'Failed to sign in, please try again later!',
                general: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            success: false
        };
    }
}