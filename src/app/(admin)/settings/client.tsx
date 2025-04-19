'use client';

import { useRouter } from 'next/navigation';
import { SettingsTable } from '@/components/dashboard/tables/SettingsTable';
import { SettingsFilterClient } from './filter-client';
import { useState } from 'react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteSetting } from '@/actions/admin/settingsActions';

interface SettingsClientProps {
  settings: any[];
  categories: string[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  initialFilters: {
    search: string;
    category: string;
  };
}

export function SettingsClient({ settings, categories, pagination, initialFilters }: SettingsClientProps) {
  const router = useRouter();
  const [settingToDelete, setSettingToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Handle edit setting
  const handleEdit = (setting: any) => {
    router.push(`/settings/${setting.id}`);
  };

  // Handle delete setting
  const handleDeleteClick = (id: string) => {
    setSettingToDelete(id);
  };

  const handleConfirmDelete = async () => {
    if (!settingToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await deleteSetting(settingToDelete);
      
      if (result.success) {
        toast.success('Setting deleted successfully');
        router.refresh(); // Refresh the page to update the list
      } else {
        toast.error(result.error || 'Failed to delete setting');
      }
    } catch (error) {
      console.error('Error deleting setting:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
      setSettingToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setSettingToDelete(null);
  };

  return (
    <>
      <SettingsFilterClient initialFilters={initialFilters}>
        <SettingsTable 
          settings={settings} 
          categories={categories}
          pagination={pagination}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </SettingsFilterClient>

      <AlertDialog open={!!settingToDelete} onOpenChange={(open) => !open && setSettingToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the setting
              and may affect the functionality of your application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 