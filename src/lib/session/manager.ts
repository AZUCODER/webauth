import { cookies } from 'next/headers';
import { jwtVerify, SignJWT } from 'jose';
import { type SessionUser, type SessionOptions, type SessionError, type SessionStatus, type SessionMetadata } from '@/lib/session/types';
import { SESSION_CONSTANTS, DEFAULT_SESSION_OPTIONS } from '@/lib/session/constants';
import { headers } from 'next/headers'

export class SessionManager {
    private static instance: SessionManager;
    private readonly encoder = new TextEncoder();

    private constructor() { }

    public static getInstance(): SessionManager {
        if (!SessionManager.instance) {
            SessionManager.instance = new SessionManager();
        }
        return SessionManager.instance;
    }

    /**
     * Creates a new session for a user
     */
    public async createSession(
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
                .sign(this.encoder.encode(process.env.JWT_SECRET));

            const cookieStore = await cookies();
            cookieStore.set(SESSION_CONSTANTS.COOKIE_NAME, jwt, mergedOptions);

            // Store session metadata
            await this.updateSessionMetadata(user.userId);

        } catch (error) {
            console.error(`[${new Date().toISOString()}] Session creation failed for user ${user.userId}:`, error);
            throw this.createSessionError('Failed to create session', 'SESSION_INVALID');
        }
    }

    /**
     * Gets the current session
     */
    public async getSession(): Promise<SessionUser | null> {
        try {
            const cookieStore = await cookies();
            const sessionCookie = cookieStore.get(SESSION_CONSTANTS.COOKIE_NAME);

            if (!sessionCookie) {
                return null;
            }

            const { payload } = await jwtVerify(
                sessionCookie.value,
                this.encoder.encode(process.env.JWT_SECRET)
            );

            // Check if session needs refresh
            if (this.shouldRefreshSession(payload.exp as number)) {
                await this.refreshSession();
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
            await this.destroySession();
            return null;
        }
    }

    /**
     * Checks session status
     */
    public async checkSessionStatus(): Promise<SessionStatus> {
        try {
            const session = await this.getSession();

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
            return { isValid: false, isExpired: true };
        }
    }

    /**
     * Refreshes the current session
     */
    public async refreshSession(): Promise<void> {
        try {
            const currentSession = await this.getSession();

            if (!currentSession) {
                throw this.createSessionError('No session to refresh', 'SESSION_NOT_FOUND');
            }

            await this.createSession(currentSession);

        } catch (error) {
            console.error(`[${new Date().toISOString()}] Session refresh failed:`, error);
            throw this.createSessionError('Failed to refresh session', 'SESSION_INVALID');
        }
    }

    /**
     * Destroys the current session
     */
    public async destroySession(): Promise<void> {
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
            throw this.createSessionError('Failed to destroy session', 'SESSION_INVALID');
        }
    }

    /**
     * Updates session metadata
     */
    private async updateSessionMetadata(userId: string): Promise<void> {
        const headersList = await headers();
        const metadata: SessionMetadata = {
            createdAt: new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            expiresAt: new Date(Date.now() + DEFAULT_SESSION_OPTIONS.maxAge! * 1000).toISOString(),
            userAgent: headersList.get('user-agent') ?? undefined,
            ipAddress: headersList.get('x-forwarded-for') ?? undefined
        };

        // Here you could store this metadata in your database
        console.log(`Session metadata updated for user ${userId}:`, metadata);
    }

    /**
     * Checks if session should be refreshed
     */
    private shouldRefreshSession(expiration?: number): boolean {
        if (!expiration) return false;

        const now = Math.floor(Date.now() / 1000);
        const timeUntilExpiry = expiration - now;

        return timeUntilExpiry < SESSION_CONSTANTS.REFRESH_THRESHOLD;
    }

    /**
     * Creates a session error
     */
    private createSessionError(
        message: string,
        code: SessionError['code']
    ): SessionError {
        const error = new Error(message) as SessionError;
        error.code = code;
        error.timestamp = new Date().toISOString();
        return error;
    }
}