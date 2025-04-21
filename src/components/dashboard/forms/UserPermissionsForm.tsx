'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { UserPermissionData } from '@/types/permission';
import { updateUserPermissions } from '@/actions/admin/permissionActions';

interface UserPermissionsFormProps {
  userData: UserPermissionData;
  allPermissions: string[]; // All available permission names
}

export function UserPermissionsForm({ 
  userData,
  allPermissions
}: UserPermissionsFormProps) {
  const router = useRouter();
  const [overrides, setOverrides] = useState<Record<string, boolean>>(userData.overrides || {});
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Group permissions by first part (resource)
  const groupedPermissions: Record<string, string[]> = {};
  allPermissions.forEach(permission => {
    const [resource] = permission.split(':');
    if (!groupedPermissions[resource]) {
      groupedPermissions[resource] = [];
    }
    groupedPermissions[resource].push(permission);
  });
  
  // Filter permissions based on search term
  const filteredResources = Object.keys(groupedPermissions).filter(resource =>
    resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
    groupedPermissions[resource].some(permission =>
      permission.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleToggle = (permission: string, value: boolean | null) => {
    setOverrides(prev => {
      const newOverrides = { ...prev };
      if (value === null) {
        // Remove override (revert to role permission)
        delete newOverrides[permission];
      } else {
        // Set override
        newOverrides[permission] = value;
      }
      return newOverrides;
    });
  };

  const getPermissionStatus = (permission: string): 'role' | 'granted' | 'denied' => {
    if (permission in overrides) {
      return overrides[permission] ? 'granted' : 'denied';
    }
    return 'role';
  };

  const getPermissionStatusLabel = (permission: string) => {
    const status = getPermissionStatus(permission);
    if (status === 'role') {
      return userData.rolePermissions.includes(permission) ? (
        <Badge variant="outline" className="bg-blue-100 text-blue-800">From Role</Badge>
      ) : (
        <Badge variant="outline" className="bg-gray-100 text-gray-800">Not Granted</Badge>
      );
    } else if (status === 'granted') {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Explicitly Granted</Badge>;
    } else {
      return <Badge variant="outline" className="bg-red-100 text-red-800">Explicitly Denied</Badge>;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateUserPermissions(userData.userId, overrides);
      
      if (result.success) {
        toast.success(`Permissions for user ${userData.userName || userData.userEmail} updated successfully`);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to update user permissions');
      }
    } catch (error) {
      console.error('User permissions update error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Input
          placeholder="Search permissions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => router.push('/permissions/users')}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Permission Overrides'}
          </Button>
        </div>
      </div>
      
      <div className="bg-muted/50 p-4 rounded-md">
        <h3 className="text-lg font-medium mb-2">User Information</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p>{userData.userEmail}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p>{userData.userName || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role</p>
            <p>{userData.role}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Role Permissions</p>
            <p>{userData.rolePermissions.length}</p>
          </div>
        </div>
      </div>
      
      <div>
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Permissions</TabsTrigger>
            <TabsTrigger value="overrides">Overrides Only ({Object.keys(overrides).length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            {filteredResources.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No permissions found matching your search.
              </div>
            ) : (
              filteredResources.map(resource => (
                <Card key={resource} className="mb-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{resource}</CardTitle>
                    <CardDescription>
                      {groupedPermissions[resource].length} permission{groupedPermissions[resource].length !== 1 ? 's' : ''}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {groupedPermissions[resource].map(permission => (
                        <div key={permission} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                          <div className="flex-1">
                            <p className="font-medium">{permission}</p>
                            <div className="mt-1">{getPermissionStatusLabel(permission)}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={getPermissionStatus(permission) === 'role' ? 'bg-blue-100' : ''}
                              onClick={() => handleToggle(permission, null)}
                            >
                              Role Default
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={getPermissionStatus(permission) === 'granted' ? 'bg-green-100' : ''}
                              onClick={() => handleToggle(permission, true)}
                            >
                              Grant
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className={getPermissionStatus(permission) === 'denied' ? 'bg-red-100' : ''}
                              onClick={() => handleToggle(permission, false)}
                            >
                              Deny
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="overrides">
            {Object.keys(overrides).length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No permission overrides set. User inherits all permissions from their role.
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Permission Overrides</CardTitle>
                  <CardDescription>
                    Permissions that are explicitly granted or denied for this user, overriding their role.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Object.entries(overrides).map(([permission, granted]) => (
                      <div key={permission} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50">
                        <div className="flex-1">
                          <p className="font-medium">{permission}</p>
                          <div className="mt-1">
                            {granted ? (
                              <Badge variant="outline" className="bg-green-100 text-green-800">Explicitly Granted</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-red-100 text-red-800">Explicitly Denied</Badge>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleToggle(permission, null)}
                        >
                          Reset to Role Default
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 