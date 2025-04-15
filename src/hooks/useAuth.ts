'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Define the Auth interface
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    userId?: string;
    username?: string;
    email?: string;
    role?: string;
  } | null;
}

/**
 * Client-side hook for authentication status
 */
export function useAuth() {
  const router = useRouter();
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null
  });

  // Check authentication status
  const checkAuth = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Make a request to a check-auth endpoint
      const res = await fetch('/api/auth/check', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for cookies
      });
      
      if (!res.ok) {
        throw new Error('Authentication check failed');
      }
      
      const data = await res.json();
      
      setAuthState({
        isAuthenticated: data.authenticated,
        isLoading: false,
        error: null,
        user: data.user
      });
      
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        user: null
      });
    }
  }, []);

  // Check auth on initial load
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      
      if (!res.ok) {
        throw new Error('Logout failed');
      }
      
      // Update auth state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: null
      });
      
      // Redirect to login page
      router.push('/login');
      
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout failed'
      }));
    }
  }, [router]);

  // Protected route helper
  const requireAuth = useCallback(
    (callback: () => void) => {
      if (authState.isLoading) return;
      
      if (!authState.isAuthenticated) {
        router.push('/login');
        return;
      }
      
      callback();
    },
    [authState, router]
  );

  return {
    ...authState,
    checkAuth,
    logout,
    requireAuth
  };
} 