import { getCategories } from "@/actions/admin/postCateActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CategoryTable from "@/components/dashboard/tables/CategoryTable";
import { PlusCircle } from "lucide-react";
import { getSession } from "@/lib/session/manager";
import { redirect } from "next/navigation";

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>;
}) {
  // Check for session first
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Redirect non-admin users
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Await searchParams before accessing its properties
  const resolvedParams = await searchParams;
  const page = Number(resolvedParams.page) || 1;
  const limit = Number(resolvedParams.limit) || 10;

  const categoriesData = await getCategories(page, limit);

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Post Categories</h1>
          <p className="text-gray-500 mt-1">
            Manage post categories to orgnize posts well
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/post-categories/add">
            <Button className="flex items-center gap-1" size="sm">
              <PlusCircle className="h-4 w-4" />
              Add Category
            </Button>
          </Link>
        </div>
      </div>

      {categoriesData ? (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <CategoryTable
            categories={categoriesData.categories}
            pagination={categoriesData.pagination}
          />
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500">
            Post category loading failed, please try again
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Refresh page
          </Button>
        </div>
      )}
    </div>
  );
}
