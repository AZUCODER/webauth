'use server'

import { 
  createSession as createSessionFn,
  getSession as getSessionFn,
  checkSessionStatus as checkStatusFn,
  refreshSession as refreshSessionFn,
  destroySession as destroySessionFn
} from '@/lib/session/manager';
import type { SessionOptions, SessionUser, SessionStatus } from '@/lib/session/types';

/**
 * Creates a new session for a user 
 */
export async function createSession(
  user: Omit<SessionUser, 'exp' | 'iat'>,
  options: SessionOptions = {}
): Promise<void> {
  return createSessionFn(user, options);
}

/**
 * Gets the current session
 */
export async function getSession(): Promise<SessionUser | null> {
  return getSessionFn();
}

/**
 * Checks session status
 */
export async function checkSessionStatus(): Promise<SessionStatus> {
  return checkStatusFn();
}

/**
 * Refreshes the current session
 */
export async function refreshSession(): Promise<void> {
  return refreshSessionFn();
}

/**
 * Destroys the current session
 */
export async function destroySession(): Promise<void> {
  return destroySessionFn();
} 