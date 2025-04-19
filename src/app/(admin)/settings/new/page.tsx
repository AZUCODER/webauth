'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SettingForm } from '@/components/dashboard/forms/SettingForm';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { IconArrowLeft } from '@tabler/icons-react';
import Link from 'next/link';
import { createSetting, getSettingCategories } from '@/actions/admin/settingsActions';
import { useEffect } from 'react';

export default function NewSettingPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const result = await getSettingCategories();
        if (result.success) {
          setCategories(result.categories || []);
        }
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const result = await createSetting(data);
      
      if (result.success) {
        toast.success('Setting created successfully');
        router.push('/settings');
      } else {
        toast.error(result.error || 'Failed to create setting');
      }
    } catch (error) {
      console.error('Error creating setting:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild className="mb-4">
          <Link href="/settings" className="flex items-center gap-1">
            <IconArrowLeft className="h-4 w-4" />
            Back to Settings
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Create New Setting</h1>
        <p className="text-gray-500 mt-2 bg-gray-100 p-2 rounded-sm">
          Add a new system setting with key, value, and category
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