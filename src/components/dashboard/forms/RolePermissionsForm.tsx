'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
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
  userRole?: string;
}

export function RolePermissionsForm({ 
  role, 
  permissions, 
  initialPermissions,
  userRole = 'USER' 
}: RolePermissionsFormProps) {
  const router = useRouter();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(initialPermissions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [criticalPermissions, setCriticalPermissions] = useState<string[]>([]);

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  // Set up critical permissions that should be warned about when removed
  useEffect(() => {
    // Define permissions that are critical for each role
    const roleCriticalPermissions: Record<string, string[]> = {
      'ADMIN': [], // Admins have all permissions implicitly
      'MANAGER': ['user:view', 'user:create', 'role:view', 'permission:view'],
      'EDITOR': ['post:create', 'post:edit', 'post:delete', 'post:publish'],
      'USER': ['profile:view', 'profile:edit']
    };
    
    // Find the permission IDs for the critical permissions
    const criticalPermissionIds = permissions
      .filter(p => (roleCriticalPermissions[role] || []).includes(p.name))
      .map(p => p.id);
    
    setCriticalPermissions(criticalPermissionIds);
  }, [role, permissions]);

  // Check for changes
  useEffect(() => {
    const hasPermissionChanges = 
      initialPermissions.length !== selectedPermissions.length || 
      initialPermissions.some(id => !selectedPermissions.includes(id)) ||
      selectedPermissions.some(id => !initialPermissions.includes(id));
    
    setHasChanges(hasPermissionChanges);
  }, [selectedPermissions, initialPermissions]);

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
    // Check for critical permissions being removed
    const removedCriticalPermissions = criticalPermissions.filter(
      id => initialPermissions.includes(id) && !selectedPermissions.includes(id)
    );
    
    if (removedCriticalPermissions.length > 0 && role !== 'ADMIN') {
      // Get names of critical permissions being removed
      const criticalPermissionNames = permissions
        .filter(p => removedCriticalPermissions.includes(p.id))
        .map(p => p.name);
      
      // Show warning
      const confirmed = window.confirm(
        `Warning: You are removing critical permissions for the ${role} role: ${criticalPermissionNames.join(', ')}.\n\n` +
        `This may affect the ability of users with this role to perform essential functions.\n\n` + 
        `Are you sure you want to continue?`
      );
      
      if (!confirmed) {
        return;
      }
    }
    
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

  // Check if user can edit permissions based on role
  const canEdit = userRole === 'ADMIN' || (role !== 'ADMIN');
  const isEditingAdminRole = role === 'ADMIN';

  return (
    <div className="space-y-6">
      {!canEdit && (
        <div className="p-4 mb-4 bg-red-50 text-red-700 border border-red-200 rounded-md flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>You don't have permission to edit these role permissions.</span>
        </div>
      )}
      
      {isEditingAdminRole && userRole === 'ADMIN' && (
        <div className="p-4 mb-4 bg-amber-50 text-amber-700 border border-amber-200 rounded-md flex items-center">
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span>Admin users have implicit access to all system features. Changes here are for documentation purposes only.</span>
        </div>
      )}
      
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
                disabled={!canEdit}
              />
              <label 
                htmlFor={`resource-${resource}`}
                className={`ml-2 text-lg font-medium cursor-pointer ${!canEdit ? "text-gray-400" : ""} ${someSelected && !allSelected ? "text-gray-500" : ""}`}
              >
                {resource} {someSelected && !allSelected ? "(Partial)" : ""}
              </label>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2 pl-6">
              {resourcePermissions.map((permission) => {
                const isSelected = selectedPermissions.includes(permission.id);
                const isCritical = criticalPermissions.includes(permission.id);
                
                return (
                  <div key={permission.id} className="flex items-start space-x-2">
                    <Checkbox 
                      id={permission.id}
                      checked={isSelected}
                      onCheckedChange={() => handlePermissionToggle(permission.id)}
                      disabled={!canEdit}
                    />
                    <div>
                      <label 
                        htmlFor={permission.id} 
                        className={`font-medium cursor-pointer ${!canEdit ? "text-gray-400" : ""} ${isCritical ? "text-blue-600" : ""}`}
                      >
                        {permission.name} {isCritical && <span className="text-xs text-blue-600">(critical)</span>}
                      </label>
                      <p className={`text-sm ${!canEdit ? "text-gray-400" : "text-gray-500"}`}>
                        {permission.description}
                      </p>
                    </div>
                  </div>
                );
              })}
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
          disabled={isSubmitting || !canEdit || !hasChanges}
          variant={!hasChanges ? "outline" : "default"}
        >
          {isSubmitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
} 