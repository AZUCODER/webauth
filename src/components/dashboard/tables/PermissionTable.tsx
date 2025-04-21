'use client'

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash, 
  PlusCircle, 
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { deletePermission } from '@/actions/admin/permissionActions';
import { toast } from 'sonner';
import { PermissionData } from '@/types/permission';

interface PaginationData {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

interface FilterData {
  search: string;
  resource: string;
}

interface PermissionTableProps {
  permissions: PermissionData[];
  pagination?: PaginationData;
  initialFilters?: FilterData;
}

export function PermissionTable({ 
  permissions, 
  pagination = { currentPage: 1, pageSize: 10, totalItems: 0, totalPages: 1 },
  initialFilters = { search: '', resource: '' }
}: PermissionTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [resourceFilter, setResourceFilter] = useState(initialFilters.resource);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  
  // Get unique resources for filtering
  const resources = [...new Set(permissions.map(permission => permission.resource))];
  
  // Create a URL with updated search params
  const createQueryString = (params: Record<string, string | number | undefined>) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.set(key, String(value));
      }
    });
    
    return queryParams.toString();
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    router.push(`${pathname}?${createQueryString({ 
      page, 
      pageSize: pagination.pageSize,
      search: searchTerm,
      resource: resourceFilter
    })}`);
  };

  // Handle page size change
  const handlePageSizeChange = (size: number) => {
    router.push(`${pathname}?${createQueryString({ 
      page: 1, // Reset to page 1 when changing page size
      pageSize: size,
      search: searchTerm,
      resource: resourceFilter
    })}`);
  };
  
  // Handle search
  const handleSearch = () => {
    setIsSearching(true);
    router.push(`${pathname}?${createQueryString({ 
      page: 1, // Reset to page 1 when searching
      pageSize: pagination.pageSize,
      search: searchTerm,
      resource: resourceFilter
    })}`);
  };

  // Handle resource filter change
  const handleResourceFilterChange = (resource: string) => {
    setResourceFilter(resource);
    router.push(`${pathname}?${createQueryString({ 
      page: 1, // Reset to page 1 when filtering
      pageSize: pagination.pageSize,
      search: searchTerm,
      resource
    })}`);
  };

  const handleEditPermission = (id: string) => {
    router.push(`/permissions/edit/${id}`);
  };

  const confirmDeletePermission = (id: string) => {
    setPermissionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeletePermission = async () => {
    if (!permissionToDelete) return;
    
    const result = await deletePermission(permissionToDelete);
    if (result.success) {
      toast.success('Permission deleted successfully');
      router.refresh();
    } else {
      toast.error(result.error || 'Failed to delete permission');
    }
    
    setDeleteDialogOpen(false);
    setPermissionToDelete(null);
  };

  // Reset isSearching state after search completes
  useEffect(() => {
    if (isSearching) {
      const timer = setTimeout(() => {
        setIsSearching(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isSearching]);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="flex gap-2">
          <div className="relative">
            <Input
              placeholder="Search permissions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pr-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-full"
              onClick={handleSearch}
              disabled={isSearching}
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <select
            value={resourceFilter}
            onChange={(e) => handleResourceFilterChange(e.target.value)}
            className="h-10 rounded-md border border-input bg-background px-3 py-2"
          >
            <option value="">All Resources</option>
            {resources.map(resource => (
              <option key={resource} value={resource}>{resource}</option>
            ))}
          </select>
        </div>
        <Button variant="outline" onClick={() => router.push('/permissions/create')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Permission
        </Button>
      </div>
      
      <div className="rounded-sm border">
        <Table>
          <TableHeader className='bg-gray-100'>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {permissions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No permissions found.
                </TableCell>
              </TableRow>
            ) : (
              permissions.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className="font-medium">{permission.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-blue-100 text-blue-800">
                      {permission.resource}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      {permission.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {permission.description || '-'}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(permission.createdAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell>
                    {formatDistanceToNow(new Date(permission.updatedAt), { addSuffix: true })}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditPermission(permission.id)}>
                          <Pencil className="w-4 h-4 mr-2" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => confirmDeletePermission(permission.id)}
                        >
                          <Trash className="w-4 h-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{" "}
          <span className="font-medium">{Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}</span> of{" "}
          <span className="font-medium">{pagination.totalItems}</span> results
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <label htmlFor="items-per-page" className="text-sm font-medium">
              Items per page:
            </label>
            <select
              id="items-per-page"
              value={pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="h-8 w-16 rounded-md border border-input bg-transparent px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
          <nav className="flex items-center space-x-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(1)}
              disabled={pagination.currentPage === 1}
              title="First page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              title="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Logic to show pages around current page
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (pagination.currentPage >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }
                
                return (
                  pageNum > 0 && pageNum <= pagination.totalPages && (
                    <Button
                      key={pageNum}
                      variant={pagination.currentPage === pageNum ? "default" : "outline"}
                      size="icon"
                      onClick={() => handlePageChange(pageNum)}
                      className="w-8 h-8"
                    >
                      {pageNum}
                    </Button>
                  )
                );
              })}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              title="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handlePageChange(pagination.totalPages)}
              disabled={pagination.currentPage === pagination.totalPages}
              title="Last page"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </nav>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the permission
              and remove it from all roles and users.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePermission}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 