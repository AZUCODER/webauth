import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/manager";
import { getPaginatedPermissions } from "@/actions/admin/permissionActions";
import { PermissionTable } from "@/components/dashboard/tables/PermissionTable";
import { PermissionData } from "@/types/permission";

export default async function PermissionsPage({ 
  searchParams 
}: { 
  searchParams?: {
    page?: string;
    pageSize?: string;
    search?: string;
    resource?: string;
  }
}) {
  // Check if user is logged in and is admin
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Parse search parameters
  const params = await Promise.resolve(searchParams);
  const page = params?.page ? parseInt(params.page) : 1;
  const pageSize = params?.pageSize ? parseInt(params.pageSize) : 10;
  const search = params?.search || "";
  const resourceFilter = params?.resource || "";

  // Get permissions with pagination and filters
  const result = await getPaginatedPermissions(
    page,
    pageSize,
    search,
    resourceFilter
  );

  const permissions: PermissionData[] = result.success && result.permissions
    ? result.permissions as PermissionData[]
    : [];

  // Prepare pagination data
  const pagination = {
    currentPage: page,
    pageSize: pageSize,
    totalItems: result.totalCount || 0,
    totalPages: result.totalPages || 1
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-xl font-bold">Permissions Management</h1>
      <p className="text-accent-foreground/60">
        Manage permissions that control access to system resources and actions.
      </p>
      <div className="grid grid-cols-1 gap-6 mt-4">
        <div className="bg-card rounded-sm shadow">
          <div className="p-6">
            <PermissionTable 
              permissions={permissions}
              pagination={pagination} 
              initialFilters={{ search, resource: resourceFilter }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
