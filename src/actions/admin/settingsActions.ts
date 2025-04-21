'use server'

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session/manager";
import { hasPermission } from '@/lib/authorization/permissions';
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit/auditLogger";
import { SettingFormData, settingSchema } from "@/types/setting";

// Define types for settings
interface SettingsFilters {
  category?: string;
  search?: string;
}

// Define a proper type for the where clause object
interface SettingWhereClause {
  category?: string;
  OR?: {
    key?: { contains: string };
    value?: { contains: string };
    description?: { contains: string };
  }[];
}

// Define a type for the changes tracking
interface SettingChanges {
  key?: { before: string; after: string };
  value?: { before: string; after: string };
  category?: { before: string; after: string };
  description?: { before: string | null; after: string | null };
  isPublic?: { before: boolean; after: boolean };
}

export async function getSettings(
  page = 1,
  limit = 10,
  filters: SettingsFilters = {}
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Not authorized" };
    }

    // Check if user has permission to view settings
    const canViewSettings = await hasPermission('settings:view');
    if (!canViewSettings) {
      return { success: false, error: "You don't have permission to view settings" };
    }

    // Build filter conditions
    const where: SettingWhereClause = {};
    
    if (filters.category && filters.category !== "all") {
      where.category = filters.category;
    }
    
    // Handle search query
    if (filters.search) {
      const searchTerm = filters.search.trim();
      if (searchTerm) {
        where.OR = [
          { key: { contains: searchTerm } },
          { value: { contains: searchTerm } },
          { description: { contains: searchTerm } },
        ];
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get settings
    const settings = await prisma.setting.findMany({
      skip,
      take: limit,
      where,
      orderBy: {
        category: 'asc',
      },
    });

    // Get total count for pagination
    const total = await prisma.setting.count({ where });

    return {
      success: true,
      settings,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
      },
    };
  } catch (error) {
    console.error("Error fetching settings:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch settings" 
    };
  }
}

export async function getSettingById(id: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Not authorized" };
    }

    // Check if user has permission to view settings
    const canViewSettings = await hasPermission('settings:view');
    if (!canViewSettings) {
      return { success: false, error: "You don't have permission to view settings" };
    }

    const setting = await prisma.setting.findUnique({
      where: { id },
    });

    if (!setting) {
      return { success: false, error: "Setting not found" };
    }

    return { success: true, setting };
  } catch (error) {
    console.error("Error fetching setting details:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch setting details" 
    };
  }
}

export async function createSetting(data: SettingFormData) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Not authorized" };
    }

    // Check if user has permission to create settings
    const canCreateSettings = await hasPermission('settings:create');
    if (!canCreateSettings) {
      return { success: false, error: "You don't have permission to create settings" };
    }

    // Validate input data
    const validated = settingSchema.safeParse(data);
    if (!validated.success) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: validated.error.errors 
      };
    }

    // Check if a setting with the same key already exists
    const existingSetting = await prisma.setting.findFirst({
      where: { key: data.key },
    });

    if (existingSetting) {
      return { success: false, error: "A setting with this key already exists" };
    }

    // Create the setting
    const newSetting = await prisma.setting.create({
      data: {
        key: data.key,
        value: data.value,
        category: data.category,
        description: data.description || '',
        isPublic: data.isPublic || false,
      },
    });

    // Log audit event
    await logAuditEvent({
      userId: session.userId,
      action: 'create',
      resource: 'setting',
      resourceId: newSetting.id,
      metadata: { key: newSetting.key, category: newSetting.category }
    });

    return { success: true, setting: newSetting };
  } catch (error) {
    console.error("Error creating setting:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to create setting" 
    };
  }
}

export async function updateSetting(id: string, data: z.infer<typeof settingSchema>) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Not authorized" };
    }

    // Check if user has permission to update settings
    const canUpdateSettings = await hasPermission('settings:update');
    if (!canUpdateSettings) {
      return { success: false, error: "You don't have permission to update settings" };
    }

    // Validate input data
    const validated = settingSchema.safeParse(data);
    if (!validated.success) {
      return { 
        success: false, 
        error: "Validation failed", 
        details: validated.error.errors 
      };
    }

    // Find existing setting
    const existingSetting = await prisma.setting.findUnique({
      where: { id },
    });

    if (!existingSetting) {
      return { success: false, error: "Setting not found" };
    }

    // Check if key is changed and if the new key already exists
    if (data.key !== existingSetting.key) {
      const keyExists = await prisma.setting.findFirst({
        where: { key: data.key },
      });

      if (keyExists) {
        return { success: false, error: "A setting with this key already exists" };
      }
    }

    // Create a changes object to track what was modified
    const changes: SettingChanges = {};

    // Check each field for changes
    if (data.key !== existingSetting.key) {
      changes.key = { before: existingSetting.key, after: data.key };
    }
    if (data.value !== existingSetting.value) {
      changes.value = { before: existingSetting.value, after: data.value };
    }
    if (data.category !== existingSetting.category) {
      changes.category = { before: existingSetting.category, after: data.category };
    }
    if (data.description !== existingSetting.description) {
      changes.description = { before: existingSetting.description, after: data.description };
    }
    if (data.isPublic !== existingSetting.isPublic) {
      changes.isPublic = { before: existingSetting.isPublic, after: data.isPublic };
    }

    // Update the setting
    const updatedSetting = await prisma.setting.update({
      where: { id },
      data: {
        key: data.key,
        value: data.value,
        category: data.category,
        description: data.description,
        isPublic: data.isPublic,
      },
    });

    // Log audit event with changes
    await logAuditEvent({
      userId: session.userId,
      action: 'update',
      resource: 'setting',
      resourceId: updatedSetting.id,
      metadata: { 
        key: updatedSetting.key, 
        category: updatedSetting.category,
        changes 
      }
    });

    return { success: true, setting: updatedSetting };
  } catch (error) {
    console.error("Error updating setting:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to update setting" 
    };
  }
}

export async function deleteSetting(id: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Not authorized" };
    }

    // Check if user has permission to delete settings
    const canDeleteSettings = await hasPermission('settings:delete');
    if (!canDeleteSettings) {
      return { success: false, error: "You don't have permission to delete settings" };
    }

    // Find the setting before deletion to include in audit log
    const setting = await prisma.setting.findUnique({
      where: { id },
    });

    if (!setting) {
      return { success: false, error: "Setting not found" };
    }

    // Delete the setting
    await prisma.setting.delete({
      where: { id },
    });

    // Log audit event
    await logAuditEvent({
      userId: session.userId,
      action: 'delete',
      resource: 'setting',
      resourceId: id,
      metadata: { key: setting.key, category: setting.category }
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting setting:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to delete setting" 
    };
  }
}

// Get distinct categories for filter dropdown
export async function getSettingCategories() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return { success: false, error: "Not authorized" };
    }

    // Check if user has permission to view settings
    const canViewSettings = await hasPermission('settings:view');
    if (!canViewSettings) {
      return { success: false, error: "You don't have permission to view settings" };
    }

    // Get distinct categories
    const categoriesResult = await prisma.setting.groupBy({
      by: ['category'],
      orderBy: {
        category: 'asc',
      },
    });

    const categories = categoriesResult.map(row => row.category);

    return { success: true, categories };
  } catch (error) {
    console.error("Error fetching setting categories:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to fetch setting categories" 
    };
  }
} 