"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { SettingFormData, settingSchema } from "@/types/setting";

// Define type for react-hook-form resolver
import type { Resolver } from "react-hook-form";

interface SettingFormProps {
  initialData?: SettingFormData;
  categories?: string[];
  onSubmit: (data: SettingFormData) => void;
  isSubmitting?: boolean;
}
export function SettingForm({
  initialData,
  categories = [],
  onSubmit,
  isSubmitting = false,
}: SettingFormProps) {
  // Use type assertion that specifically addresses the resolver typing issue
  const resolver = zodResolver(settingSchema) as Resolver<SettingFormData>;
  
  const form = useForm<SettingFormData>({
    resolver,
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

  // Use the correct type for the submit handler
  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
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
                A unique identifier for this setting (e.g., &quot;site.title&quot;)
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
                      onCheckedChange={(checked: boolean) => {
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
                      <Select 
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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