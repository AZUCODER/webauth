"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Download,
  Trash2,
  FileIcon,
  FileText,
  Video,
  Music,
  ImagePlus,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";


interface FileInfo {
  id: string;
  fileName: string;
  originalName: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
  url: string;
}

interface FileDownloadProps {
  files: FileInfo[];
  onDownload: (fileId: string) => Promise<void>;
  onDelete?: (fileId: string) => Promise<void>;
}

export function FileDownload({
  files,
  onDownload,
  onDelete,
}: FileDownloadProps) {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const handleDownload = async (fileId: string) => {
    try {
      setDownloading(fileId);
      await onDownload(fileId);
    } finally {
      setDownloading(null);
    }
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      toast.success("文件URL已复制到剪贴板！");
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (error) {
      toast.error("URL复制失败！");
      console.error("Copy failed:", error);
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>资料名称</TableHead>
            <TableHead>文件大小</TableHead>
            <TableHead>文件类型</TableHead>
            <TableHead>上传日期</TableHead>
            <TableHead>文件预览</TableHead>
            <TableHead>文件操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.originalName}</TableCell>
              <TableCell>{formatFileSize(file.size)}</TableCell>
              <TableCell>{file.mimeType}</TableCell>
              <TableCell>
                {formatDate(file.uploadedAt)}
              </TableCell>
              <TableCell>
                <FilePreview file={file} />
              </TableCell>
              <TableCell className="space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(file.id)}
                  disabled={downloading === file.id}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyUrl(file.url)}
                  disabled={copiedUrl === file.url}
                >
                  {copiedUrl === file.url ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onDelete(file.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

function formatDate(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

const FilePreview = ({ file }: { file: FileInfo }) => {
  if (file.mimeType.startsWith('image/')) {
    return (
      <div className="relative">
        <Image
          src={file.url}
          alt={file.originalName}
          className="w-10 h-10 object-cover rounded"
          width={40}
          height={40}
        />
        <ImagePlus className="absolute bottom-0 right-0 w-3 h-3 text-white bg-black/50 rounded-full p-0.5" />
      </div>
    );
  }
  
  if (file.mimeType === 'application/pdf') {
    return <FileText className="w-10 h-10 text-red-500" />;
  }
  
  if (file.mimeType.startsWith('video/')) {
    return <Video className="w-10 h-10 text-blue-500" />;
  }
  
  if (file.mimeType.startsWith('audio/')) {
    return <Music className="w-10 h-10 text-purple-500" />;
  }
  
  return <FileIcon className="w-10 h-10 text-gray-500" />;
};
