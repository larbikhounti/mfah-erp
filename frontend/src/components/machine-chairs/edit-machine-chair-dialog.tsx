"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useMachineChairsStore,
  type UpdateMachineChairPayload,
  type MachineChair,
} from "@/stores/machine-chairs-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditMachineChairDialogProps {
  machineChair: MachineChair;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditMachineChairDialog({
  machineChair,
  open,
  onOpenChange,
}: EditMachineChairDialogProps) {
  const { updateMachineChair, loading } = useMachineChairsStore();

  const [formData, setFormData] = useState<UpdateMachineChairPayload>({
    name: machineChair.name,
    status: machineChair.status,
    machineId: machineChair.machineId,
  });

  // Update form data when machineChair prop changes
  useEffect(() => {
    setFormData({
      name: machineChair.name,
      status: machineChair.status,
      machineId: machineChair.machineId,
    });
  }, [machineChair]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name?.trim()) {
      toast.error("Chair name is required");
      return;
    }

    try {
      await updateMachineChair(machineChair.id, formData);
      toast.success("Machine chair updated successfully");
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update machine chair");
    }
  };

  const handleInputChange = (
    field: keyof UpdateMachineChairPayload,
    value: string | number | undefined
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Machine Chair</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Chair Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter chair name (e.g., Chair 1, Seat A)"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status?.toString() || "0"}
              onValueChange={(value) =>
                handleInputChange("status", parseInt(value))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Available</SelectItem>
                <SelectItem value="1">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
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
                            </span>: "Update Chair"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
