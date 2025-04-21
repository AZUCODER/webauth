/**
 * Mock audit logger to replace deleted audit functionality
 * This is a placeholder that doesn't actually log anything
 */

export interface AuditLogData {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * No-op function that replaces the actual audit logging
 */
export async function logAuditEvent(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data: AuditLogData
): Promise<void> {
  // This is a mock function that doesn't do anything
  // We've removed actual audit logging functionality
  console.log('Audit logging disabled');
  return;
}

/**
 * Helper function to safely convert objects to JSON strings
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function safeStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch (
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    e
  ) {
    return JSON.stringify({ error: 'Failed to stringify object' });
  }
} 