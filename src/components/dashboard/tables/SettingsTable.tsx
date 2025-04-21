"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  IconSearch, 
  IconChevronLeft, 
  IconChevronRight,
  IconCategory,
  IconEdit,
  IconTrash
} from "@tabler/icons-react";

interface Setting {
  id: string;
  key: string;
  value: string;
  category: string;
  description: string | null;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface SettingsTableProps {
  settings: Setting[];
  categories: string[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  initialFilters?: {
    search: string;
    category: string;
  };
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  onEdit?: (setting: Setting) => void;
  onDelete?: (id: string) => void;
}

export function SettingsTable({
  settings,
  categories,
  pagination,
  initialFilters,
  onPageChange,
  onFilterChange,
  onEdit,
  onDelete,
}: SettingsTableProps) {
  const [filters, setFilters] = useState({
    category: initialFilters?.category || "",
    search: initialFilters?.search || "",
  });

  useEffect(() => {
    // Initialize select components with "all" for empty values
    setFilters(prev => ({
      ...prev,
      category: prev.category || "all"
    }));
    
    // If we have initial filters, trigger the filter change handler
    if (initialFilters && (initialFilters.search || initialFilters.category)) {
      onFilterChange?.({
        search: initialFilters.search,
        category: initialFilters.category === "all" ? "" : initialFilters.category
      });
    }
  }, [initialFilters, onFilterChange]);

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" value to empty string for filtering
    const filterValue = value === "all" ? "" : value;
    
    const newFilters = { ...filters, [key]: filterValue };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  // Function to truncate long values for display
  const truncateValue = (value: string, maxLength = 50) => {
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center space-x-2">
                <IconSearch className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search settings..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center space-x-2">
                <IconCategory className="h-4 w-4 text-gray-500" />
                <Select
                  value={filters.category}
                  onValueChange={(value) => handleFilterChange("category", value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Public</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {settings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No settings found
                </TableCell>
              </TableRow>
            ) : (
              settings.map((setting) => (
                <TableRow key={setting.id}>
                  <TableCell className="font-medium">
                    {setting.key}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={setting.value}>
                      {truncateValue(setting.value)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100">
                      {setting.category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[200px] truncate" title={setting.description || ''}>
                      {setting.description ? truncateValue(setting.description) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={setting.isPublic} 
                      disabled
                      className="pointer-events-none"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(setting)}
                      >
                        <IconEdit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete?.(setting.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <IconTrash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {settings.length} of {pagination.totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            <IconChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange?.(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            Next
            <IconChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 