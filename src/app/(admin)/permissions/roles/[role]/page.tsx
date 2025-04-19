import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session/manager';
import { getPermissions } from '@/actions/admin/permissionActions';
import { getRolePermissions } from '@/actions/admin/roleActions';
import { RolePermissionsForm } from '@/components/dashboard/forms/RolePermissionsForm';

interface RolePermissionsPageProps {
  params: Promise<{
    role: string;
  }>;
}

export default async function RolePermissionsPage({ params }: RolePermissionsPageProps) {
  // Check if user is logged in and is admin
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  // Await params before accessing its properties
  const { role: roleName } = await params;
  
  // Validate role name
  const validRoles = ['USER', 'EDITOR', 'MANAGER', 'ADMIN'];
  if (!validRoles.includes(roleName)) {
    redirect('/permissions/roles');
  }
  
  // Get all permissions
  const permissionsResult = await getPermissions();
  
  const permissions = permissionsResult.success && Array.isArray(permissionsResult.permission) 
    ? permissionsResult.permission 
    : [];
    
  // Get current role permissions
  const rolePermissionsResult = await getRolePermissions(roleName);
  
  const rolePermissions = rolePermissionsResult.success && Array.isArray(rolePermissionsResult.permissions)
    ? rolePermissionsResult.permissions
    : [];

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold">{roleName} Role Permissions</h1>
        <p className="text-gray-500 mt-2 bg-gray-100 p-2 rounded-sm">
          Select the permissions to assign to the {roleName.toLowerCase()} role.
        </p>
      </div>
      
      <RolePermissionsForm 
        role={roleName}
        permissions={permissions}
        initialPermissions={rolePermissions}
      />
    </div>
  );
} 