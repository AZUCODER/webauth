"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { useState, useEffect } from "react";
import { createPost, getCategories } from "@/actions/admin/postActions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PostStatus } from "@prisma/client";
import RichTextEditor from "@/components/editor/rich-text-editor";
import { Category, postSchema, PostFormData } from "@/types/post";


export default function AddPostForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [featuredImageUrl, setFeaturedImageUrl] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);

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
      status: PostStatus.DRAFT,
      isFeatured: false,
      categoryId: "",
    },
  });

  // Handle image upload
  const handleImageUpload = (url: string) => {
    setFeaturedImageUrl(url);
    setValue("featuredImage", url);
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
      const result = await createPost(formData);

      if (!result.success) {
        toast.error(result.error || "Failed to create post!");
        // console.error("Form error details:", result.details);

        if (result.details) {
          console.error("Form error details:", result.details);
        } // only log error when it realy exits
        return;
      }

      // Success handling
      toast.success("Post created!");

      // Reset form
      reset();
      setFeaturedImageUrl("");

      // Redirect to the posts list
      router.push("/posts/view");
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Internal failure, please try again late!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 ml-12 mt-4">
      <h2 className="text-lg font-bold text-slate-600">Add post</h2>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-1/2"
      >
        {/* title */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="title" className="text-slate-600 px-1">
            Title*
          </Label>
          <Input id="title" {...register("title")} placeholder="title is required" className="rounded-sm" />
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
            placeholder="please add some excerpt"
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
              type="hidden"
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
            defaultValue="none"
            onValueChange={(value) =>
              setValue("categoryId", value === "none" ? "" : value)
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="selete a category" className="rounded-sm" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                <SelectItem value="none">None</SelectItem>
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
              setValue("content", html);
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
            defaultValue={PostStatus.DRAFT}
            className="flex gap-4"
            onValueChange={(value) => setValue("status", value as PostStatus)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PostStatus.DRAFT} id="draft" />
              <Label htmlFor="draft" className="text-slate-600">draft</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PostStatus.PUBLISHED} id="published" />
              <Label htmlFor="published"  className="text-slate-600">published</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={PostStatus.ARCHIVED} id="archived" />
              <Label htmlFor="archived"  className="text-slate-600">archived</Label>
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
              setValue("isFeatured", isChecked);
            }}
          />
          <Label htmlFor="isFeatured" className="text-slate-600">
            IsFeatured
          </Label>
          <input type="hidden" {...register("isFeatured")} />
        </div>

        {/* submit button */}
        <div className="flex gap-4 mt-4 mb-4">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Add Post"}
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => {
              reset();
              setFeaturedImageUrl("");
              setContent("");
              setIsFeatured(false);
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
