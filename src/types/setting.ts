import { z } from "zod";

// Setting schema for validation
export const settingSchema = z.object({
    id: z.string().optional(),
    key: z.string().min(2, "Key must be at least 2 characters"),
    value: z.string().min(1, "Value is required"),
    category: z.string().min(2, "Category must be at least 2 characters"),
    description: z.string().optional().nullable().default(""),
    isPublic: z.boolean().default(false),
});

export type SettingFormData = z.infer<typeof settingSchema>;