import { getCategoryById } from "@/actions/admin/postCateActions";
import { getSession } from "@/lib/session/manager";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import EditCategoryForm from "@/components/dashboard/forms/EditCategoryForm";



interface PageProps {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  // Check for session first
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Redirect non-admin users
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Await params before accessing its properties
  const { id } = await params;
  
  // Get category data using the id
  if (!id) {
    notFound();
  }
  
  const category = await getCategoryById(id);

  // Handle not found
  if (!category) {
    notFound();
  }

  return (
    <div className="flex flex-col w-full mx-auto py-6 px-12">
      <div className="mb-6">
        <Link
          href="/post-categories/view"
          className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> Back to categories
        </Link>
        <h1 className="text-2xl font-bold">Update Post Category</h1>
      </div>
      <EditCategoryForm category={category} />
    </div>
  );
}

// Optional: Add metadata
export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  return {
    title: `Edit Category ${id || ''}`,
  };
}
