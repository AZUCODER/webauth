/**
 * Application paths constants 
 * This file centralizes all path definitions for consistent revalidation
 * and navigation throughout the application.
 */

/**
 * Authentication-dependent paths that should be revalidated on login/logout
 * Used for consistent cache invalidation across the application
 */
export const AUTH_DEPENDENT_PATHS = [
  // Core routes
  "/",
  "/dashboard",
  
  // Admin routes
  "/profile",
  "/users",
  "/posts",
  "/posts/view",
  "/posts/edit",
  "/posts/create",
  "/post-categories",
  "/post-categories/view",
  
  // Auth routes that may need updating after logout
  "/login",
  "/register",
] as const;

/**
 * Public routes that don't require authentication
 * Used for navigation guards and routing logic
 */
export const PUBLIC_PATHS = [
  "/login",
  "/register",
  "/verify-email",
  "/reset-password",
] as const;

/**
 * Post-logout redirect path
 */
export const LOGOUT_REDIRECT_PATH = "/login";

/**
 * Default path after successful login
 */
export const DEFAULT_LOGIN_REDIRECT_PATH = "/dashboard";

/**
 * Revalidate all auth-dependent paths at once
 * Used during authentication state changes (login/logout)
 * @param extraPaths Additional paths to revalidate
 * @returns Array of paths that were revalidated
 */
export function getPathsToRevalidate(extraPaths: string[] = []): string[] {
  return [...AUTH_DEPENDENT_PATHS, ...extraPaths];
} 