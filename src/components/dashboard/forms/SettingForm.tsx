"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

// Setting schema for validation
const settingSchema = z.object({
  id: z.string().optional(),
  key: z.string().min(2, "Key must be at least 2 characters"),
  value: z.string().min(1, "Value is required"),
  category: z.string().min(2, "Category must be at least 2 characters"),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
});

type FormData = z.infer<typeof settingSchema>;

interface SettingFormProps {
  initialData?: FormData;
  categories?: string[];
  onSubmit: (data: FormData) => void;
  isSubmitting?: boolean;
}

export function SettingForm({
  initialData,
  categories = [],
  onSubmit,
  isSubmitting = false,
}: SettingFormProps) {
  const form = useForm<FormData>({
    resolver: zodResolver(settingSchema),
    defaultValues: initialData || {
      key: "",
      value: "",
      category: "",
      description: "",
      isPublic: false,
    },
  });

  // For custom category input
  const [isCustomCategory, setIsCustomCategory] = useState(
    !categories.includes(form.getValues().category) && form.getValues().category !== ""
  );

  const handleSubmit = async (data: FormData) => {
    onSubmit(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Setting Key</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter setting key"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                A unique identifier for this setting (e.g., "site.title")
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="value"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Value</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter setting value"
                  {...field} 
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <div className="flex items-center space-x-2 mb-2">
                    <Switch
                      checked={isCustomCategory}
                      onCheckedChange={(checked) => {
                        setIsCustomCategory(checked);
                        if (!checked && categories.length > 0) {
                          form.setValue("category", categories[0]);
                        }
                      }}
                    />
                    <span className="text-sm text-gray-500">Custom category</span>
                  </div>
                  <FormControl>
                    {isCustomCategory ? (
                      <Input
                        placeholder="Enter custom category"
                        {...field}
                      />
                    ) : (
                      <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter a description for this setting"
                  {...field} 
                  value={field.value || ""}
                  rows={2}
                />
              </FormControl>
              <FormDescription>
                Optional description to explain what this setting is used for
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Public Setting</FormLabel>
                <FormDescription>
                  Make this setting accessible to unauthenticated users
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : (initialData?.id ? "Update" : "Create")}
          </Button>
        </div>
      </form>
    </Form>
  );
} 