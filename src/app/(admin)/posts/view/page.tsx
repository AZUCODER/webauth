// This is a server component

import { getPosts } from "@/actions/admin/postActions";
import { PostTableView } from "../../../../components/dashboard/tables/PostTableView";

import Link from "next/link";
import { Button } from "@/components/ui/button";



export default async function ViewPostsPage() {
  const result = await getPosts();
  
  // Extract posts from the result or provide an empty array if null
  const posts = result?.posts || [];

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-start items-center mt-2 gap-2">
        <Link
          href="/posts/add"
        >
          <Button size="lg">Add Post</Button>
        </Link>
         <Link
          href="/post-categories/add"
        >
          <Button size="lg" variant="secondary">Add Post Category</Button>
        </Link>
      </div>
      <PostTableView data={posts} />
    </div>
  );
} 