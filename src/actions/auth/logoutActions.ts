'use server'

import { revalidatePath } from 'next/cache'
import { type LogoutResponse } from '@/types/auth'
import { destroySession } from '@/lib/session/manager'

/**
 * Handles user logout by clearing all authentication-related cookies
 * and session data.
 * 
 * @returns {Promise<LogoutResponse>} The result of the logout operation
 */
export async function logoutHandler(): Promise<LogoutResponse> {
    const timestamp = new Date().toISOString()
    
    try {
        // Destroy the current session
        await destroySession();
        
        // Revalidate auth-dependent paths
        revalidatePath('/');
        revalidatePath('/dashboard');
        revalidatePath('/profile');
        
        return {
            success: true,
            timestamp,
            message: 'Logout successful'
        }
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        console.error(
            `[${timestamp}] Logout operation failed:`,
            errorMessage
        )
        
        return {
            success: false,
            timestamp,
            message: 'Failed to complete logout operation',
            error: process.env.NODE_ENV === 'development'
                ? errorMessage
                : 'An unexpected error occurred'
        }
    }
}