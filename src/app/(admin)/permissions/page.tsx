import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/manager";
import { getPermissions } from "@/actions/admin/permissionActions";
import { PermissionTable } from "@/components/dashboard/tables/PermissionTable";
import { PermissionData } from "@/types/permission";

interface PageProps {
  searchParams?: {
    page?: string;
    pageSize?: string;
    search?: string;
    resource?: string;
  };
}

export default async function PermissionsPage({ searchParams }: PageProps) {
  // Check if user is logged in and is admin
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Get all permissions
  const result = await getPermissions();

  const permissions: PermissionData[] =
    result.success && Array.isArray(result.permission)
      ? (result.permission as PermissionData[])
      : [];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-xl font-bold">Permissions Management</h1>
      <p className="text-accent-foreground/60">
        Manage permissions that control access to system resources and actions.
      </p>
      <div className="grid grid-cols-1 gap-6 mt-4">
        <div className="bg-card rounded-sm shadow">
          <div className="p-6">
            <PermissionTable permissions={permissions} />
          </div>
        </div>
      </div>
    </div>
  );
}
