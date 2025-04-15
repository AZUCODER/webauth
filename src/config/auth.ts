/**
 * List of all authentication-related cookie names used in the application
 */
export const COOKIE_NAMES = [
    'session',
    'user-preference',
    'auth-token',
    'refresh-token',
    'remember-me',
    'last-accessed',
    // Add any other auth-related cookies your app uses
] as string[];

/**
 * Cookie options configuration
 */
export const COOKIE_OPTIONS = {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 0 // For logout we set maxAge to 0
};