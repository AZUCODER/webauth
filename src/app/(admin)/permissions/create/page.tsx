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
        <h1 className="text-xl font-bold">Create Permission</h1>
        <p className="text-gray-500 mt-2 bg-gray-100 p-2 rounded-sm">
          Add a new permission to control access to resources and actions.
        </p>
      </div>
      
      <div className="bg-card rounded-sm shadow-md p-6">
        <PermissionForm />
      </div>
    </div>
  );
} 