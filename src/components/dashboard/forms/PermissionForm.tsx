'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { PermissionData, PermissionFormData, PermissionSchema } from '@/types/permission';
import { createPermission, updatePermission } from '@/actions/admin/permissionActions';

interface PermissionFormProps {
  initialData?: PermissionData;
  isEditing?: boolean;
}

export function PermissionForm({ initialData, isEditing = false }: PermissionFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PermissionFormData>({
    resolver: zodResolver(PermissionSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      resource: initialData?.resource || '',
      action: initialData?.action || '',
    },
  });

  const onSubmit = async (data: PermissionFormData) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('description', data.description || '');
      formData.append('resource', data.resource);
      formData.append('action', data.action);

      let result;
      if (isEditing && initialData) {
        result = await updatePermission(initialData.id, formData);
      } else {
        result = await createPermission(formData);
      }

      if (result.success) {
        toast.success(isEditing ? 'Permission updated successfully' : 'Permission created successfully');
        router.push('/permissions');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to save permission');
      }
    } catch (error) {
      console.error('Permission form error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="resource"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., posts, users, settings" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="action"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., create, read, update, delete" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Permission Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="e.g., posts:create, users:read" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe what this permission allows" 
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" type="button" onClick={() => router.push('/permissions')}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Permission' : 'Create Permission'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 