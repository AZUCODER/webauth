'use client';

import React, { useEffect } from 'react';
import { useSettingsFilters } from './action';
import { SettingsTable } from '@/components/dashboard/tables/SettingsTable';

// Define the Setting type to match the one from the client.tsx file
interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the pagination type
interface Pagination {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}

interface SettingsFilterClientProps {
  children: React.ReactElement;
  initialFilters: {
    search: string;
    category: string;
  };
}

export function SettingsFilterClient({ 
  children, 
  initialFilters 
}: SettingsFilterClientProps) {
  const { setPage, setFilters } = useSettingsFilters();
  
  // Apply initial filters when component mounts - only once on mount
  useEffect(() => {
    if (initialFilters.search || initialFilters.category) {
      setFilters({
        search: initialFilters.search,
        category: initialFilters.category
      });
    }
  }, []); // Empty dependency array means this only runs once on mount

  // Make sure children is a SettingsTable component
  if (React.isValidElement(children) && children.type === SettingsTable) {
    // Get the props from the original component
    const { settings, categories, pagination, onEdit, onDelete } = children.props as {
      settings: Setting[];
      categories: string[];
      pagination: Pagination;
      onEdit?: (setting: Setting) => void;
      onDelete?: (id: string) => void;
    };

    // Create a new component with the event handlers
    return (
      <SettingsTable
        settings={settings}
        categories={categories}
        pagination={pagination}
        onEdit={onEdit}
        onDelete={onDelete}
        initialFilters={initialFilters}
        onPageChange={(page: number) => {
          setPage(page);
        }}
        onFilterChange={(filters: Record<string, string>) => {
          setFilters(filters);
        }}
      />
    );
  }

  // If it's not a SettingsTable, just return the children
  return children;
} 