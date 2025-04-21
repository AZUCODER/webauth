'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api/axios';
import { LOGOUT_REDIRECT_PATH } from '@/lib/constants/paths';
import axios from 'axios';

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
      
      // Make a request to a check-auth endpoint using the api instance
      const response = await api.get('/api/auth/check');
      
      setAuthState({
        isAuthenticated: response.data.authenticated,
        isLoading: false,
        error: null,
        user: response.data.user
      });
      
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : 'Unknown error',
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
      const response = await api.post('/api/auth/logout');
      
      // Update auth state
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: null
      });
      
      // Use the redirect path from the response or fall back to the constant
      const redirectPath = response.data.redirectTo || LOGOUT_REDIRECT_PATH;
      
      // Redirect to login page
      router.push(redirectPath);
      
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: axios.isAxiosError(error)
          ? error.response?.data?.message || error.message
          : 'Logout failed'
      }));
      
      // Even on error, try to redirect to the login page
      router.push(LOGOUT_REDIRECT_PATH);
    }
  }, [router]);

  // Protected route helper
  const requireAuth = useCallback(
    (callback: () => void) => {
      if (authState.isLoading) return;
      
      if (!authState.isAuthenticated) {
        router.push(LOGOUT_REDIRECT_PATH);
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