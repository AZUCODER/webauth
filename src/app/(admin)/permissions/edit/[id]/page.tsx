import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session/manager';
import { getPermissionById } from '@/actions/admin/permissionActions';
import { PermissionForm } from '@/components/dashboard/forms/PermissionForm';
import { PermissionData } from '@/types/permission';

interface EditPermissionPageProps {
  params: {
    id: string;
  };
}

export default async function EditPermissionPage({ params }: EditPermissionPageProps) {
  // Check if user is logged in and is admin
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  // Get permission data
  const result = await getPermissionById(params.id);
  
  if (!result.success || !result.permission) {
    redirect('/permissions');
  }
  
  const permission = result.permission as PermissionData;
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Permission</h1>
        <p className="text-gray-500 mt-2">
          Update the details for permission <span className="font-medium">{permission.name}</span>
        </p>
      </div>
      
      <div className="bg-card rounded-lg shadow p-6">
        <PermissionForm initialData={permission} isEditing={true} />
      </div>
    </div>
  );
} 