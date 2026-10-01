"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Combobox } from "@/components/ui/combobox";
import { useRemoteComboboxOptions } from "@/hooks/use-remote-combobox-options";
import { Edit } from "lucide-react";
import { useContractorTrucksStore, type ContractorTruck } from "@/stores/contractor-trucks-store";
import type { Subcontractor } from "@/stores/subcontractors-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditContractorTruckDialogProps {
  contractorTruck: ContractorTruck;
}

export function EditContractorTruckDialog({ contractorTruck }: EditContractorTruckDialogProps) {
  const { updateContractorTruck, loading } = useContractorTrucksStore();
  const [isOpen, setIsOpen] = useState(false);

  const mapSubcontractor = useCallback(
    (s: Subcontractor) => ({ value: s.id.toString(), label: s.companyName }),
    []
  );
  const {
    options: subcontractorOptions,
    loading: subcontractorsLoading,
    search: searchSubcontractors,
  } = useRemoteComboboxOptions<Subcontractor>({ endpoint: "/subcontractors", mapItem: mapSubcontractor });

  const [plateNumber, setPlateNumber] = useState(contractorTruck.plateNumber);
  const [subcontractorId, setSubcontractorId] = useState(contractorTruck.subcontractorId.toString());
  const [subcontractorLabel, setSubcontractorLabel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setPlateNumber(contractorTruck.plateNumber);
    setSubcontractorId(contractorTruck.subcontractorId.toString());
  }, [contractorTruck]);

  useEffect(() => {
    if (!isOpen) return;
    axiosInstance
      .get<Subcontractor>(`/subcontractors/${contractorTruck.subcontractorId}`)
      .then((res) => setSubcontractorLabel(res.data.companyName))
      .catch(() => {});
  }, [isOpen, contractorTruck.subcontractorId]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    if (!subcontractorId) newErrors.subcontractorId = "Subcontractor is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateContractorTruck(contractorTruck.id, {
        plateNumber: plateNumber.trim(),
        subcontractorId: Number(subcontractorId),
      });
      toast.success("Contractor truck updated successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update contractor truck");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Contractor Truck</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-plateNumber">Plate Number *</Label>
            <Input
              id="edit-plateNumber"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              className={errors.plateNumber ? "border-destructive" : ""}
            />
            {errors.plateNumber && <p className="text-sm text-destructive">{errors.plateNumber}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-subcontractorId">Subcontractor *</Label>
            <Combobox
              id="edit-subcontractorId"
              value={subcontractorId}
              onChange={(value) => {
                setSubcontractorId(value);
                setSubcontractorLabel(subcontractorOptions.find((o) => o.value === value)?.label ?? "");
              }}
              onSearchChange={searchSubcontractors}
              loading={subcontractorsLoading}
              selectedLabel={subcontractorLabel}
              placeholder="Select subcontractor"
              searchPlaceholder="Search subcontractors..."
              emptyText="No subcontractor found."
              className={errors.subcontractorId ? "border-destructive" : ""}
              options={subcontractorOptions}
            />
            {errors.subcontractorId && <p className="text-sm text-destructive">{errors.subcontractorId}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <Loader size={16} />
                  <span className="ml-2">Updating...</span>
                </span>
              ) : (
                "Update Contractor Truck"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
