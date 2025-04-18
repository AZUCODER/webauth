"use client";

import { useCallback, useEffect, useState } from "react";
import { getPosts, deletePost } from "@/actions/admin/postActions";
import { formatDistanceToNow } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Filter,
  MoreHorizontal,
  AlertTriangle,
  Pencil,
  Trash,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Post, PostStatus} from "@prisma/client";
import { Pagination } from "@/components/custom-pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";

interface PostWithAuthor extends Post {
  author: {
    name: string | null;
    email: string;
  };
  category: {
    name: string;
    id: string;
    slug: string;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
  } | null;
}

interface PostsData {
  posts: PostWithAuthor[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
}

interface PostListProps {
  initialPage: number;
  initialStatus?: PostStatus;
}

const statusColors = {
  DRAFT: "bg-yellow-100 text-yellow-800",
  PUBLISHED: "bg-green-100 text-green-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

export default function PostList({
  initialPage,
  initialStatus,
}: PostListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [postsData, setPostsData] = useState<PostsData | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [status, setStatus] = useState<PostStatus | undefined>(initialStatus);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [postToEdit, setPostToEdit] = useState<string | null>(null);
  const [postTitleToEdit, setPostTitleToEdit] = useState<string | null>(null);

  // Load posts
  const loadPosts = useCallback(async () => {
    setIsLoading(true);
    const data = await getPosts(currentPage, 8, status);
    setPostsData(data);
    setIsLoading(false);
  }, [currentPage, status]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // Confirm edit handler
  const handleEditClick = (postId: string, postTitle: string) => {
    setPostToEdit(postId);
    setPostTitleToEdit(postTitle);
    setEditDialogOpen(true);
  };

  // Edit handler
  const handleEditConfirm = () => {
    if (!postToEdit) return;
    router.push(`/posts/edit/${postToEdit}`);
    setEditDialogOpen(false);
  };

  // Confirm delete handler
  const handleDeleteClick = (postId: string) => {
    const post = postsData?.posts.find(p => p.id === postId);
    setPostToDelete(postId);
    setPostTitleToEdit(post?.title || null);
    setDeleteDialogOpen(true);
  };

  // Delete handler
  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    const result = await deletePost(postToDelete);

    if (result.success) {
      toast.success("Post deleted!");
      loadPosts(); // Reload posts after delete
    } else {
      toast.error(result.error || "Failed to delete.");
    }

    setDeleteDialogOpen(false);
    setPostToDelete(null);
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    const newStatus = value === "ALL" ? undefined : (value as PostStatus);
    setStatus(newStatus);
    setCurrentPage(1);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    if (newStatus) {
      params.set("status", newStatus);
    } else {
      params.delete("status");
    }
    params.set("page", "1");
    router.push(`/view-posts?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);

    // Update URL
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    router.push(`/view-posts?${params.toString()}`);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!postsData || postsData.posts.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-xl font-medium mb-4">None</h3>
        <p className="text-gray-500 mb-6">
          {status
            ? `No ${status.toLowerCase()} posts found.`
            : "No post created yet."}
        </p>
        <Link href="/add-post">
          <Button>Add Post</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter size={18} />
            <span className="mr-2">Status：</span>
            <Select value={status || "ALL"} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="select sattus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          {postsData.posts.length} / {postsData.pagination.totalItems}
          Post
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {postsData.posts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden flex flex-col h-full shadow-none transition-shadow duration-300 cursor-pointer hover:shadow-md hover:shadow-gray-300"
          >
            {post.featuredImage && (
              <div className="relative h-[20vh] w-full">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover rounded-lg py-1 px-2 transition-all duration-300 hover:scale-110"
                />
              </div>
            )}

            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={statusColors[post.status]}
                  >
                    {statusLabels[post.status]}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="size-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => router.push(`/posts/view/${post.slug}`)}
                    >
                      <Eye className="w-4 h-4 mr-2" /> View
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleEditClick(post.id, post.title)}
                    >
                      <Pencil className="w-4 h-4 mr-2" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(post.id)}
                      className="text-red-600"
                    >
                      <Trash className="w-4 h-4 mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg mt-2 line-clamp-2">
                {post.title}
              </CardTitle>
              <CardDescription className="line-clamp-2">
                {post.excerpt || "No excerpt"}
              </CardDescription>
            </CardHeader>

            <CardContent className="flex-grow">
              <div className="text-sm text-gray-500">
                <div>Author:{post.author.name || post.author.email}</div>
                <div>
                  UpdatedAt:
                  {formatDistanceToNow(new Date(post.updatedAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Link href={`/view-posts/${post.slug}`} className="w-full">
                <Button variant="outline" className="w-full">
                  View detail
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {postsData.pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={postsData.pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-blue-500" />
              Edit Post
            </DialogTitle>
            <DialogDescription>
              You are about to edit <span className="font-semibold">{postTitleToEdit}</span>. 
              Continue to the edit page?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="default" 
              onClick={handleEditConfirm}
            >
              Continue to Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog - improved version */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{postTitleToEdit}</span>?
              This action cannot be undone and will permanently remove this post.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-4">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteConfirm}
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Post"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
