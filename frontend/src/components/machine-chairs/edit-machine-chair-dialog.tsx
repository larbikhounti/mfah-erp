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
import { useMachinesStore } from "@/stores/machines-store";
import { toast } from "sonner";

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
  const {
    machines,
    fetchMachines,
    loading: machinesLoading,
  } = useMachinesStore();

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

  // Fetch machines when dialog opens
  useEffect(() => {
    if (open) {
      fetchMachines();
    }
  }, [open, fetchMachines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name?.trim()) {
      toast.error("Chair name is required");
      return;
    }

    if (!formData.machineId || formData.machineId === 0) {
      toast.error("Please select a machine");
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
                <SelectItem value="1">Occupied</SelectItem>
                <SelectItem value="2">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="machine">Machine</Label>
            <Select
              value={formData.machineId ? formData.machineId.toString() : ""}
              onValueChange={(value) =>
                handleInputChange("machineId", parseInt(value))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select machine" />
              </SelectTrigger>
              <SelectContent>
                {machinesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading...
                  </SelectItem>
                ) : (
                  machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.id.toString()}>
                      {machine.name}
                    </SelectItem>
                  ))
                )}
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
            <Button type="submit" disabled={loading || machinesLoading}>
              {loading ? "Updating..." : "Update Chair"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
