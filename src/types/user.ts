import { z } from 'zod';
export type UserRole = "USER" | "EDITOR" | "MANAGER" | "ADMIN";

export interface User {
    id: string;
    email: string;
    name: string | null;
    role: UserRole;
    createdAt?: Date;
    updatedAt?: Date;
    emailVerified?: Date | null;
}

// Schema for user creation and update
export const UserSchema = z.object({
    email: z.string().email({ message: "Invalid Email" }),
    name: z.string().min(3, { message: "At least 3 characters long" }).optional().nullable(),
    password: z.string().min(8, { message: "At least 8 characters" }).optional(),
    role: z.enum(['USER', 'EDITOR', 'MANAGER','ADMIN'], {
        errorMap: () => ({ message: "you have at least select a role" })
    }),
})