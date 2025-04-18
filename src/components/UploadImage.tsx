import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImageUp } from "lucide-react";
import { uploadImgToCloud } from "@/utils/oss/UploadImage";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";

// Add proper typing for the component props
interface ImageUploadButtonProps {
  onImageUpload?: (url: string) => void;
}

const ImageUploadButton = ({ onImageUpload }: ImageUploadButtonProps) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append("file", file);

      setUploading(true);
      try {
        const result = await uploadImgToCloud(formData);
        setImageUrl(result.url);

        // Call the callback if provided
        if (onImageUpload) {
          onImageUpload(result.url);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      } finally {
        setUploading(false);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });

  return (
    <div className="flex flex-col items-start gap-4">
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center border-2 text-center border-dashed rounded-md w-54 h-24 cursor-pointer transition-colors ${
          isDragActive ? "border-gray-500" : "border-gray-300"
        }`}
      >
        <Input {...getInputProps()} />
        <ImageUp className="text-gray-400 font-light" size={48} />
        {isDragActive ? (
          <p className="mt-2 text-gray-600 text-xs">Pleae drag the file here...</p>
        ) : (
          <p className="mt-2 text-gray-600 text-xs">
            Click to select your image
          </p>
        )}
      </div>
      {uploading && (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
      )}
      {imageUrl && (
        <div className="flex flex-col text-center items-start py-2 text-xs">
          <Link
            href={imageUrl}
            target="_blank"
            className="text-slate-500"
          ></Link>
          <Image
            src={imageUrl}
            alt="Uploaded"
            className="mt-4 max-w-full h-auto"
            width={450}
            height={450}
          />
          <p className="text-xs font-light py-2 text-red-400">Image uploaded into AliOSS successfully!</p>
        </div>
      )}
    </div>
  );
};

export default ImageUploadButton;
