import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/session/manager';
import { getUserById } from '@/actions/admin/userActions';
import { UserForm } from '@/components/dashboard/forms/UserForm';
import { Separator } from '@/components/ui/separator';

export default async function EditUserPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  // Check if user is logged in and is admin
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    redirect("/dashboard");
  }

  // Resolve params
  const { id } = await params;

  // Get user by ID
  const result = await getUserById(id);

  if (!result.success || !result.user) {
    notFound();
  }

  // Type check - ensure result.user is not an array
  if (Array.isArray(result.user)) {
    throw new Error("Expected single user, got array");
  }

  // Now we can safely access result.user properties
  const user = result.user;

  // Validate role
  const validRoles = ["USER", "EDITOR", "MANAGER", "ADMIN"];
  if (!validRoles.includes(user.role)) {
    throw new Error(`Invalid user role: ${user.role}`);
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Edit User</h1>
        <p className="text-muted-foreground">Update user information below</p>
        <Separator className="my-4" />
      </div>

      <UserForm user={{
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as "USER" | "EDITOR" | "MANAGER" | "ADMIN"
      }} />
    </div>
  );
}