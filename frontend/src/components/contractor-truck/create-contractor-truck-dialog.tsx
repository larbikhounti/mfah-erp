"use client";

import type React from "react";
import { useCallback, useState } from "react";
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
import { Plus, Truck as TruckIcon } from "lucide-react";
import { useContractorTrucksStore } from "@/stores/contractor-trucks-store";
import type { Subcontractor } from "@/stores/subcontractors-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateContractorTruckDialogProps {
  trigger?: React.ReactNode;
}

export function CreateContractorTruckDialog({ trigger }: CreateContractorTruckDialogProps) {
  const { createContractorTruck, loading } = useContractorTrucksStore();
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

  const [plateNumber, setPlateNumber] = useState("");
  const [subcontractorId, setSubcontractorId] = useState("");
  const [subcontractorLabel, setSubcontractorLabel] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    if (!subcontractorId) newErrors.subcontractorId = "Subcontractor is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setPlateNumber("");
    setSubcontractorId("");
    setSubcontractorLabel("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createContractorTruck({
        plateNumber: plateNumber.trim(),
        subcontractorId: Number(subcontractorId),
      });
      toast.success("Contractor truck created successfully");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create contractor truck");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Contractor Truck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Add New Contractor Truck
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="plateNumber">Plate Number *</Label>
            <Input
              id="plateNumber"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="12345-A-6"
              className={errors.plateNumber ? "border-destructive" : ""}
            />
            {errors.plateNumber && <p className="text-sm text-destructive">{errors.plateNumber}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subcontractorId">Subcontractor *</Label>
            <Combobox
              id="subcontractorId"
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
                  <span className="ml-2">Creating...</span>
                </span>
              ) : (
                "Create Contractor Truck"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
