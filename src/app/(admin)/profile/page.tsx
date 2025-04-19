import ProfileForm from "@/components/dashboard/forms/ProfileForm";
import { Separator } from "@/components/ui/separator";
import { getSession } from "@/lib/session/manager";
import { redirect } from "next/navigation";
import { hasPermission } from "@/lib/authorization/permissions";

export default async function ProfilePage() {
  // Check for session
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Users can view their own profile, and users with profile:read permission can view any profile
  const canViewProfile = await hasPermission('profile:read');
  
  if (!canViewProfile && session.role !== 'ADMIN') {
    // Check if they have any profile-related permissions
    const hasAnyProfilePerms = await hasPermission('profile:basic');
    
    if (!hasAnyProfilePerms) {
      redirect("/dashboard?error=insufficientPermissions");
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">
          Update your personal information and preferences
        </p>
        <Separator className="my-4" />
      </div>
      
      <ProfileForm /> 
    </div>
  );
}
