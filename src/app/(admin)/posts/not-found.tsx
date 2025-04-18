import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileWarning } from "lucide-react";

export default function PostNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border border-red-100">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
            <FileWarning className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            内容未找到
          </h2>

          <p className="text-gray-600 mt-1">
            您要查看的内容不存在或已被删除。
          </p>

          <div className="flex gap-4 mt-6">
            <Link href="/posts/view">
              <Button variant="default">
                返回列表
              </Button>
            </Link>

            <Link href="/posts/add">
              <Button variant="outline">
                创建内容
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 