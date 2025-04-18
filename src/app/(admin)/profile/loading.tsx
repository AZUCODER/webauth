import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function Loading() {
  return (
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      {/* admin main content section */}
      <div className="flex w-[80vw] flex-col gap-4 p-4">
       
          <h1 className="text-2xl font-semibold mb-6"> Edit Profile </h1>

          {/* Form skeleton */}
          <div className="flex flex-col gap-6 w-1/2">
            {/* Avatar loading skeleton */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-20 w-20 rounded-full" />
              </div>
            </div>

            {/* Bio loading skeleton */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-32 w-full" />
            </div>

            {/* Website loading skeleton */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Location loading skeleton */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Social Links loading skeleton */}
            <Skeleton className="h-6 w-32 mt-2" />

            {/* Twitter */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* GitHub */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* LinkedIn */}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 mt-4">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
      </div>
    </div>
  );
}
