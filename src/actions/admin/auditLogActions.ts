'use server'

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session/manager";
import { hasPermission } from '@/lib/authorization/permissions';

interface AuditLogFilters {
  userId?: string;
  action?: string;
  resource?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getAuditLogs(
  page = 1,
  limit = 10,
  filters: AuditLogFilters = {}
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Not authorized" };
    }

    // Check if user has permission to view audit logs
    const canViewAuditLogs = await hasPermission('audit-log:view');
    if (!canViewAuditLogs) {
      return { success: false, error: "You don't have permission to view audit logs" };
    }

    // Build filter conditions
    const where: any = {};
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    
    if (filters.action && filters.action !== "all") {
      where.action = filters.action;
    }
    
    if (filters.resource && filters.resource !== "all") {
      where.resource = filters.resource;
    }
    
    // Handle search query
    if (filters.search) {
      const searchTerm = filters.search.trim();
      if (searchTerm) {
        where.OR = [
          // Search in resourceId
          { resourceId: { contains: searchTerm } },
          // Search in user relation
          { 
            user: {
              OR: [
                { name: { contains: searchTerm } },
                { email: { contains: searchTerm } }
              ]
            }
          }
        ];
      }
    }
    
    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get audit logs with user information
    const auditLogs = await prisma.auditLog.findMany({
      skip,
      take: limit,
      where,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get total count for pagination
    const total = await prisma.auditLog.count({ where });

    return {
      success: true,
      auditLogs,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch audit logs" 
    };
  }
}

export async function getAuditLogDetails(id: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Not authorized" };
    }

    // Check if user has permission to view audit logs
    const canViewAuditLogs = await hasPermission('audit-log:view');
    if (!canViewAuditLogs) {
      return { success: false, error: "You don't have permission to view audit logs" };
    }

    const auditLog = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!auditLog) {
      return { success: false, error: "Audit log not found" };
    }

    return { success: true, auditLog };
  } catch (error) {
    console.error("Error fetching audit log details:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch audit log details" 
    };
  }
} 