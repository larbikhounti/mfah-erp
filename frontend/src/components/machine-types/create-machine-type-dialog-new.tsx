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
  useMachineTypesStore,
  type CreateMachineTypePayload,
} from "@/stores/machine-types-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateMachineTypeDialogProps {
  trigger?: React.ReactNode;
}

export function CreateMachineTypeDialog({
  trigger,
}: CreateMachineTypeDialogProps) {
  const { createMachineType, loading } = useMachineTypesStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateMachineTypePayload>({
    name: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Machine type name is required");
      return;
    }

    try {
      await createMachineType(formData);
      toast.success("Machine type created successfully");
      setOpen(false);
      // Reset form
      setFormData({
        name: "",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create machine type");
    }
  };

  const handleInputChange = (
    field: keyof CreateMachineTypePayload,
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
            Create Machine Type
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Machine Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter machine type name"
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
              {loading ?   <span className="flex items-center">
                               <Loader size={16} />
                                <span className="ml-2">Creating...</span>
                            </span>: "Create Machine Type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
