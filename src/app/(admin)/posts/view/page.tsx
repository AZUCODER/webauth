// This is a server component

import { getPosts } from "@/actions/admin/postActions";
import { PostTableView } from "@/components/dashboard/tables/PostTableView";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

export default async function ViewPostsPage() {
  const result = await getPosts();

  // Extract posts from the result or provide an empty array if null
  const posts = result?.posts || [];

  return (
    <div className="container mx-auto py-10">
      <h2 className="text-xl font-bold">Posts View</h2>
      <p className="text-accent-foreground/60">
        This is the view for all posts. You can add, edit, and delete posts
        here.
      </p>
      <div className="flex justify-end items-center mt-2 gap-2">
        <Link href="/posts/add">
          <Button variant="outline" size="sm">
            <PlusCircle /> Add Post
          </Button>
        </Link>
      </div>
      <PostTableView data={posts} />
    </div>
  );
}
