import { getPostBySlug } from "@/actions/admin/postActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Calendar, Pencil, User } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/session/manager";
import ContentDisplay from "@/components/editor/content-dispay"


interface PostDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {

  // Check for session first
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }

  // Await params before accessing properties
  const resolvedParams = await params;
  const post = await getPostBySlug(resolvedParams.slug);

  // Handle not found
  if (!post) {
    notFound();
  }

  // Status badge styles
  const statusStyles = {
    DRAFT: "bg-yellow-100 text-yellow-800 border-yellow-200",
    PUBLISHED: "bg-green-100 text-green-800 border-green-200",
    ARCHIVED: "bg-gray-100 text-gray-800 border-gray-200",
  };

  // Status labels
  const statusLabels = {
    DRAFT: "Draft",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/posts/view">
          <Button variant="ghost" className="flex items-center gap-2 mb-4">
            <ArrowLeft size={16} /> back
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className={statusStyles[post.status]}>
              {statusLabels[post.status]}
            </Badge>
            
          </div>
          <Link href={`/posts/edit/${post.id}`}>
            <Button size="sm"  className="flex items-center gap-2">
              <Pencil size={14} /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {post.featuredImage && (
          <div className="relative h-[300px] w-full">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 85vw, 75vw"
              className="object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <h1 className="text-3xl font-bold mb-4">{post.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-1">
              <User size={14} />
              <span>{post.author?.name || "Unknown author"}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>
                {post.publishedAt
                  ? `Published: ${format(new Date(post.publishedAt), "MMMM d, yyyy")}`
                  : `Created: ${format(new Date(post.createdAt), "MMMM d, yyyy")}`}
              </span>
            </div>
            {post.updatedAt > post.createdAt && (
              <div className="flex items-center gap-1">
                <span>
                  Updated: {format(new Date(post.updatedAt), "MMMM d, yyyy")}
                </span>
              </div>
            )}
          </div>

          {post.excerpt && (
            <div className="mb-6 italic border-l-4 border-gray-200 pl-4 py-2 text-gray-700">
              {post.excerpt}
            </div>
          )}

          <ContentDisplay content={post.content} />

          {post.category && (
            <div className="mt-8 pt-4 border-t">
              <span className="text-sm text-gray-500 mr-2">Category:</span>
              <Badge variant="secondary">{post.category.name}</Badge>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}