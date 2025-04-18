import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session/manager';
import { PermissionForm } from '@/components/dashboard/forms/PermissionForm';

export default async function CreatePermissionPage() {
  // Check if user is logged in and is admin
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create Permission</h1>
        <p className="text-gray-500 mt-2">
          Add a new permission to control access to resources and actions.
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow p-6">
        <PermissionForm />
      </div>
    </div>
  );
} 