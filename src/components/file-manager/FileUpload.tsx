"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Progress } from "@/components/ui/progress";

interface FileUploadProps {
  onUpload: (files: File[]) => Promise<void>;
  maxSize?: number; // in bytes
  acceptedFileTypes?: string[];
  onProgress?: (fileId: string, progress: number) => void;
}

const CHUNK_SIZE = 1024 * 1024; // 1MB chunks

const uploadChunk = async (formData: FormData) => {
  const response = await fetch('/api/upload-chunk', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Failed to upload chunk');
  }
  
  return response.json();
};

const uploadChunked = async (file: File, onProgress: (progress: number) => void) => {
    const chunks = Math.ceil(file.size / CHUNK_SIZE);
    const formData = new FormData();
    const fileId = crypto.randomUUID();
    
    for (let i = 0; i < chunks; i++) {
        const chunk = file.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
        formData.append('chunk', chunk);
        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', chunks.toString());
        formData.append('fileId', fileId);
        
        await uploadChunk(formData);
        onProgress((i + 1) / chunks * 100);
    }
    
    return fileId;
};

export function FileUpload({
  onUpload,
  maxSize = 1024 * 1024 * 50, // 50MB default
  acceptedFileTypes = [
    "image/*", 
    "application/pdf",
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg"
  ],
  onProgress,
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  // const [isDragging, setIsDragging] = useState(false); TBD

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      try {
        setUploadProgress(0);
        
        for (const file of acceptedFiles) {
          await uploadChunked(file, (progress) => {
            setUploadProgress(progress);
            if (onProgress) {
              onProgress(crypto.randomUUID(), progress);
            }
          });
        }
        
        await onUpload(acceptedFiles);
        setUploadProgress(100);
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadProgress(0);
      }
    },
    [onUpload, onProgress]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedFileTypes.reduce(
      (acc, curr) => ({ ...acc, [curr]: [] }),
      {}
    ),
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
        ${isDragActive ? "border-primary bg-secondary/50" : "border-gray-300"}`}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <div className="text-sm">点击此处选择文件上传</div>
        {uploadProgress > 0 && (
          <Progress value={uploadProgress} className="w-full" />
        )}
      </div>
    </div>
  );
}
