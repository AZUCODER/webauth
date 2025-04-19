"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import {
  IconArrowLeft,
  IconUser,
  IconClockHour4,
  IconActivity,
  IconFolder,
  IconLink,
  IconDeviceDesktop,
  IconMap,
  IconFile,
} from "@tabler/icons-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface AuditLogDetailProps {
  auditLog: {
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
      role: string;
    };
  };
}

export function AuditLogDetail({ auditLog }: AuditLogDetailProps) {
  // Parse metadata if it exists
  let metadata: any = null;
  try {
    if (auditLog.metadata) {
      metadata = JSON.parse(auditLog.metadata);
    }
  } catch (error) {
    console.error("Failed to parse metadata:", error);
  }

  // Format the user agent for better readability
  const formatUserAgent = (userAgent: string | null) => {
    if (!userAgent) return "Unknown";
    
    // Try to extract browser and OS info
    const browserMatches = userAgent.match(/(Chrome|Safari|Firefox|Edge|MSIE|Trident)[\/\s](\d+\.\d+)/);
    const osMatches = userAgent.match(/(Windows NT|Mac OS X|Linux|Android|iOS)[\s\/]?([\d\._]+)?/);
    
    const browser = browserMatches ? browserMatches[0] : "Unknown browser";
    const os = osMatches ? osMatches[0] : "Unknown OS";
    
    return `${browser} on ${os}`;
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link href="/audit-logs" className="flex items-center gap-1">
            <IconArrowLeft className="h-4 w-4" />
            Back to audit logs
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <IconClockHour4 className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
                  <p className="font-mono">
                    {format(new Date(auditLog.createdAt), "yyyy-MM-dd HH:mm:ss")}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <IconUser className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">User</h3>
                  <p className="font-medium">{auditLog.user.name || "Unknown"}</p>
                  <p className="text-sm text-gray-500">{auditLog.user.email}</p>
                  <Badge variant="secondary" className="mt-1">
                    {auditLog.user.role}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <IconActivity className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Action</h3>
                  <Badge
                    variant="outline"
                    className={getActionBadgeColor(auditLog.action)}
                  >
                    {auditLog.action}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-3">
                <IconFolder className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">Resource</h3>
                  {auditLog.resource ? (
                    <>
                      <p className="font-medium">{auditLog.resource}</p>
                      {auditLog.resourceId && (
                        <div className="flex items-center mt-1">
                          <IconLink className="h-4 w-4 text-gray-500 mr-1" />
                          <span className="text-sm text-gray-500 break-all">
                            {auditLog.resourceId}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-gray-500">Not specified</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <IconMap className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">IP Address</h3>
                  <p className="font-mono">
                    {auditLog.ipAddress || "Not recorded"}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <IconDeviceDesktop className="h-5 w-5 text-gray-500 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-gray-500">User Agent</h3>
                  <p className="text-sm break-words">
                    {auditLog.userAgent
                      ? formatUserAgent(auditLog.userAgent)
                      : "Not recorded"}
                  </p>
                  {auditLog.userAgent && (
                    <details className="mt-2">
                      <summary className="text-xs text-gray-500 cursor-pointer">
                        Show full user agent
                      </summary>
                      <p className="text-xs mt-1 font-mono break-all bg-gray-50 p-2 rounded">
                        {auditLog.userAgent}
                      </p>
                    </details>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {metadata && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Metadata</CardTitle>
            <IconFile className="h-5 w-5 text-gray-500" />
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px] rounded-md border p-4">
              <pre className="text-sm">{JSON.stringify(metadata, null, 2)}</pre>
              <ScrollBar orientation="vertical" />
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 