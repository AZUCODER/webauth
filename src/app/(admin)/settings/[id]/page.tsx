'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingForm } from '@/components/dashboard/forms/SettingForm';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { 
  getSettingById, 
  getSettingCategories, 
  updateSetting,
  deleteSetting
} from '@/actions/admin/settingsActions';
import { notFound } from 'next/navigation';
import React from 'react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { SettingFormData } from '@/types/setting';

// Define a Setting type that extends SettingFormData with database fields
interface DatabaseSetting extends Omit<SettingFormData, 'id'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

interface EditSettingPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditSettingPage({ params }: EditSettingPageProps) {
  const router = useRouter();
  const [setting, setSetting] = useState<DatabaseSetting | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Use React.use() to unwrap params
  const resolvedParams = React.use(params);
  const id = resolvedParams.id;

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Fetch setting data
        const settingResult = await getSettingById(id);
        if (!settingResult.success || !settingResult.setting) {
          notFound();
          return;
        }
        
        setSetting(settingResult.setting as DatabaseSetting);
        
        // Fetch categories
        const categoriesResult = await getSettingCategories();
        if (categoriesResult.success) {
          setCategories(categoriesResult.categories || []);
        }
      } catch (error) {
        console.error('Failed to load data:', error);
        toast.error('Failed to load setting data');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmit = async (data: SettingFormData) => {
    setIsSubmitting(true);
    try {
      const result = await updateSetting(id, data);
      
      if (result.success) {
        toast.success('Setting updated successfully');
        router.push('/settings');
      } else {
        toast.error(result.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteSetting(id);
      
      if (result.success) {
        toast.success('Setting deleted successfully');
        router.push('/settings');
      } else {
        toast.error(result.error || 'Failed to delete setting');
      }
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings" className="flex items-center gap-1">
              <IconArrowLeft className="h-4 w-4" />
              Back to Settings
            </Link>
          </Button>
          
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting}>
                Delete Setting
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the setting
                  and may affect the functionality of your application.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        
        <h1 className="text-xl font-bold">Edit Setting</h1>
        <p className="text-gray-500 mt-2 bg-gray-100 p-2 rounded-sm">
          Update setting details for {setting?.key || 'this setting'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Setting Details</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800"></div>
            </div>
          ) : (
            <SettingForm
              initialData={setting ? {
                id: setting.id,
                key: setting.key,
                value: setting.value,
                category: setting.category,
                description: setting.description,
                isPublic: setting.isPublic
              } : undefined}
              categories={categories}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
} 