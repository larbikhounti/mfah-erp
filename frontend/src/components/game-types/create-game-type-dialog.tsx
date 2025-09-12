"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";
import {
  useGameTypesStore,
  type CreateGameTypePayload,
} from "@/stores/game-types-store";
import { toast } from "sonner";

interface CreateGameTypeDialogProps {
  trigger?: React.ReactNode;
}

export function CreateGameTypeDialog({ trigger }: CreateGameTypeDialogProps) {
  const { createGameType, loading } = useGameTypesStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateGameTypePayload>({
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Game type name is required");
      return;
    }

    try {
      await createGameType(formData);
      toast.success("Game type created successfully");
      setOpen(false);
      // Reset form
      setFormData({
        name: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create game type");
    }
  };

  const handleInputChange = (
    field: keyof CreateGameTypePayload,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Game Type
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Game Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter game type name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Game Type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
