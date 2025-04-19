import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session/manager';
import { getAuditLogs } from '@/actions/admin/auditLogActions';
import { AuditLogTable } from '@/components/dashboard/tables/AuditLogTable';
import { AuditLogFilterClient } from './filter-client';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    search?: string;
    action?: string;
    resource?: string;
  }>;
}

export default async function AuditLogsPage({ searchParams }: PageProps) {
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
  const filters: any = {};
  
  if (resolvedParams?.search) {
    filters.search = resolvedParams.search;
  }
  
  if (resolvedParams?.action && resolvedParams.action !== "all") {
    filters.action = resolvedParams.action;
  }
  
  if (resolvedParams?.resource && resolvedParams.resource !== "all") {
    filters.resource = resolvedParams.resource;
  }
  
  // Get audit logs
  const result = await getAuditLogs(page, limit, filters);
  
  const auditLogs = result.success && result.auditLogs ? result.auditLogs : [];
  const pagination = result.success && result.pagination ? result.pagination : {
    page,
    limit,
    totalPages: 1,
    totalItems: 0,
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Audit Logs</h1>
        <p className="text-gray-500 mt-2 bg-gray-100 p-2 rounded-sm">
          View system activity logs for security and compliance monitoring. Track user actions, system events, and resource modifications.
        </p>
      </div>

      <div className="bg-card rounded-sm shadow-md">
        <div className="p-6">
          <AuditLogFilterClient
            initialFilters={{
              search: resolvedParams?.search || '',
              action: resolvedParams?.action || '',
              resource: resolvedParams?.resource || '',
            }}
          >
            <AuditLogTable 
              auditLogs={auditLogs} 
              pagination={pagination}
            />
          </AuditLogFilterClient>
        </div>
      </div>
    </div>
  );
} 