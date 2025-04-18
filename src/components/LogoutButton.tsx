"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutHandler } from "@/actions/auth/logoutActions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LOGOUT_REDIRECT_PATH } from "@/lib/constants/paths";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const result = await logoutHandler();

      if (result.success) {
        toast.success("Logged out successfully");
        
        // Clear any client-side state
        localStorage.clear();
        sessionStorage.clear();

        // Use the redirect path from the response or fall back to the constant
        const redirectPath = result.redirectTo || LOGOUT_REDIRECT_PATH;
        
        // Force a hard refresh to clear all client state
        window.location.href = redirectPath;
      } else {
        throw new Error(result.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");

      // Optionally force logout on frontend anyway
      router.push(LOGOUT_REDIRECT_PATH);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoggingOut}
      variant="destructive"
      className="w-full"
      size="sm"
    >
      {isLoggingOut ? (
        <>
          <span className="loading-spinner mr-2" aria-hidden="true" />
          Logging out...
        </>
      ) : (
        "Logout"
      )}
    </Button>
  );
}
