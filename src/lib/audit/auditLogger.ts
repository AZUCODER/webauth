'use server';

import { prisma } from '@/lib/prisma';
import { headers } from 'next/headers';

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'view' 
  | 'login' 
  | 'logout' 
  | 'permission:grant' 
  | 'permission:revoke'
  | 'role:update'
  | 'profile:update';

export interface AuditLogData {
  userId: string;
  action: AuditAction | string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
}

/**
 * Logs an action to the AuditLog table
 * @param data The audit log data
 * @returns The created audit log entry
 */
export async function logAuditEvent(data: AuditLogData) {
  try {
    // Default values if headers can't be accessed
    let ipAddress = 'unknown';
    let userAgent = 'unknown';
    
    // Get headers safely
    try {
      // headers() is an async function in Next.js 15+
      const headersList = await headers();
      ipAddress = headersList.get('x-forwarded-for') || 
                  headersList.get('x-real-ip') || 
                  'unknown';
      userAgent = headersList.get('user-agent') || 'unknown';
    } catch (e) {
      console.error('Failed to access headers:', e);
    }

    // Create audit log entry
    const auditLog = await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        ipAddress: ipAddress,
        userAgent: userAgent,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
      },
    });

    console.log(`Audit log created: ${auditLog.action} on ${auditLog.resource}${auditLog.resourceId ? ' (' + auditLog.resourceId + ')' : ''} by user ${auditLog.userId}`);
    
    return auditLog;
  } catch (error) {
    // Log the error but don't fail the main operation
    console.error('Failed to create audit log:', error);
    return null;
  }
}

/**
 * Utility function to safely stringify an object for audit logs
 * @param obj The object to stringify
 * @returns A JSON string representation of the object
 */
export async function safeStringify(obj: any): Promise<string> {
  try {
    // Remove sensitive data like passwords
    const sanitized = { ...obj };
    
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.accessToken) sanitized.accessToken = '[REDACTED]';
    if (sanitized.refreshToken) sanitized.refreshToken = '[REDACTED]';
    
    return JSON.stringify(sanitized);
  } catch (error) {
    return JSON.stringify({ error: 'Failed to stringify object' });
  }
} 