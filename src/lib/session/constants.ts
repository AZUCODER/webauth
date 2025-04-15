import { type SessionOptions } from '@/lib/session/types';

export const SESSION_CONSTANTS = {
    COOKIE_NAME: 'session',
    MAX_AGE: 24 * 60 * 60, // 24 hours in seconds
    REFRESH_THRESHOLD: 30 * 60, // 30 minutes in seconds
} as const;

export const DEFAULT_SESSION_OPTIONS: SessionOptions = {
    maxAge: SESSION_CONSTANTS.MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
} as const;