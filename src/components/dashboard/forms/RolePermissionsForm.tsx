'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { updateRolePermissions } from '@/actions/admin/roleActions';

interface Permission {
  id: string;
  name: string;
  description: string | null;
  resource: string;
}

interface RolePermissionsFormProps {
  role: string;
  permissions: Permission[];
  initialPermissions: string[];
}

export function RolePermissionsForm({ role, permissions, initialPermissions }: RolePermissionsFormProps) {
  const router = useRouter();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPermissions);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => {
      if (prev.includes(permissionId)) {
        return prev.filter(id => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleResourceToggle = (resource: string, resourcePermissions: Permission[]) => {
    const resourcePermissionIds = resourcePermissions.map(p => p.id);
    const allSelected = resourcePermissionIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      // Unselect all permissions for this resource
      setSelectedPermissions(prev => prev.filter(id => !resourcePermissionIds.includes(id)));
    } else {
      // Select all permissions for this resource
      setSelectedPermissions(prev => {
        const newPermissions = [...prev];
        resourcePermissionIds.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return newPermissions;
      });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateRolePermissions(role, selectedPermissions);
      
      if (result.success) {
        toast.success(`Permissions for ${role} role have been updated successfully.`);
        router.push('/permissions/roles');
        router.refresh();
      } else {
        toast.error(result.message || 'Failed to update permissions.');
      }
    } catch (error) {
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => {
        const resourcePermissionIds = resourcePermissions.map(p => p.id);
        const allSelected = resourcePermissionIds.every(id => selectedPermissions.includes(id));
        const someSelected = resourcePermissionIds.some(id => selectedPermissions.includes(id));
        
        return (
          <Card key={resource} className="p-4 rounded-sm shadow">
            <div className="mb-4 flex items-center">
              <Checkbox 
                id={`resource-${resource}`}
                checked={allSelected}
                onCheckedChange={() => handleResourceToggle(resource, resourcePermissions)}
              />
              <label 
                htmlFor={`resource-${resource}`}
                className={`ml-2 text-lg font-medium cursor-pointer ${someSelected && !allSelected ? "text-gray-500" : ""}`}
              >
                {resource} {someSelected && !allSelected ? "(Partial)" : ""}
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 pl-6">
              {resourcePermissions.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-2">
                  <Checkbox 
                    id={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                  />
                  <div>
                    <label htmlFor={permission.id} className="font-medium cursor-pointer">
                      {permission.name}
                    </label>
                    <p className="text-sm text-gray-500">{permission.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        );
      })}
      
      <div className="flex justify-end space-x-4 mt-8">
        <Button 
          variant="outline" 
          onClick={() => router.push('/permissions/roles')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 