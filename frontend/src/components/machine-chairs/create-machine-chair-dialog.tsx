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
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateMachineChairDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultMachineId?: number;
}

export function CreateMachineChairDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  defaultMachineId,
}: CreateMachineChairDialogProps) {
  const { createMachineChair, loading } = useMachineChairsStore();

  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const [formData, setFormData] = useState<Partial<CreateMachineChairPayload>>({
    name: "",
    status: 0,
    machineId: defaultMachineId,
  });

  // Update machineId when defaultMachineId prop changes
  useEffect(() => {
    if (defaultMachineId) {
      setFormData((prev) => ({
        ...prev,
        machineId: defaultMachineId,
      }));
    }
  }, [defaultMachineId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name?.trim()) {
      toast.error("Chair name is required");
      return;
    }

    if (!formData.machineId) {
      toast.error("Machine ID is required");
      return;
    }

    try {
      await createMachineChair(formData as CreateMachineChairPayload);
      toast.success("Machine chair created successfully");
      setOpen(false);
      // Reset form
      setFormData({
        name: "",
        status: 0,
        machineId: defaultMachineId,
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
                <SelectItem value="1">Maintenance</SelectItem>
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
            <Button type="submit" disabled={loading}>
              {loading ?   <span className="flex items-center">
                               <Loader size={16} />
                                <span className="ml-2">Creating...</span>
                            </span>: "Create Chair"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
