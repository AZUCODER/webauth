"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import ImageUploadButton from "@/components/UploadImage";
import { useEffect, useState } from "react";
import { updatePost, getCategories } from "@/actions/admin/postActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {Post, PostStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { Category, PostFormData, postSchema } from "@/types/post";


interface EditPostFormProps {
  post: Post;
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string>(
    post.featuredImage || ""
  );
  const [content, setContent] = useState<string>(post.content);
  const [isFeatured, setIsFeatured] = useState<boolean>(
    post.isFeatured || false
  );
  const [categories, setCategories] = useState<Category[]>([]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      const categoriesData = await getCategories();
      if (categoriesData) {
        setCategories(categoriesData);
      }
    };
    loadCategories();
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      status: post.status,
      isFeatured: post.isFeatured || false,
      categoryId: post.categoryId || undefined,
    },
  });

  // Set values when post changes
  useEffect(() => {
    reset({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || undefined,
      featuredImage: post.featuredImage || undefined,
      status: post.status,
      isFeatured: post.isFeatured || false,
      categoryId: post.categoryId || "",
    });

    setContent(post.content);
    setFeaturedImageUrl(post.featuredImage || "");
    setIsFeatured(post.isFeatured || false);
  }, [post, reset]);

  // Handle image upload
  const handleImageUpload = (url: string) => {
    setFeaturedImageUrl(url);
    setValue("featuredImage", url, { shouldDirty: true });
  };

  // Form submission handler
  const onSubmit = async (data: PostFormData) => {
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
      const result = await updatePost(post.id, formData);

      if (!result.success) {
        toast.error(result.error || "Failed to update.");
        // only log error when it realy exits
        if (result.details) {
          console.error("Form error details:", result.details);
        }
        return;
      }

      // Success handling
      toast.success("Post updated!");

      // Navigate to post view
      router.push(`/posts/view/${result.slug}`);
      router.refresh();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 ml-12 mt-4">
       <h2 className="text-lg font-bold text-slate-500">Edit Post</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full max-w-3xl"
      >
        {/* title */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="title" className="text-slate-600 px-1">
            Title*
          </Label>
          <Input
            id="title"
            {...register("title")}
            placeholder="Make your title unique"
            className="rounded-sm"
          />
          {errors.title && (
            <p className="text-red-400">{errors.title.message}</p>
          )}
        </div>

        {/* Excerpt */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="excerpt" className="text-slate-600 px-1">
            Excerpt
          </Label>
          <Textarea
            id="excerpt"
            {...register("excerpt")}
            placeholder="Excerpt is optional but nice to have"
             className="rounded-sm"
          />
          {errors.excerpt && (
            <p className="text-red-400">{errors.excerpt.message}</p>
          )}
        </div>

        {/* featured image */}
        <div className="flex flex-col items-start gap-2">
          <Label
            htmlFor="featuredImage"
            className="text-slate-600 px-1"
          >
           Post Image
          </Label>
          <ImageUploadButton onImageUpload={handleImageUpload} />
          {featuredImageUrl && (
            <Input
              id="featuredImage"
              className="rounded-sm"
              {...register("featuredImage")}
              value={featuredImageUrl}
              readOnly
            />
          )}
          {errors.featuredImage && (
            <p className="text-red-400">{errors.featuredImage.message}</p>
          )}
        </div>

        {/* category */}
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="categoryId"
            className="text-slate-600 px-1"
          >
            Categories
          </Label>
          <Select
            defaultValue={post.categoryId || "none"}
            onValueChange={(value) =>
              setValue("categoryId", value === "none" ? "" : value, {
                shouldDirty: true,
              })
            }
          >
            <SelectTrigger className="w-full rounded-sm">
              <SelectValue placeholder="select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                <SelectItem value="none"  className="rounded-sm">None</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <input type="hidden" {...register("categoryId")} />
          {errors.categoryId && (
            <p className="text-red-400">{errors.categoryId.message}</p>
          )}
        </div>

        {/* content */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="content" className="text-slate-600 px-1">
            Content*
          </Label>
          <RichTextEditor
            content={content}
            onChange={(html) => {
              setContent(html);
              setValue("content", html, { shouldDirty: true });
            }}
            className="w-full min-h-[20vh] rounded-sm"
            placeholder="Write your amazing content here..."
          />
          <input type="hidden" {...register("content")} />
          {errors.content && (
            <p className="text-red-400">{errors.content.message}</p>
          )}
        </div>

        {/* status */}
        <div className="flex flex-col gap-2">
          <Label className="text-slate-600 px-1">Status</Label>
          <RadioGroup
            defaultValue={post.status}
            className="flex gap-4"
            onValueChange={(value) =>
              setValue("status", value as PostStatus, { shouldDirty: true })
            }
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PostStatus.DRAFT} id="draft" />
              <Label htmlFor="draft" className="text-slate-600">draft</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PostStatus.PUBLISHED} id="published" />
              <Label htmlFor="published" className="text-slate-600">publish</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PostStatus.ARCHIVED} id="archived" />
              <Label htmlFor="archived" className="text-slate-600">archive</Label>
            </div>
          </RadioGroup>
          <input type="hidden" {...register("status")} />
          {errors.status && (
            <p className="text-red-400">{errors.status.message}</p>
          )}
        </div>

        {/* is featured */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isFeatured"
            checked={isFeatured}
            onCheckedChange={(checked) => {
              const isChecked = checked === true;
              setIsFeatured(isChecked);
              setValue("isFeatured", isChecked, { shouldDirty: true });
            }}
          />
          <Label htmlFor="isFeatured" className="text-slate-600">
            IsFeatured
          </Label>
          <input type="hidden" {...register("isFeatured")} />
        </div>

        {/* submit button */}
        <div className="flex gap-4 mt-4 mb-4">
          <Button type="submit"  size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> saving...
              </>
            ) : (
              "Save"
            )}
          </Button>
          <Button
            type="button"
             size="lg"
            variant="outline"
            onClick={() => router.push(`/posts/view/${post.slug}`)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
