'use server'

import prisma from '@/lib/prisma';
import { 
  validateVerificationToken, 
  markTokenAsUsed 
} from '@/lib/tokens';
import { sendWelcomeEmail } from '@/lib/email/resend';

interface VerificationResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Verifies a user's email using a verification token
 */
export async function verifyEmail(token: string): Promise<VerificationResult> {
  try {
    // Validate the token
    const { userId, valid, error } = await validateVerificationToken(token);
    
    if (!valid || !userId) {
      return { 
        success: false, 
        error: error || 'Invalid or expired verification token.' 
      };
    }
    
    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return { 
        success: false, 
        error: 'User not found.' 
      };
    }
    
    // If user is already verified, just return success
    if (user.emailVerified) {
      await markTokenAsUsed(token);
      return { 
        success: true, 
        message: 'Your email is already verified. You can now log in.' 
      };
    }
    
    // Update user as verified
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: new Date() }
    });
    
    // Mark token as used
    await markTokenAsUsed(token);
    
    // Send welcome email
    await sendWelcomeEmail(user.email, user.name || '');
    
    return { 
      success: true, 
      message: 'Email verified successfully! You can now log in.' 
    };
  } catch (error) {
    console.error('Email verification error:', error);
    return { 
      success: false, 
      error: 'An error occurred during verification. Please try again.' 
    };
  }
}

/**
 * Resends a verification email to a user
 */
export async function resendVerificationEmail(email: string): Promise<VerificationResult> {
  try {
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      // Don't reveal that the user doesn't exist for security
      return { 
        success: true, 
        message: 'If your email is registered, a new verification link has been sent.' 
      };
    }
    
    // If already verified, just return
    if (user.emailVerified) {
      return { 
        success: true, 
        message: 'Your email is already verified. You can log in now.' 
      };
    }
    
    // Generate a new token and send verification email
    // Note: We're importing these here to avoid circular dependencies
    const { createEmailVerificationToken } = await import('@/lib/tokens');
    const { sendVerificationEmail } = await import('@/lib/email/resend');
    
    const verificationToken = await createEmailVerificationToken(user.id);
    await sendVerificationEmail(user.email, verificationToken);
    
    return { 
      success: true, 
      message: 'A new verification link has been sent to your email.' 
    };
  } catch (error) {
    console.error('Resend verification error:', error);
    return { 
      success: false, 
      error: 'Failed to send verification email. Please try again later.' 
    };
  }
} 