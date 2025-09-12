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
  useMachinesStore,
  type CreateMachinePayload,
} from "@/stores/machines-store";
import { useMachineTypesStore } from "@/stores/machine-types-store";
import { useDomsStore } from "@/stores/doms-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateMachineDialogProps {
  trigger?: React.ReactNode;
}

export function CreateMachineDialog({ trigger }: CreateMachineDialogProps) {
  const { createMachine, loading } = useMachinesStore();
  const {
    machineTypes,
    fetchMachineTypes,
    loading: machineTypesLoading,
  } = useMachineTypesStore();
  const { doms, fetchDoms, loading: domsLoading } = useDomsStore();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateMachinePayload>({
    name: "",
    machineTypeId: undefined,
    domeId: undefined,
    chairsNumber: undefined,
  });

  // Fetch machine types and DOMs when dialog opens
  useEffect(() => {
    if (open) {
      fetchMachineTypes();
      fetchDoms();
    }
  }, [open, fetchMachineTypes, fetchDoms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name.trim()) {
      toast.error("Machine name is required");
      return;
    }

    try {
      await createMachine(formData);
      toast.success("Machine created successfully");
      setOpen(false);
      // Reset form
      setFormData({
        name: "",
        machineTypeId: undefined,
        domeId: undefined,
        chairsNumber: undefined,
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create machine");
    }
  };

  const handleInputChange = (
    field: keyof CreateMachinePayload,
    value: string | number | undefined
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
            Create Machine
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Machine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter machine name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="chairsNumber">Number of Chairs</Label>
            <Input
              id="chairsNumber"
              type="number"
              min="0"
              placeholder="Enter number of chairs"
              value={formData.chairsNumber || ""}
              onChange={(e) =>
                handleInputChange(
                  "chairsNumber",
                  e.target.value ? parseInt(e.target.value) : undefined
                )
              }
            />
          </div>
          <div className="w-full grid md:grid-cols-2 gap-4">
            <div className="grid gap-2 w-full">
              <Label htmlFor="machineType">Machine Type</Label>
              <Select
                value={formData.machineTypeId?.toString() || "none"}
                onValueChange={(value) =>
                  handleInputChange(
                    "machineTypeId",
                    value === "none" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select machine type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No machine type</SelectItem>
                  {machineTypesLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    machineTypes.map((type) => (
                      <SelectItem key={type.id} value={type.id.toString()}>
                        {type.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 w-full">
              <Label htmlFor="dom">DOM</Label>
              <Select
                value={formData.domeId?.toString() || "none"}
                onValueChange={(value) =>
                  handleInputChange(
                    "domeId",
                    value === "none" ? undefined : parseInt(value)
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select DOM" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No DOM</SelectItem>
                  {domsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : (
                    doms.map((dom) => (
                      <SelectItem key={dom.id} value={dom.id.toString()}>
                        {dom.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
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
            <Button
              type="submit"
              disabled={loading || machineTypesLoading || domsLoading}
            >
              {loading ?   <span className="flex items-center">
                               <Loader size={16} />
                                <span className="ml-2">Creating...</span>
                            </span>: "Create Machine"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
