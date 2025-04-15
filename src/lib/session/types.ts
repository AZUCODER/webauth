//Define session types
export interface SessionUser {
    userId: string;
    username: string;
    email: string;
    role: string;
    lastLogin?: string;
    exp?: number;
    iat?: number;
}

export interface SessionMetadata {
    createdAt: string;
    lastAccessed: string;
    expiresAt: string;
    userAgent?: string;
    ipAddress?: string;
}

export interface SessionOptions {
    maxAge?: number; // in seconds
    secure?: boolean;
    path?: string;
    sameSite?: 'strict' | 'lax' | 'none';
}

export interface SessionError extends Error {
    code: 'SESSION_EXPIRED' | 'SESSION_INVALID' | 'SESSION_NOT_FOUND' | 'JWT_INVALID';
    timestamp: string;
}

export interface SessionStatus {
    isValid: boolean;
    isExpired: boolean;
    remainingTime?: number; // in seconds
}