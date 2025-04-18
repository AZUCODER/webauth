import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto py-16 flex flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-sm max-w-md text-center">
        <FileQuestion className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Category not found</h1>
        <p className="text-gray-500 mb-6">
          The category you are looking for missing or deleted
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/categories/view">
              Back to categories
            </Link>
          </Button>
          <Button asChild>
            <Link href="/categories/add">
              Create post category
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
} 