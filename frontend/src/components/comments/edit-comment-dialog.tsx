"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit, MessageSquare } from "lucide-react";
import { useCommentsStore, type Comment, type UpdateCommentPayload } from "@/stores/comments-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditCommentDialogProps {
  comment: Comment;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function EditCommentDialog({
  comment,
  trigger,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: EditCommentDialogProps) {
  const { updateComment, loading } = useCommentsStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isDialogOpen =
    externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsDialogOpen =
    externalOnClose !== undefined
      ? (open: boolean) => {
          if (!open) externalOnClose();
        }
      : setInternalIsOpen;

  // Form state
  const [formData, setFormData] = useState<UpdateCommentPayload>({
    content: comment.content,
  });

  // Form errors
  const [errors, setErrors] = useState<{
    content?: string;
  }>({});

  // Update form data when comment prop changes
  useEffect(() => {
    setFormData({
      content: comment.content,
    });
    setErrors({});
  }, [comment]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.content?.trim()) {
      newErrors.content = "Comment content is required";
    } else if (formData.content.length < 3) {
      newErrors.content = "Comment must be at least 3 characters";
    } else if (formData.content.length > 1000) {
      newErrors.content = "Comment must be less than 1000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateComment(comment.id, formData);
      toast.success("Comment updated successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment");
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setFormData({ content: comment.content });
    setErrors({});
    setIsDialogOpen(false);
  };

  // Handle input changes
  const handleInputChange = (field: keyof UpdateCommentPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <div className="flex items-center w-full">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Edit Comment
          </DialogTitle>
          <DialogDescription>
            Update the comment content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-content">Comment Content</Label>
            <Textarea
              id="edit-content"
              placeholder="Enter comment content..."
              value={formData.content}
              onChange={(e) => handleInputChange("content", e.target.value)}
              className={errors.content ? "border-destructive" : ""}
              rows={5}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Comment ID:</span>
                <span className="font-mono">{comment.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Linked Tickets:</span>
                <span>{comment._count?.ticketComments || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <Loader size={16} />
                  <span className="ml-2">Updating...</span>
                </span>
              ) : (
                "Update Comment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
