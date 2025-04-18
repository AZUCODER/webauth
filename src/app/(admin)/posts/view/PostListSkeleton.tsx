import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function PostListSkeleton() {
  // Create an array of 8 items for the grid
  const skeletonItems = Array.from({ length: 8 }, (_, i) => i);

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-[160px]" />
        </div>
        <Skeleton className="h-5 w-40" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {skeletonItems.map((index) => (
          <Card key={index} className="overflow-hidden flex flex-col h-full">
            <Skeleton className="h-40 w-full" />

            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
              <Skeleton className="h-6 w-full mt-2" />
            </CardHeader>

            <CardContent className="py-2 flex-grow">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </CardContent>

            <CardFooter className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-16" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}
