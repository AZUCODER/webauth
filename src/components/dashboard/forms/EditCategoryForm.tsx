"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { updateCategory } from "@/actions/admin/postCateActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { CateFormData, categorySchema } from "@/types/post";



interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface EditCategoryFormProps {
  category: Category;
}

export default function EditCategoryForm({ category }: EditCategoryFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CateFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category.name,
      description: category.description || "",
    },
  });

  // Reset form when category changes
  useEffect(() => {
    reset({
      name: category.name,
      description: category.description || "",
    });
  }, [category, reset]);

  // Form submission handler
  const onSubmit = async (data: CateFormData) => {
    try {
      setIsSubmitting(true);

      // Create FormData object
      const formData = new FormData();

      // Add only defined values to FormData
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          formData.append(key, value.toString());
        }
      });

      // Call the server action
      const result = await updateCategory(category.id, formData);

      if (!result.success) {
        toast.error(result.error || "Failed to update post category");
        
        if (result.details) {
          console.error("Form error details:", result.details);
        }
        
        return;
      }

      // Success handling
      toast.success("Post category updated!");

      // Redirect to the categories list
      router.push("/post-categories/view");
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Internal error, please try again later");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-3 w-1/2"
      >
        {/* Category name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-base font-medium">
            Category Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="category name..."
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="description" className="text-base font-medium">
          Description
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="description(optional)"
            rows={4}
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description.message}</p>
          )}
        </div>

        {/* Extra info */}
        <div className="bg-gray-50 p-4 rounded-md text-sm text-gray-600 mt-2">
          <p>
            <span className="font-medium">CateID:</span> {category.id}
          </p>
          <p className="mt-1">
            <span className="font-medium">CateSlug:</span> {category.slug}
          </p>
          <p className="mt-1">
            <span className="font-medium">CreatedAt:</span> {new Date(category.createdAt).toISOString().slice(0, 19).replace('T', ' ')}
          </p>
        </div>

        {/* Submit and Cancel buttons */}
        <div className="flex gap-3 justify-end mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/post-categories/view')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || !isDirty}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Update"
            )}
          </Button>
        </div>
      </form>
  );
} 