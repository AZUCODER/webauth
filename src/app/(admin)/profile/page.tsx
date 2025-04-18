
import ProfileForm from "@/components/dashboard/forms/ProfileForm";
import { User } from "lucide-react";
import { getSession } from "@/lib/session/manager";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  // Check for session
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-6 p-6">
      <div className="mb-12 bg-gray-100 rounded-lg p-2">
        {/* Profile header */}
        <div className="flex items-center gap-2">
          <User className="h-6 w-6 text-primary" />
          <h1 className="text-xl">Edit Profile</h1>
        </div>
        <p className="text-muted-foreground mt-2">
          Update your user profile information and preferences
        </p>
      </div>
      {/* Profile form */}
      <ProfileForm />
    </div>
  );
}
