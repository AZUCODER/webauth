"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Profile Error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border border-red-100">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
           Something unknown happened during the processing, please try again later!
          </h2>

          <p className="text-gray-600 mt-1">
            {error.message ||
              "Something went wrong while updating your profile."}
          </p>

          {error.digest && (
            <p className="text-xs text-gray-500 mt-2">
              Error code: {error.digest}
            </p>
          )}

          <div className="flex gap-4 mt-6">
            <Button onClick={() => reset()} variant="default">
              Retry
            </Button>

            <Button onClick={() => router.push("/dashboard")} variant="outline">
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
