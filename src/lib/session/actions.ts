'use server'

import { SessionManager } from '@/lib/session/manager';
import type { SessionOptions, SessionUser, SessionStatus } from '@/lib/session/types';

/**
 * Creates a new session for a user 
 */
export async function createSession(
  user: Omit<SessionUser, 'exp' | 'iat'>,
  options: SessionOptions = {}
): Promise<void> {
  const sessionManager = SessionManager.getInstance();
  return sessionManager.createSession(user, options);
}

/**
 * Gets the current session
 */
export async function getSession(): Promise<SessionUser | null> {
  const sessionManager = SessionManager.getInstance();
  return sessionManager.getSession();
}

/**
 * Checks session status
 */
export async function checkSessionStatus(): Promise<SessionStatus> {
  const sessionManager = SessionManager.getInstance();
  return sessionManager.checkSessionStatus();
}

/**
 * Refreshes the current session
 */
export async function refreshSession(): Promise<void> {
  const sessionManager = SessionManager.getInstance();
  return sessionManager.refreshSession();
}

/**
 * Destroys the current session
 */
export async function destroySession(): Promise<void> {
  const sessionManager = SessionManager.getInstance();
  return sessionManager.destroySession();
} 