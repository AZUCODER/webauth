import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSession } from '@/lib/session/manager';
import { getPermissions } from '@/actions/admin/permissionActions';
import { Role } from '@prisma/client';
import { PermissionData } from '@/types/permission';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import React from 'react';
import { 
  ArrowRight, 
  User, 
  FileText, 
  Settings, 
  Shield,
  Users,
  FileEdit
} from 'lucide-react';

export default async function RolePermissionsPage() {
  // Check if user is logged in and is admin
  const session = await getSession();
  
  if (!session || session.role !== 'ADMIN') {
    redirect('/dashboard');
  }
  
  // Get all permissions (needed to count permissions by type)
  const result = await getPermissions();
  
  const permissions: PermissionData[] = result.success && Array.isArray(result.permission) 
    ? result.permission as PermissionData[]
    : [];
  
  // Count permissions by resource
  const resourceCounts: Record<string, number> = {};
  permissions.forEach(permission => {
    if (!resourceCounts[permission.resource]) {
      resourceCounts[permission.resource] = 0;
    }
    resourceCounts[permission.resource]++;
  });
  
  // All available roles with enhanced metadata
  const roles: Array<{
    role: Role, 
    description: string, 
    icon: React.ReactNode,
    permissionLevel: 'low' | 'medium' | 'high' | 'full',
    color: string,
    primaryFeatures: string[]
  }> = [
    { 
      role: 'USER', 
      description: 'Regular users with limited access to system features.', 
      icon: <User className="h-8 w-8" />,
      permissionLevel: 'low',
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      primaryFeatures: ['View content', 'Manage own profile', 'Basic interactions']
    },
    { 
      role: 'EDITOR', 
      description: 'Content editors who can manage posts and content.', 
      icon: <FileEdit className="h-8 w-8" />,
      permissionLevel: 'medium',
      color: 'bg-green-50 text-green-700 border-green-200',
      primaryFeatures: ['Create content', 'Edit content', 'Moderate comments']
    },
    { 
      role: 'MANAGER', 
      description: 'Managers with broader access to administrative features.', 
      icon: <Users className="h-8 w-8" />,
      permissionLevel: 'high',
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      primaryFeatures: ['User management', 'Content approval', 'Reports & analytics']
    },
    { 
      role: 'ADMIN', 
      description: 'Administrators with full access to all system features.', 
      icon: <Shield className="h-8 w-8" />,
      permissionLevel: 'full',
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      primaryFeatures: ['Full system access', 'Manage all users', 'Configure settings']
    },
  ];

  // Get the total number of resources
  const totalResources = Object.keys(resourceCounts).length;

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-xl font-bold">Role Permissions</h1>
          <p className="text-gray-500 mt-2 bg-gray-100 p-2 rounded-sm">
            Define which permissions are granted to each user role
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1">
            <FileText className="mr-1 h-3 w-3" /> {permissions.length} Total Permissions
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            <Settings className="mr-1 h-3 w-3" /> {totalResources} Resources
          </Badge>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {roles.map(({ role, description, icon, permissionLevel, color, primaryFeatures }) => (
          <Card 
            key={role} 
            className={`hover:shadow-md transition-shadow overflow-hidden border-l-4 ${color.includes('border-') ? color.split(' ').find(c => c.startsWith('border-')) : ''}`}
          >
            <div className="flex flex-col md:flex-row">
              <div className={`hidden md:flex items-center justify-center p-6 ${color}`} style={{width: '100px'}}>
                {icon}
              </div>
              
              <CardHeader className="flex-1">
                <div className="flex items-center">
                  <div className="md:hidden mr-3">{icon}</div>
                  <div>
                    <CardTitle className="text-xl flex items-center">
                      {role} Role
                      <Badge 
                        className={`ml-3 ${
                          permissionLevel === 'low' ? 'bg-blue-100 text-blue-800' : 
                          permissionLevel === 'medium' ? 'bg-green-100 text-green-800' : 
                          permissionLevel === 'high' ? 'bg-amber-100 text-amber-800' : 
                          'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {permissionLevel === 'low' ? 'Basic Access' : 
                         permissionLevel === 'medium' ? 'Standard Access' : 
                         permissionLevel === 'high' ? 'Extended Access' : 
                         'Full Access'}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">{description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 pt-6 pb-0 px-6 md:pt-6">
                <div className="flex flex-wrap gap-2">
                  {primaryFeatures.map(feature => (
                    <Badge key={feature} variant="secondary" className="font-normal">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <div className="px-6 pb-6 pt-2 md:p-6 flex items-center">
                <Link href={`/permissions/roles/${role}`}>
                  <Button>
                    Manage Permissions <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}