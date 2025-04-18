import AddCategoryForm from "@/components/dashboard/forms/AddCategoryForm";
import { getSession } from "@/lib/session/manager";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";


export default async function AddCategoryPage() {
  // Check for session first
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Redirect non-admin users
  if (session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col w-full mx-auto py-6 px-12">
      <div className="mb-6">
        <Link 
          href="/post-categories/view" 
          className="text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4" /> back to categories
        </Link>
        <h1 className="text-2xl font-bold">Add Category</h1>
      </div>
       <AddCategoryForm />
    </div>
  );
} 