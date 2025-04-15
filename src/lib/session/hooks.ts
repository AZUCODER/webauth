'use client'

import { useEffect, useState } from 'react';
import { type SessionUser, type SessionStatus } from '@/lib/session/types';

export function useSession() {
    const [session, setSession] = useState<SessionUser | null>(null)
    const [status, setStatus] = useState<SessionStatus>({
        isValid: false,
        isExpired: true
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkSession = async () => {
            try {
                const response = await fetch('/api/auth/session')
                const data = await response.json()

                setSession(data.session)
                setStatus(data.status)
            } catch (error) {
                console.error('Failed to check session:', error)
                setSession(null)
                setStatus({ isValid: false, isExpired: true })
            } finally {
                setLoading(false)
            }
        }

        checkSession()
    }, [])

    return { session, status, loading }
}