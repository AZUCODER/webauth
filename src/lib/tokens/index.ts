'use server'

import { TokenType } from '@prisma/client';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';

/**
 * Generates a secure random token
 */
export async function generateToken(length: number = 32): Promise<string> {
  return randomBytes(length).toString('hex');
}

/**
 * Creates an email verification token
 */
export async function createEmailVerificationToken(userId: string): Promise<string> {
  // Delete any existing email verification tokens for this user
  await prisma.token.deleteMany({
    where: {
      userId,
      type: TokenType.EMAIL_VERIFICATION,
      invalidated: false,
      usedAt: null,
    },
  });

  // Create a new token
  const token = await generateToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // Token expires in 24 hours

  await prisma.token.create({
    data: {
      userId,
      type: TokenType.EMAIL_VERIFICATION,
      value: token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Creates a password reset token
 */
export async function createPasswordResetToken(userId: string): Promise<string> {
  // Delete any existing password reset tokens for this user
  await prisma.token.deleteMany({
    where: {
      userId,
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
      userId,
      type: TokenType.PASSWORD_RESET,
      value: token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Validates an email verification token
 */
export async function validateVerificationToken(token: string): Promise<{
  userId: string;
  valid: boolean;
  error?: string;
}> {
  const verificationToken = await prisma.token.findFirst({
    where: {
      value: token,
      type: TokenType.EMAIL_VERIFICATION,
      invalidated: false,
      usedAt: null,
    },
  });

  if (!verificationToken) {
    return { userId: '', valid: false, error: 'Invalid or expired token' };
  }

  const currentDate = new Date();
  if (verificationToken.expiresAt < currentDate) {
    // Mark token as invalidated
    await prisma.token.update({
      where: { id: verificationToken.id },
      data: { invalidated: true },
    });
    return { userId: '', valid: false, error: 'Token has expired' };
  }

  return { userId: verificationToken.userId, valid: true };
}

/**
 * Validates a password reset token
 */
export async function validatePasswordResetToken(token: string): Promise<{
  userId: string;
  valid: boolean;
  error?: string;
}> {
  const resetToken = await prisma.token.findFirst({
    where: {
      value: token,
      type: TokenType.PASSWORD_RESET,
      invalidated: false,
      usedAt: null,
    },
  });

  if (!resetToken) {
    return { userId: '', valid: false, error: 'Invalid or expired token' };
  }

  const currentDate = new Date();
  if (resetToken.expiresAt < currentDate) {
    // Mark token as invalidated
    await prisma.token.update({
      where: { id: resetToken.id },
      data: { invalidated: true },
    });
    return { userId: '', valid: false, error: 'Token has expired' };
  }

  return { userId: resetToken.userId, valid: true };
}

/**
 * Marks a token as used
 */
export async function markTokenAsUsed(token: string): Promise<void> {
  await prisma.token.updateMany({
    where: {
      value: token,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
} 