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
import { MoreHorizontal, Trash2, MessageSquare, RotateCcw } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
    showArchived,
    fetchComments,
    deleteComment,
    bulkDeleteComments,
    restoreComment,
    bulkRestoreComments,
    selectComment,
    clearSelection,
    clearError,
    setShowArchived,
  } = useCommentsStore();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkRestoreDialogOpen, setBulkRestoreDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<number | null>(null);
  const [commentToRestore, setCommentToRestore] = useState<number | null>(null);

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

  const handleRestoreComment = async () => {
    if (commentToRestore) {
      try {
        await restoreComment(commentToRestore);
        toast.success("Comment restored successfully");
        setRestoreDialogOpen(false);
        setCommentToRestore(null);
      } catch (error) {
        console.error("Failed to restore comment:", error);
        toast.error("Failed to restore comment");
      }
    }
  };

  const handleBulkRestore = async () => {
    if (selectedComments.length > 0) {
      try {
        await bulkRestoreComments(selectedComments);
        toast.success(`${selectedComments.length} comment(s) restored successfully`);
        setBulkRestoreDialogOpen(false);
        clearSelection();
      } catch (error) {
        console.error("Failed to restore comments:", error);
        toast.error("Failed to restore comments");
      }
    }
  };

  // Handle search with debounce
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const selectedDeletedComments = comments.filter(c => selectedComments.includes(c.id) && c.deletedAt);
  const selectedActiveComments = comments.filter(c => selectedComments.includes(c.id) && !c.deletedAt);

  // Define base columns that are always visible
  const baseColumns: TableColumn<Comment>[] = [
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
       sortable: true,
      render: (comment) => (
        <Badge variant="outline">
          {comment._count?.ticketComments || 0} ticket{comment._count?.ticketComments !== 1 ? 's' : ''}
        </Badge>
      ),
    },
  ];

  // Created column (shown when NOT in archive mode)
  const createdColumn: TableColumn<Comment> = {
    key: "createdAt",
    label: "Created",
    sortable: true,
    render: (comment) => {
      const date = new Date(comment.createdAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Deleted column (shown when in archive mode)
  const deletedColumn: TableColumn<Comment> = {
    key: "deletedAt",
    label: "Deleted",
    sortable: true,
    render: (comment) => {
      if (!comment.deletedAt) {
        return <div className="text-sm text-muted-foreground">-</div>;
      }
      const date = new Date(comment.deletedAt);
      return (
        <div className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </div>
      );
    },
  };

  // Actions column
  const actionsColumn: TableColumn<Comment> = {
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
          {!comment.deletedAt && (
            <>
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
            </>
          )}
          {comment.deletedAt && (
            <DropdownMenuItem
              onClick={() => {
                setCommentToRestore(comment.id);
                setRestoreDialogOpen(true);
              }}
              className="text-green-600"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restore
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  // Build the final columns array based on showArchived state
  const columns: TableColumn<Comment>[] = [
    ...baseColumns,
    ...(showArchived ? [deletedColumn] : [createdColumn]),
    actionsColumn,
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
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="show-archived"
                checked={showArchived}
                onCheckedChange={setShowArchived}
                className="data-[state=checked]:bg-red-600"
              />
              <Label htmlFor="show-archived" className="text-sm font-medium">
                Archive
              </Label>
            </div>
            {selectedComments.length > 0 && (
              <>
                {selectedActiveComments.length > 0 && (
                  <Button
                    variant="destructive"
                    onClick={() => setBulkDeleteDialogOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedActiveComments.length})
                  </Button>
                )}
                {selectedDeletedComments.length > 0 && (
                  <Button
                    variant="default"
                    onClick={() => setBulkRestoreDialogOpen(true)}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Restore Selected ({selectedDeletedComments.length})
                  </Button>
                )}
              </>
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
              This will archive the comment. You can restore it later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteComment}>
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Single Restore Dialog */}
      <AlertDialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the comment and make it active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRestoreComment}
              className="bg-green-600 hover:bg-green-700"
            >
              Restore
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
            <AlertDialogTitle>
              Archive {selectedActiveComments.length} comments?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will archive the selected comments. You can restore them later from the archived view.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBulkDelete}>
              Archive All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Restore Dialog */}
      <AlertDialog
        open={bulkRestoreDialogOpen}
        onOpenChange={setBulkRestoreDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Restore {selectedDeletedComments.length} comments?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the selected comments and make them active again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkRestore}
              className="bg-green-600 hover:bg-green-700"
            >
              Restore All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
