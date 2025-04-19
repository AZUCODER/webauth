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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { 
  IconSearch, 
  IconFilter, 
  IconChevronLeft, 
  IconChevronRight,
  IconClockHour4,
  IconUser,
  IconActivity,
  IconFolder
} from "@tabler/icons-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: string | null;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
  };
}

interface AuditLogTableProps {
  auditLogs: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  onPageChange?: (page: number) => void;
  onFilterChange?: (filters: any) => void;
}

export function AuditLogTable({
  auditLogs,
  pagination,
  onPageChange,
  onFilterChange,
}: AuditLogTableProps) {
  const [filters, setFilters] = useState({
    action: "",
    resource: "",
    search: "",
  });

  useEffect(() => {
    // Initialize select components with "all" for empty values
    setFilters(prev => ({
      ...prev,
      action: prev.action || "all",
      resource: prev.resource || "all"
    }));
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    // Convert "all" value to empty string for filtering
    const filterValue = value === "all" ? "" : value;
    
    const newFilters = { ...filters, [key]: filterValue };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800 border-green-200";
      case "update":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "delete":
        return "bg-red-100 text-red-800 border-red-200";
      case "view":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "login":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "logout":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        if (action.includes("permission")) {
          return "bg-indigo-100 text-indigo-800 border-indigo-200";
        } else if (action.includes("role")) {
          return "bg-pink-100 text-pink-800 border-pink-200";
        }
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center space-x-2">
                <IconSearch className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search user, resource ID..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center space-x-2">
                <IconActivity className="h-4 w-4 text-gray-500" />
                <Select
                  value={filters.action}
                  onValueChange={(value) => handleFilterChange("action", value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="create">Create</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="delete">Delete</SelectItem>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="login">Login</SelectItem>
                    <SelectItem value="logout">Logout</SelectItem>
                    <SelectItem value="permission:grant">Permission Grant</SelectItem>
                    <SelectItem value="permission:revoke">Permission Revoke</SelectItem>
                    <SelectItem value="role:update">Role Update</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center space-x-2">
                <IconFolder className="h-4 w-4 text-gray-500" />
                <Select
                  value={filters.resource}
                  onValueChange={(value) => handleFilterChange("resource", value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Resource" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Resources</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="post">Post</SelectItem>
                    <SelectItem value="post-category">Post Category</SelectItem>
                    <SelectItem value="permission">Permission</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
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
              <TableHead className="w-[180px]">Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {auditLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No audit logs found
                </TableCell>
              </TableRow>
            ) : (
              auditLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono whitespace-nowrap">
                    <div className="flex items-center">
                      <IconClockHour4 className="h-4 w-4 mr-2 text-gray-500" />
                      {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <IconUser className="h-4 w-4 mr-2 text-gray-500" />
                      <div>
                        <div className="font-medium">{log.user.name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{log.user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getActionBadgeColor(log.action)}
                    >
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {log.resource ? (
                      <div>
                        <div className="font-medium">{log.resource}</div>
                        {log.resourceId && (
                          <div className="text-sm text-gray-500 truncate max-w-[150px]">
                            ID: {log.resourceId}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>{log.ipAddress || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      asChild
                    >
                      <Link href={`/audit-logs/${log.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {auditLogs.length} of {pagination.totalItems} results
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