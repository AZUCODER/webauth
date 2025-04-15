"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { logoutHandler } from "@/actions/auth/logoutActions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);

      const result = await logoutHandler();

      if (result.success) {
        toast.success("Logged out successfully");
        // Clear any client-side state here
        localStorage.clear();
        sessionStorage.clear();

        // Force a hard refresh to clear all client state
        window.location.href = "/login";
      } else {
        throw new Error(result.message || "Logout failed");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout. Please try again.");

      // Optionally force logout on frontend anyway
      router.push("/login");
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
