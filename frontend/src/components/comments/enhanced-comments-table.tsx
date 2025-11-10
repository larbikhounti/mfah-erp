"use client";

import { useState, useEffect } from "react";
import { DataTable, TableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, Trash2, MessageSquare } from "lucide-react";
import { useCommentsStore, type Comment } from "@/stores/comments-store";
import { toast } from "sonner";
import { EditCommentDialog } from "./edit-comment-dialog";
import { CreateCommentDialog } from "./create-comment-dialog";

interface EnhancedCommentsTableProps {}

export function EnhancedCommentsTable({}: EnhancedCommentsTableProps) {
  const {
    comments,
    loading,
    error,
    selectedComments,
    fetchComments,
    deleteComment,
    bulkDeleteComments,
    selectComment,
    clearSelection,
    clearError,
  } = useCommentsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

  // Clear error when component unmounts or when error changes
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Handle individual comment deletion
  const handleDeleteComment = async () => {
    if (commentToDelete) {
      try {
        await deleteComment(commentToDelete);
        toast.success("Comment deleted successfully");
        setDeleteDialogOpen(false);
        setCommentToDelete(null);
      } catch (error) {
        console.error("Failed to delete comment:", error);
        toast.error("Failed to delete comment");
      }
    }
  };

  // Handle bulk deletion
  const handleBulkDelete = async () => {
    if (selectedComments.length > 0) {
      try {
        await bulkDeleteComments(selectedComments);
        toast.success(`${selectedComments.length} comment(s) deleted successfully`);
        setBulkDeleteDialogOpen(false);
        clearSelection();
      } catch (error) {
        console.error("Failed to delete comments:", error);
        toast.error("Failed to delete comments");
      }
    }
  };

  // Handle search with debounce
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Define table columns
  const columns: TableColumn<Comment>[] = [
    {
      key: "select",
      label: "Select",
      render: (comment) => (
        <Checkbox
          checked={selectedComments.includes(comment.id)}
          onCheckedChange={() => selectComment(comment.id)}
          aria-label="Select comment"
        />
      ),
    },
    {
      key: "id",
      label: "ID",
      sortable: true,
      render: (comment) => <div className="font-mono text-sm">{comment.id}</div>,
    },
    {
      key: "content",
      label: "Content",
      sortable: true,
      render: (comment) => (
        <div className="flex items-start gap-2 max-w-md">
          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="font-medium line-clamp-2">{comment.content}</div>
        </div>
      ),
    },
    {
      key: "tickets",
      label: "Tickets",
      render: (comment) => (
        <Badge variant="outline">
          {comment._count?.ticketComments || 0} ticket{comment._count?.ticketComments !== 1 ? 's' : ''}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (comment) => {
        const date = new Date(comment.createdAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      key: "updatedAt",
      label: "Updated",
      render: (comment) => {
        const date = new Date(comment.updatedAt);
        return (
          <div className="text-sm text-muted-foreground">
            {date.toLocaleDateString()}
          </div>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      render: (comment) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <EditCommentDialog comment={comment} />
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setCommentToDelete(comment.id);
                setDeleteDialogOpen(true);
              }}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        title="Comments Management"
        data={comments}
        columns={columns}
        searchKeys={["content"]}
        searchPlaceholder="Search comments by content..."
        emptyMessage="No comments found"
        showCount={true}
        customHeader={
          <div className="flex items-center gap-2">
            {selectedComments.length > 0 && (
              <Button
                variant="destructive"
                onClick={() => setBulkDeleteDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Selected ({selectedComments.length})
              </Button>
            )}
            <CreateCommentDialog />
          </div>
        }
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              comment.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Comment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={setBulkDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Multiple Comments</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedComments.length} comment{selectedComments.length !== 1 ? 's' : ''}?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Comments
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
