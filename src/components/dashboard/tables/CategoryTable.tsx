"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteCategory } from "@/actions/admin/postCateActions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pagination } from "@/components/custom-pagination";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    posts: number;
  };
};

type PaginationInfo = {
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
};

export default function CategoryTable({
  categories,
  pagination,
}: {
  categories: Category[];
  pagination: PaginationInfo;
}) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const confirmDelete = (category: Category) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
    setDeleteError("");
  };

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError("");
      
      const result = await deleteCategory(categoryToDelete.id);
      
      if (result.success) {
        toast.success("Category deleted!");
        setIsDeleteDialogOpen(false);
        router.refresh();
      } else {
        setDeleteError(result.error || "Failed to delete");
      }
    } catch (error) {
      setDeleteError("Internal error, please try again later");
      console.error("Delete error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader className='bg-gray-100'>
          <TableRow>
            <TableHead>CateName</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>RelatedPosts</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>CreatedAt</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-gray-500">
               No category data
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>
                  {category.description ? (
                    <span className="line-clamp-2">{category.description}</span>
                  ) : (
                    <span className="text-gray-400 italic">no description</span>
                  )}
                </TableCell>
                <TableCell>{category._count.posts}</TableCell>
                <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                <TableCell>
                  {new Date(category.createdAt).toISOString().split('T')[0].replace(/-/g, '/')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/post-categories/edit/${category.id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => confirmDelete(category)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={(page: number) =>
              router.push(`/post-categories/view?page=${page}&limit=${pagination.limit}`)
            }
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure to delete <span className="font-semibold">{categoryToDelete?.name}</span>?
            </DialogDescription>
          </DialogHeader>
          
          {categoryToDelete && categoryToDelete._count.posts > 0 && (
            <div className="text-red-500 mt-2 text-sm">
              Warning: This post category has {categoryToDelete._count.posts} posts. Please delete related posts first!
            </div>
          )}
          
          {deleteError && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mt-2">
              {deleteError}
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-end gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 