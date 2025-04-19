import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function AuditLogNotFound() {
  return (
    <div className="container mx-auto py-12 text-center">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Audit Log Not Found</h1>
        <p className="text-gray-500 max-w-md mx-auto">
          The requested audit log entry could not be found. It may have been deleted or you may not have permission to view it.
        </p>
        <Button asChild variant="default">
          <Link href="/audit-logs" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Audit Logs
          </Link>
        </Button>
      </div>
    </div>
  );
} 