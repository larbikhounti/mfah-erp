"use client";

import type React from "react";
import { useState } from "react";
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
import { Plus, MessageSquare } from "lucide-react";
import { useCommentsStore, type CreateCommentPayload } from "@/stores/comments-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateCommentDialogProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CreateCommentDialog({
  trigger,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: CreateCommentDialogProps) {
  const { createComment, loading } = useCommentsStore();
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
  const [formData, setFormData] = useState<CreateCommentPayload>({
    content: "",
  });

  // Form errors
  const [errors, setErrors] = useState<{
    content?: string;
  }>({});

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
      await createComment(formData);
      toast.success("Comment created successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to create comment:", error);
      toast.error("Failed to create comment");
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setFormData({ content: "" });
    setErrors({});
    setIsDialogOpen(false);
  };

  // Handle input changes
  const handleInputChange = (field: keyof CreateCommentPayload, value: string) => {
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
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Comment
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Create New Comment
          </DialogTitle>
          <DialogDescription>
            Create a new comment for tickets and customer interactions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Comment Content</Label>
            <Textarea
              id="content"
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
                  <span className="ml-2">Creating...</span>
                </span>
              ) : (
                "Create Comment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
