'use server'

import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { type SessionUser, type SessionOptions, type SessionError, type SessionStatus, type SessionMetadata } from '@/lib/session/types';
import { SESSION_CONSTANTS, DEFAULT_SESSION_OPTIONS } from '@/lib/session/constants';
import { headers } from 'next/headers'
import prisma from '@/lib/prisma';

// Private module state and utilities
const encoder = new TextEncoder();

/**
 * Creates a session error
 */
function createSessionError(
    message: string,
    code: SessionError['code']
): SessionError {
    const error = new Error(message) as SessionError;
    error.code = code;
    error.timestamp = new Date().toISOString();
    return error;
}

/**
 * Checks if session should be refreshed
 */
function shouldRefreshSession(expiration?: number): boolean {
    if (!expiration) return false;

    const now = Math.floor(Date.now() / 1000);
    const timeUntilExpiry = expiration - now;

    return timeUntilExpiry < SESSION_CONSTANTS.REFRESH_THRESHOLD;
}

/**
 * Updates session metadata
 */
async function updateSessionMetadata(userId: string): Promise<void> {
    const headersList = await headers();
    const metadata: SessionMetadata = {
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        expiresAt: new Date(Date.now() + DEFAULT_SESSION_OPTIONS.maxAge! * 1000).toISOString(),
        userAgent: headersList.get('user-agent') ?? undefined,
        ipAddress: headersList.get('x-forwarded-for') ?? undefined
    };

    try {
        // Store session metadata in database
        await prisma.session.create({
            data: {
                userId,
                userAgent: metadata.userAgent || 'Unknown',
                ipAddress: metadata.ipAddress || 'Unknown',
                createdAt: new Date(metadata.createdAt),
                expiresAt: new Date(metadata.expiresAt)
            }
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Failed to store session metadata for user ${userId}:`, error);
        // Don't throw error to avoid disrupting the login process
    }
}

/**
 * Creates a new session for a user
 */
export async function createSession(
    user: Omit<SessionUser, 'exp' | 'iat'>,
    options: SessionOptions = {}
): Promise<void> {
    try {
        const mergedOptions = { ...DEFAULT_SESSION_OPTIONS, ...options };
        const now = Math.floor(Date.now() / 1000);

        const jwt = await new SignJWT({
            ...user,
            iat: now,
            exp: now + mergedOptions.maxAge!
        })
            .setProtectedHeader({ alg: 'HS256' })
            .sign(encoder.encode(process.env.JWT_SECRET));

        const cookieStore = await cookies();
        cookieStore.set(SESSION_CONSTANTS.COOKIE_NAME, jwt, mergedOptions);

        // Store session metadata
        await updateSessionMetadata(user.userId);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Session creation failed for user ${user.userId}:`, error);
        throw createSessionError('Failed to create session', 'SESSION_INVALID');
    }
}

/**
 * Gets the current session
 */
export async function getSession(): Promise<SessionUser | null> {
    try {
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get(SESSION_CONSTANTS.COOKIE_NAME);

        if (!sessionCookie) {
            return null;
        }

        const { payload } = await jwtVerify(
            sessionCookie.value,
            encoder.encode(process.env.JWT_SECRET)
        );

        // Check if session needs refresh
        if (shouldRefreshSession(payload.exp as number)) {
            await refreshSession();
        }

        return {
            userId: payload.userId as string,
            username: payload.username as string,
            email: payload.email as string,
            role: payload.role as string,
            lastLogin: payload.lastLogin as string,
            exp: payload.exp as number,
            iat: payload.iat as number
        };

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Session verification failed:`, error);
        await destroySession();
        return null;
    }
}

/**
 * Checks session status
 */
export async function checkSessionStatus(): Promise<SessionStatus> {
    try {
        const session = await getSession();

        if (!session) {
            return { isValid: false, isExpired: true };
        }

        const now = Math.floor(Date.now() / 1000);
        const isExpired = session.exp ? session.exp < now : true;

        return {
            isValid: !isExpired,
            isExpired,
            remainingTime: session.exp ? session.exp - now : 0
        };

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Session status check failed:`, error);
        return { isValid: false, isExpired: true };
    }
}

/**
 * Refreshes the current session
 */
export async function refreshSession(): Promise<void> {
    try {
        const currentSession = await getSession();

        if (!currentSession) {
            throw createSessionError('No session to refresh', 'SESSION_NOT_FOUND');
        }

        await createSession(currentSession);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Session refresh failed:`, error);
        throw createSessionError('Failed to refresh session', 'SESSION_INVALID');
    }
}

/**
 * Destroys the current session
 */
export async function destroySession(): Promise<void> {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(SESSION_CONSTANTS.COOKIE_NAME);

        // Clear any other session-related cookies
        const relatedCookies = ['remember-me', 'user-preferences'];
        for (const cookieName of relatedCookies) {
            try {
                cookieStore.delete(cookieName);
            } catch (e) {
                console.warn(`Failed to delete cookie ${cookieName}:`, e);
            }
        }

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Session destruction failed:`, error);
        throw createSessionError('Failed to destroy session', 'SESSION_INVALID');
    }
}