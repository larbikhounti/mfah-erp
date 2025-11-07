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
import { Edit } from "lucide-react";
import {
  useMachinesStore,
  type Machine,
  type UpdateMachinePayload,
} from "@/stores/machines-store";
import { axiosInstance } from "@/lib/utils";
import { toast } from "sonner";
import { Loader } from "../loader";

interface MachineType {
  id: number;
  name: string;
}

interface Dom {
  id: number;
  name: string;
  address: string;
}

interface EditMachineDialogProps {
  machine: Machine;
  trigger?: React.ReactNode;
}

export function EditMachineDialog({
  machine,
  trigger,
}: EditMachineDialogProps) {
  const { updateMachine, loading } = useMachinesStore();
  const [open, setOpen] = useState(false);
  const [machineTypes, setMachineTypes] = useState<MachineType[]>([]);
  const [doms, setDoms] = useState<Dom[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [formData, setFormData] = useState<UpdateMachinePayload>({
    name: machine.name,
    alias: machine.alias,
    status: machine.status || "active",
    machineTypeId: machine.machineTypeId || undefined,
    domeId: machine.domeId || undefined,
  });

  // Update form data when machine prop changes
  useEffect(() => {
    setFormData({
      name: machine.name,
      alias: machine.alias,
      status: machine.status || "active",
      machineTypeId: machine.machineTypeId || undefined,
      domeId: machine.domeId || undefined,
    });
  }, [machine]);

  // Fetch machine types and DOMs when component mounts or dialog opens
  useEffect(() => {
    if (open) {
      fetchMachineTypesAndDoms();
    }
  }, [open]);

  const fetchMachineTypesAndDoms = async () => {
    setLoadingData(true);
    try {
      // Fetch machine types
      const machineTypesResponse = await axiosInstance.get<{
        data: MachineType[];
      }>("/machine-types/all");
      setMachineTypes(machineTypesResponse.data.data);

      // Fetch DOMs
      const domsResponse = await axiosInstance.get<{ data: Dom[] }>(
        "/doms/all"
      );
      setDoms(domsResponse.data.data);
    } catch (error) {
      console.error("Failed to fetch machine types and DOMs:", error);
      toast.error("Failed to load machine types and DOMs");
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!formData.name?.trim()) {
      toast.error("Machine name is required");
      return;
    }

    if (!formData.alias?.trim()) {
      toast.error("Machine alias is required");
      return;
    }

    try {
      await updateMachine(machine.id, formData);
      toast.success("Machine updated successfully");
      setOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update machine");
    }
  };

  const handleInputChange = (
    field: keyof UpdateMachinePayload,
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
          <Button variant="ghost" className="flex items-center gap-2">
            <Edit className="h-4 w-4" />
            Edit
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Machine</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2 w-full">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter machine name"
              value={formData.name || ""}
              onChange={(e) => handleInputChange("name", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              type="text"
              placeholder="Enter machine alias"
              value={formData.alias || ""}
              onChange={(e) => handleInputChange("alias", e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status || "active"}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
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
                  {loadingData ? (
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
                  {loadingData ? (
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
            <Button type="submit" disabled={loading || loadingData}>
              {loading ? (
                <span className="flex items-center">
                  <Loader size={16} />
                  <span className="ml-2">Updating...</span>
                </span>
              ) : (
                "Update Machine"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
