import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/manager";
import { getPermissions } from "@/actions/admin/permissionActions";
import { getRolePermissions } from "@/actions/admin/roleActions";
import { RolePermissionsForm } from "@/components/dashboard/forms/RolePermissionsForm";
import { hasPermission } from "@/lib/authorization/permissions";

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
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold">{roleName} Role Permissions</h1>
        <p className="text-accent-foreground/60">
          Select the permissions to assign to the {roleName.toLowerCase()} role.
        </p>

        {roleName === "ADMIN" && (
          <div className="mt-4 p-3 bg-amber-50 text-amber-800 border border-amber-200 rounded-md">
            <strong>Warning:</strong> Changes to the Admin role permissions can
            affect system functionality. Admin users have implicit access to all
            system features regardless of assigned permissions.
          </div>
        )}

        {isEditingSameRole && session.role !== "ADMIN" && (
          <div className="mt-4 p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-md">
            <strong>Note:</strong> You are editing permissions for your own
            role. Be careful not to remove permissions you need to perform your
            duties.
          </div>
        )}
      </div>

      <RolePermissionsForm
        role={roleName}
        permissions={permissions}
        initialPermissions={rolePermissions}
        userRole={session.role}
      />
    </div>
  );
}
