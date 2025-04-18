import { z } from 'zod';
import { Permission, Role } from '@prisma/client';

// Basic permission interface
export interface PermissionData {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for permission validation
export const PermissionSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name cannot exceed 100 characters"),
  description: z.string().optional(),
  resource: z.string().min(1, "Resource is required"),
  action: z.string().min(1, "Action is required"),
});

export type PermissionFormData = z.infer<typeof PermissionSchema>;

// Extended permission data with usage information
export interface PermissionWithUsage extends PermissionData {
  usedByRoles: Role[];
  usedByUserCount: number;
}

// Role permissions assignment data
export interface RolePermissionData {
  role: Role;
  assignedPermissions: string[]; // Permission IDs
  availablePermissions: PermissionData[];
}

// User permission override data
export interface UserPermissionData {
  userId: string;
  userName: string;
  userEmail: string;
  role: Role;
  rolePermissions: string[]; // Permission names from role
  overrides: Record<string, boolean>; // Permission name -> granted
} 