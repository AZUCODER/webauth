import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session/manager';
import { getSettings, getSettingCategories } from '@/actions/admin/settingsActions';
import { Button } from '@/components/ui/button';
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { SettingsClient } from './client';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
  }>;
}

// Define a type for the filters
interface SettingsFilters {
  search?: string;
  category?: string;
}

export default async function SettingsPage({ searchParams }: PageProps) {
  // Check if user is logged in and is admin
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  // Await the searchParams
  const resolvedParams = await searchParams;
  
  // Parse query parameters
  const page = resolvedParams?.page ? parseInt(resolvedParams.page) : 1;
  const limit = resolvedParams?.limit ? parseInt(resolvedParams.limit) : 10;
  
  // Build filters from search params
  const filters: SettingsFilters = {};
  
  if (resolvedParams?.search) {
    filters.search = resolvedParams.search;
  }
  
  if (resolvedParams?.category && resolvedParams.category !== "all") {
    filters.category = resolvedParams.category;
  }
  
  // Get settings
  const result = await getSettings(page, limit, filters);
  
  // Get categories for filter dropdown
  const categoriesResult = await getSettingCategories();
  
  const settings = result.success && result.settings ? result.settings : [];
  const pagination = result.success && result.pagination ? result.pagination : {
    page,
    limit,
    totalPages: 1,
    totalItems: 0,
  };
  
  const categories = categoriesResult.success && categoriesResult.categories ? categoriesResult.categories : [];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Site Settings</h1>
          <p className="text-accent-foreground/60">
            Manage application settings and configuration options
          </p>
        </div>

        <Button asChild variant="outline" size="sm">
          <Link href="/settings/new" className="flex items-center gap-1">
            <PlusCircle />
            New Setting
          </Link>
        </Button>
      </div>

      <div className="bg-card rounded-sm shadow">
        <div className="p-6">
          <SettingsClient
            settings={settings}
            categories={categories}
            pagination={pagination}
            initialFilters={{
              search: resolvedParams?.search || "",
              category: resolvedParams?.category || "",
            }}
          />
        </div>
      </div>
    </div>
  );
} 