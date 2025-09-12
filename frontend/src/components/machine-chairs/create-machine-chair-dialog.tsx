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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import {
  useMachineChairsStore,
  type CreateMachineChairPayload,
} from "@/stores/machine-chairs-store";
import { useMachinesStore } from "@/stores/machines-store";
import { toast } from "sonner";

interface CreateMachineChairDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateMachineChairDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
}: CreateMachineChairDialogProps) {
  const { createMachineChair, loading } = useMachineChairsStore();
  const {
    machines,
    fetchMachines,
    loading: machinesLoading,
  } = useMachinesStore();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState<CreateMachineChairPayload>({
    name: "",
    status: 0,
    machineId: 0,
  });

  // Fetch machines when dialog opens
  useEffect(() => {
    if (open) {
      fetchMachines();
    }
  }, [open, fetchMachines]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Chair name is required");
      return;
    }

    if (!formData.machineId || formData.machineId === 0) {
      toast.error("Please select a machine");
      return;
    }

    try {
      await createMachineChair(formData);
      toast.success("Machine chair created successfully");
      setOpen(false);
      // Reset form
      setFormData({
        name: "",
        status: 0,
        machineId: 0,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create machine chair");
    }
  };

  const handleInputChange = (
    field: keyof CreateMachineChairPayload,
    value: string | number
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
            Create Chair
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Machine Chair</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Chair Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter chair name (e.g., Chair 1, Seat A)"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status.toString()}
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
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || machinesLoading}>
              {loading ? "Creating..." : "Create Chair"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
