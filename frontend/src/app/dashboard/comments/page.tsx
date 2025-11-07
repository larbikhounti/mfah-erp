"use client";

import { useEffect } from "react";
import { useCommentsStore } from "@/stores/comments-store";
import { EnhancedCommentsTable } from "@/components/comments/enhanced-comments-table";

export default function CommentsPage() {
  const { fetchComments } = useCommentsStore();

  // Fetch comments on component mount
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Comments Management</h1>
          <p className="text-muted-foreground">
            Manage comments for tickets and customer interactions
          </p>
        </div>
      </div>

      <EnhancedCommentsTable />
    </section>
  );
}
