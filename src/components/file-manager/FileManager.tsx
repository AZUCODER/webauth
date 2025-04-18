"use client";

import { useState, useCallback } from "react";
import { FileUpload } from "./FileUpload";
import { FileDownload } from "./FileDownload";
import { uploadFile, deleteFile } from "@/actions/fileActions";
import { toast } from "sonner";
import type { FileInfo, FileManagerState, FileWithPreview } from "@/types/file";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { PaginationRoot } from "@/components/ui/pagination";

// Define MAX_FILE_SIZE constant
const MAX_FILE_SIZE = 1024 * 1024 * 50; // 10MB

interface FileManagerProps {
  initialFiles: FileInfo[];
}


interface UploadResponse {
  success: boolean;
  data?: FileInfo;
  error?: string;
}

export function FileManager({ initialFiles = [] }: FileManagerProps) {
  const [state, setState] = useState<FileManagerState>({
    files: initialFiles,
    sortBy: 'date',
    sortOrder: 'desc',
    search: '',
    page: 1,
    perPage: 10
  });

  const filteredAndSortedFiles = useCallback(() => {
    return state.files
      .filter(file => 
        file.originalName.toLowerCase().includes(state.search.toLowerCase())
      )
      .sort((a, b) => {
        const order = state.sortOrder === 'asc' ? 1 : -1;
        switch(state.sortBy) {
          case 'name':
            return order * a.originalName.localeCompare(b.originalName);
          case 'size':
            return order * (a.size - b.size);
          default:
            return order * (new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime());
        }
      });
  }, [state]);

  const paginatedFiles = useCallback(() => {
    const start = (state.page - 1) * state.perPage;
    return filteredAndSortedFiles().slice(start, start + state.perPage);
  }, [state, filteredAndSortedFiles]);

  const handleUpload = async (files: File[]) => {
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadFile(formData) as UploadResponse;
        
        if (result.success && result.data) {
          setState(s => ({
            ...s,
            files: [...s.files, { ...result.data, progress: 100 } as FileWithPreview]
          }));
          toast.success("文件上传成功！");
        } else {
          toast.error(result.error || "文件上传失败，请重新上传！");
          console.error("Upload failed:", result.error);
        }
      }
    } catch (error) {
      toast.error("文件上传失败，请稍后再试！");
      console.error(error);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteFile(fileId);
      setState(s => ({
        ...s,
        files: s.files.filter((f) => f.id !== fileId)
      }));
      toast.success("文件已删除！");
    } catch (error) {
      toast.error("文件删除失败，请稍后再试！");
      console.error(error);
    }
  };

  const handleDownload = async (fileId: string) => {
    const file = state.files.find((f) => f.id === fileId);
    if (!file) return;

    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("文件下载失败！");
      console.error(error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input 
          placeholder="搜索文件..."
          value={state.search}
          onChange={(e) => setState(s => ({ ...s, search: e.target.value }))}
        />
        <Select
          value={state.sortBy}
          onValueChange={(value) => setState(s => ({ ...s, sortBy: value as 'name' | 'date' | 'size' }))}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date">日期</SelectItem>
            <SelectItem value="name">名称</SelectItem>
            <SelectItem value="size">大小</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <FileUpload 
        onUpload={handleUpload}
        maxSize={MAX_FILE_SIZE}
        onProgress={(fileId: string, progress: number) => {
          setState(s => ({
            ...s,
            files: s.files.map(f => 
              f.id === fileId ? { ...f, progress } : f
            )
          }));
        }}
      />
      
      <FileDownload
        files={paginatedFiles()}
        onDownload={handleDownload}
        onDelete={handleDelete}
      />
      
      <PaginationRoot
        total={filteredAndSortedFiles().length}
        perPage={state.perPage}
        currentPage={state.page}
        onPageChange={(page: number) => setState(s => ({ ...s, page }))}
      />
    </div>
  );
}
