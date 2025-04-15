'use server'

import prisma from "@/lib/prisma";
import { TokenType } from "@prisma/client";
import { z } from "zod";
import { 
  generateToken,
  validatePasswordResetToken,
  markTokenAsUsed
} from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import bcrypt from "bcryptjs";

// Schema for requesting password reset
const RequestResetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Schema for password reset
const ResetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(72, "Password must be less than 72 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  confirmPassword: z.string(),
  token: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

// Request a password reset
export async function requestPasswordReset(email: string) {
  try {
    // Validate email
    const { email: validatedEmail } = RequestResetSchema.parse({ email });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: validatedEmail },
    });

    // For security reasons, we don't want to disclose if a user exists or not
    if (!user) {
      return {
        success: true,
        message: "If your email exists in our system, you will receive a password reset link shortly",
      };
    }

    // Delete any existing password reset tokens for this user
    await prisma.token.deleteMany({
      where: {
        userId: user.id,
        type: TokenType.PASSWORD_RESET,
        invalidated: false,
        usedAt: null,
      },
    });

    // Create a new token
    const token = await generateToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    await prisma.token.create({
      data: {
        userId: user.id,
        type: TokenType.PASSWORD_RESET,
        value: token,
        expiresAt,
      },
    });

    // Send password reset email
    await sendPasswordResetEmail(user.email, token);

    return {
      success: true,
      message: "If your email exists in our system, you will receive a password reset link shortly",
    };
  } catch (error) {
    console.error("Error in requestPasswordReset:", error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      };
    }
    
    return {
      success: false,
      error: "Failed to send password reset email. Please try again later.",
    };
  }
}

// Reset password using token
export async function resetPassword(
  token: string,
  password: string,
  confirmPassword: string
) {
  try {
    // Validate input
    const validatedData = ResetPasswordSchema.parse({
      password,
      confirmPassword,
      token,
    });

    // Validate token
    const validationResult = await validatePasswordResetToken(token);
    
    if (!validationResult.valid || !validationResult.userId) {
      return {
        success: false,
        error: validationResult.error || "Invalid or expired token",
      };
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Update user password
    await prisma.user.update({
      where: {
        id: validationResult.userId,
      },
      data: {
        password: hashedPassword,
        updatedAt: new Date(),
      },
    });

    // Mark token as used
    await markTokenAsUsed(token);

    return {
      success: true,
      message: "Your password has been reset successfully. You can now log in with your new password.",
    };
  } catch (error) {
    console.error("Error in resetPassword:", error);
    
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.reduce((acc, curr) => {
        return {
          ...acc,
          [curr.path[0]]: curr.message,
        };
      }, {} as Record<string, string>);
      
      return {
        success: false,
        fieldErrors,
      };
    }
    
    return {
      success: false,
      error: "Failed to reset password. Please try again later.",
    };
  }
} 