import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import EditPostForm from "@/components/dashboard/forms/EditPostForm";
import { getSession } from "@/lib/session/manager";


interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function EditPostPage({ 
  params,
  searchParams 
}: EditPostPageProps) {
  // Check for session first
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Await params before accessing its properties
  const { id } = await params;
  
  // Get post data for editing
  const post = await prisma.post.findUnique({
    where: {
      id: id,
    },
  });

  // Return 404 if post not found  
  if (!post) {
    notFound();
  }

  // Check if user is authorized to edit this post
  if (post.authorId !== session.userId && session.role !== "ADMIN") {
    // Redirect to view posts if user can't edit this post
    redirect("/posts/view");
  }

  return (
    <div>
       {/* add edit form */}
 <EditPostForm post={post} />
  </div>
   
  );
}