'use client';

import React, { useEffect } from 'react';
import { useSettingsFilters } from './action';
import { SettingsTable } from '@/components/dashboard/tables/SettingsTable';

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

  // Process initial filters for the UI
  const processedFilters = {
    ...initialFilters,
    category: initialFilters.category || "all"
  };

  // Make sure children is a SettingsTable component
  if (React.isValidElement(children) && children.type === SettingsTable) {
    // Get the props from the original component
    const { settings, categories, pagination, onEdit, onDelete } = children.props;

    // Create a new component with the event handlers
    return (
      <SettingsTable
        settings={settings}
        categories={categories}
        pagination={pagination}
        onEdit={onEdit}
        onDelete={onDelete}
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