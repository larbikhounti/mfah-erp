"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Truck as TruckIcon } from "lucide-react";
import { useTrucksStore, type TruckStatus } from "@/stores/trucks-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateTruckDialogProps {
  trigger?: React.ReactNode;
}

const STATUS_OPTIONS: TruckStatus[] = ["DISPO", "EN_MISSION", "MAINTENANCE", "INDISPONIBLE"];

export function CreateTruckDialog({ trigger }: CreateTruckDialogProps) {
  const { createTruck, loading } = useTrucksStore();
  const [isOpen, setIsOpen] = useState(false);

  const [plateNumber, setPlateNumber] = useState("");
  const [type, setType] = useState("");
  const [ptac, setPtac] = useState("");
  const [status, setStatus] = useState<TruckStatus>("DISPO");
  const [note, setNote] = useState("");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    if (!type.trim()) newErrors.type = "Type is required";
    if (!ptac || Number(ptac) <= 0) newErrors.ptac = "PTAC must be a positive number";
    if (!insuranceExpiry) newErrors.insuranceExpiry = "Insurance expiry is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setPlateNumber("");
    setType("");
    setPtac("");
    setStatus("DISPO");
    setNote("");
    setInsuranceExpiry("");
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createTruck({
        plateNumber: plateNumber.trim(),
        type: type.trim(),
        ptac: Number(ptac),
        status,
        note: note.trim() || undefined,
        insuranceExpiry: new Date(insuranceExpiry).toISOString(),
      });
      toast.success("Truck created successfully");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create truck");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Truck
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TruckIcon className="h-5 w-5" />
            Add New Truck
          </DialogTitle>
          <DialogDescription>Register a new truck in the fleet.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="type">Type *</Label>
              <Input
                id="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="Semi-remorque"
                className={errors.type ? "border-destructive" : ""}
              />
              {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="ptac">PTAC (kg) *</Label>
              <Input
                id="ptac"
                type="number"
                min={1}
                value={ptac}
                onChange={(e) => setPtac(e.target.value)}
                placeholder="26000"
                className={errors.ptac ? "border-destructive" : ""}
              />
              {errors.ptac && <p className="text-sm text-destructive">{errors.ptac}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TruckStatus)}>
                <SelectTrigger id="status" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="insuranceExpiry">Insurance Expiry *</Label>
            <Input
              id="insuranceExpiry"
              type="date"
              value={insuranceExpiry}
              onChange={(e) => setInsuranceExpiry(e.target.value)}
              className={errors.insuranceExpiry ? "border-destructive" : ""}
            />
            {errors.insuranceExpiry && (
              <p className="text-sm text-destructive">{errors.insuranceExpiry}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="note">Note</Label>
            <Input id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional note" />
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
                "Create Truck"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
