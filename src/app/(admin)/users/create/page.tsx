import { redirect } from "next/navigation";
import { getSession } from "@/lib/session/manager";
import { UserForm } from "@/components/dashboard/forms/UserForm";
import { Separator } from "@/components/ui/separator";
import { UserPlus } from "lucide-react";

export default async function CreateUserPage() {
  // Check if user is logged in and is admin
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Create New User</h1>
        </div>
        <p className="text-muted-foreground mt-2">Add a new user to the system with specific permissions.</p>
        <Separator className="my-4" />
      </div>
      <UserForm />
    </div>
  );
}
