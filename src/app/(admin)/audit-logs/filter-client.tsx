'use client';

import React, { useEffect } from 'react';
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
  const { setPage, setFilters } = useAuditLogFilters();

  // Process initial filters for the UI
  const processedFilters = {
    ...initialFilters,
    action: initialFilters.action || "all",
    resource: initialFilters.resource || "all"
  };

  // Make sure children is an AuditLogTable component
  if (React.isValidElement(children) && children.type === AuditLogTable) {
    // Get the props from the original component
    const { auditLogs, pagination } = children.props;

    // Create a new component with the event handlers
    return (
      <AuditLogTable
        auditLogs={auditLogs}
        pagination={pagination}
        onPageChange={(page: number) => {
          setPage(page);
        }}
        onFilterChange={(filters: Record<string, string>) => {
          setFilters(filters);
        }}
      />
    );
  }

  // If it's not an AuditLogTable, just return the children
  return children;
} 