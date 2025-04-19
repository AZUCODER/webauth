import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session/manager';
import { getAuditLogDetails } from '@/actions/admin/auditLogActions';
import { AuditLogDetail } from '@/components/dashboard/AuditLogDetail';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AuditLogDetailPage({ params }: PageProps) {
  // Check if user is logged in and is admin
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  // Get the audit log ID from params
  const { id } = await params;
  
  // Get audit log details
  const result = await getAuditLogDetails(id);
  
  if (!result.success || !result.auditLog) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Audit Log Details</h1>
        <p className="text-gray-500 mt-2 bg-gray-100 p-2 rounded-sm">
          Detailed information about the selected audit log event.
        </p>
      </div>

      <div className="bg-card rounded-sm shadow-md p-6">
        <AuditLogDetail auditLog={result.auditLog} />
      </div>
    </div>
  );
} 