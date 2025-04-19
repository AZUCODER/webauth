"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Eye, Pencil, Trash, MoreHorizontal, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { deletePost } from "@/actions/admin/postActions";
import { Post } from "@prisma/client";
import { CustomDialog } from "@/components/dashboard/custom-dialog";

interface PostActionCellProps {
  post: Post;
}

export function PostActionCell({ post }: PostActionCellProps) {
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePost(post.id);
      if (result.success) {
        toast.success("Post deleted successfully!");
        window.location.reload();
      } else {
        toast.error(result.error || "Something went wrong during deleting the post");
      }
    } catch (error) {
      toast.error("Internal error during deletion");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/posts/view/${post.slug}`}>
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/posts/edit/${post.id}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDeleteClick}
            className="text-red-600"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Deleting...
              </>
            ) : (
              <>
                <Trash className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CustomDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Confirm Deletion"
        description={
          <>
            Are you sure you want to delete <span className="font-semibold">{post.title}</span>?
            This action cannot be undone and will permanently remove this post.
          </>
        }
        icon={AlertTriangle}
        iconColor="text-red-500"
        confirmText="Delete Post"
        cancelText="Cancel"
        onConfirm={handleDelete}
        isLoading={isDeleting}
        confirmVariant="destructive"
      />
    </>
  );
}
