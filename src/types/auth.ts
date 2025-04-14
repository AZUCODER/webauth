import { z } from 'zod';

// Email validation with specific rules
const emailSchema = z.string()
    .min(6, "Email is required")
    .email("Please enter a valid email address")
    .max(255, "Email must not exceed 255 characters")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format");

// Password validation with strong security rules
const passwordSchema = z.string()
    .min(8, "Password must be at least 8 characters")
    .max(20, "Password must not exceed 20 characters")
    // .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    // .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    // .regex(/[0-9]/, "Password must contain at least one number")
    // .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .refine((password) => {
        // Check for common passwords
        const commonPasswords = [
            'password123', '12345678', 'qwerty123', 'admin123',
            'letmein123', 'welcome123', 'monkey123', 'football123'
        ];
        return !commonPasswords.includes(password.toLowerCase());
    }, "This password is too common. Please choose a stronger password");


    
// Login form validation
export const LoginSchema = z.object({
    email: emailSchema,
    password: z.string()
        .min(1, "Password is required")
        .max(100, "Password must not exceed 100 characters")
});

// Registration form validation
export const RegisterSchema = z.object({
    name: z.string()
        .min(3, "name is required")
        .max(20, "name must not exceed 20 characters"),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string()
        .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});


// Password reset request validation
export const PasswordResetRequestSchema = z.object({
    email: emailSchema
});

// Password reset validation
export const PasswordResetSchema = z.object({
    token: z.string().min(1, "Reset token is required"),
    password: passwordSchema,
    confirmPassword: z.string()
        .min(1, "Please confirm your password")
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
});

// Types for form state
export type LoginFormState = {
    errors: {
        email?: string;
        password?: string;
        general?: string;
    };
    success?: boolean;
};

export type RegisterFormState = {
    errors: {
        email?: string;
        name?: string;
        password?: string;
        confirmPassword?: string;
        general?: string;
    };
    success?: boolean;
};

export type PasswordResetFormState = {
    errors: {
        email?: string;
        token?: string;
        password?: string;
        confirmPassword?: string;
        general?: string;
    };
    success?: boolean;
};


