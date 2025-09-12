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
  useMachineTypesStore,
  type MachineType,
  type UpdateMachineTypePayload,
} from "@/stores/machine-types-store";
import { toast } from "sonner";

interface EditMachineTypeDialogProps {
  machineType: MachineType;
  trigger?: React.ReactNode;
}

export function EditMachineTypeDialog({
  machineType,
  trigger,
}: EditMachineTypeDialogProps) {
  const { updateMachineType, loading } = useMachineTypesStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateMachineTypePayload>({
    name: machineType.name,
  });

  // Update form data when machineType prop changes
  useEffect(() => {
    setFormData({
      name: machineType.name,
    });
  }, [machineType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name?.trim()) {
      toast.error("Machine type name is required");
      return;
    }

    try {
      await updateMachineType(machineType.id, formData);
      toast.success("Machine type updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update machine type");
    }
  };

  const handleInputChange = (
    field: keyof UpdateMachineTypePayload,
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
          <DialogTitle>Edit Machine Type</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter machine type name"
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
              {loading ? "Updating..." : "Update Machine Type"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
