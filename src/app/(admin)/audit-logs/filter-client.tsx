'use client';

import React, { useState, useEffect } from 'react';
import { useAuditLogFilters } from './action';
import { AuditLogTable } from '@/components/dashboard/tables/AuditLogTable';

interface AuditLogFilterClientProps {
  children: React.ReactElement;
  initialFilters: {
    search: string;
    action: string;
    resource: string;
  };
}

export function AuditLogFilterClient({ 
  children, 
  initialFilters 
}: AuditLogFilterClientProps) {
  const { setPage, setFilters, getCurrentFilters } = useAuditLogFilters();
  const [mounted, setMounted] = useState(false);

  // Process initial filters for the UI
  const processedFilters = {
    ...initialFilters,
    action: initialFilters.action || "all",
    resource: initialFilters.resource || "all"
  };

  // This ensures hydration works correctly
  useEffect(() => {
    setMounted(true);
  }, []);

  // Make sure children is an AuditLogTable component
  if (React.isValidElement(children) && children.type === AuditLogTable) {
    // Get the props from the original component
    const { auditLogs, pagination } = children.props;

    // Create a new component with the event handlers
    return (
      <AuditLogTable
        auditLogs={auditLogs}
        pagination={pagination}
        currentFilters={processedFilters}
        onPageChange={(page: number) => {
          setPage(page);
        }}
        onFilterChange={(filters: Record<string, string>) => {
          // Keep existing query params except those being explicitly set
          const currentFilters = getCurrentFilters();
          const newFilters = { ...currentFilters, ...filters };
          
          // Remove page from filters as it's handled separately
          delete newFilters.page;
          
          setFilters(newFilters);
        }}
      />
    );
  }

  // If it's not an AuditLogTable, just return the children
  return children;
} 