"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageUploadButton from "@/components/UploadImage";

interface ImageUploadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImageUpload: (url: string) => void;
}

export default function ImageUploadDialog({
  isOpen,
  onClose,
  onImageUpload,
}: ImageUploadDialogProps) {
  const [imageUrl, setImageUrl] = useState("");

  const handleImageUpload = (url: string) => {
    setImageUrl(url);
  };

  const handleSubmit = () => {
    if (imageUrl) {
      onImageUpload(imageUrl);
      onClose();
      setImageUrl("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="url">Source</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="pt-4">
            <ImageUploadButton onImageUpload={handleImageUpload} />
          </TabsContent>

          <TabsContent value="url" className="pt-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
               Please add your image URL here (JPG、PNG、GIF)
              </p>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!imageUrl}>
           Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
