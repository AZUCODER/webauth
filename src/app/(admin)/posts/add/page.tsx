import React from 'react';

import { getSession } from "@/lib/session/manager";
import { redirect } from "next/navigation";
import AddPostForm from '@/components/dashboard/forms/AddPostForm';

export default async function AddPost() {
  // Check for session first
  const session = await getSession();
  if (!session) {
    redirect("/login");
  };

  return (
      <AddPostForm />
  )
}
