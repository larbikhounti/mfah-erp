"use client";

import { useState, useEffect } from "react";
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
import { Edit } from "lucide-react";
import {
  useGameTypesStore,
  type GameType,
  type UpdateGameTypePayload,
} from "@/stores/game-types-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditGameTypeDialogProps {
  gameType: GameType;
  trigger?: React.ReactNode;
}

export function EditGameTypeDialog({
  gameType,
  trigger,
}: EditGameTypeDialogProps) {
  const { updateGameType, loading } = useGameTypesStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateGameTypePayload>({
    name: gameType.name,
  });

  // Update form data when gameType prop changes
  useEffect(() => {
    setFormData({
      name: gameType.name,
    });
  }, [gameType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name?.trim()) {
      toast.error("Game type name is required");
      return;
    }

    try {
      await updateGameType(gameType.id, formData);
      toast.success("Game type updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update game type");
    }
  };

  const handleInputChange = (
    field: keyof UpdateGameTypePayload,
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
          <Button variant="ghost" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Game Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter game type name"
              value={formData.name || ""}
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
              {loading ?   <span className="flex items-center">
                               <Loader size={16} />
                                <span className="ml-2">
                                  Updating...
                                </span>
                            </span>: "Update Game Type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
