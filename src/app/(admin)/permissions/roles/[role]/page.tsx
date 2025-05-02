import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/manager";
import { getPermissions } from "@/actions/admin/permissionActions";
import { getRolePermissions } from "@/actions/admin/roleActions";
import { RolePermissionsForm } from "@/components/dashboard/forms/RolePermissionsForm";
import { hasPermission } from "@/lib/authorization/permissions";
import { AlertTriangle, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@/components/ui/breadcrumb";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface RolePermissionsPageProps {
  params: Promise<{
    role: string;
  }>;
}

export default async function RolePermissionsPage({
  params,
}: RolePermissionsPageProps) {
  // Check if user is logged in and has proper permissions
  const session = await getSession();

  if (!session) {
    redirect("/login?callbackUrl=/permissions/roles");
  }

  // Check if user has permissions to manage roles
  const canManageRoles =
    session.role === "ADMIN" || (await hasPermission("role:manage"));

  if (!canManageRoles) {
    redirect("/dashboard?error=insufficient_permissions");
  }

  // Await params before accessing its properties
  const { role: roleName } = await params;

  // Validate role name
  const validRoles = ["USER", "ADMIN"];
  if (!validRoles.includes(roleName)) {
    redirect("/permissions/roles?error=invalid_role");
  }

  // Special check for ADMIN role - only ADMIN users can modify ADMIN role permissions
  if (roleName === "ADMIN" && session.role !== "ADMIN") {
    redirect("/permissions/roles?error=cannot_modify_admin");
  }

  // Get all permissions
  const permissionsResult = await getPermissions();

  const permissions =
    permissionsResult.success && Array.isArray(permissionsResult.permission)
      ? permissionsResult.permission
      : [];

  // Get current role permissions
  const rolePermissionsResult = await getRolePermissions(roleName);

  const rolePermissions =
    rolePermissionsResult.success &&
    Array.isArray(rolePermissionsResult.permissions)
      ? rolePermissionsResult.permissions
      : [];

  // Determine if user is the same role as the one being edited
  const isEditingSameRole = session.role === roleName;

  return (
    <div className="container max-w-5xl mx-auto py-6 space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbItem>
          <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink href="/permissions/roles">Roles</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <span className="font-medium">{roleName}</span>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            {roleName} Role Permissions
          </CardTitle>
          <CardDescription>
            Configure access permissions for the {roleName.toLowerCase()} role
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {roleName === "ADMIN" && (
            <Alert variant="warning" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Administrator Role</AlertTitle>
              <AlertDescription>
                Changes to Admin permissions may affect system functionality. Admin users have implicit access to all features.
              </AlertDescription>
            </Alert>
          )}

          {isEditingSameRole && session.role !== "ADMIN" && (
            <Alert variant="info" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertTitle>Self-Editing</AlertTitle>
              <AlertDescription>
                You are editing your own role. Be careful not to remove permissions you need.
              </AlertDescription>
            </Alert>
          )}

          <div className="mt-4">
            <RolePermissionsForm
              role={roleName}
              permissions={permissions}
              initialPermissions={rolePermissions}
              userRole={session.role}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
