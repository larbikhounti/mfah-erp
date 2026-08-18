"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import { Edit } from "lucide-react";
import { useTrucksStore, type Truck, type TruckStatus } from "@/stores/trucks-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditTruckDialogProps {
  truck: Truck;
}

const STATUS_OPTIONS: TruckStatus[] = ["DISPO", "EN_MISSION", "MAINTENANCE", "INDISPONIBLE"];

export function EditTruckDialog({ truck }: EditTruckDialogProps) {
  const { updateTruck, loading } = useTrucksStore();
  const [isOpen, setIsOpen] = useState(false);

  const [plateNumber, setPlateNumber] = useState(truck.plateNumber);
  const [type, setType] = useState(truck.type);
  const [ptac, setPtac] = useState(String(truck.ptac));
  const [status, setStatus] = useState<TruckStatus>(truck.status);
  const [note, setNote] = useState(truck.note ?? "");
  const [insuranceExpiry, setInsuranceExpiry] = useState(
    truck.insuranceExpiry.slice(0, 10)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setPlateNumber(truck.plateNumber);
    setType(truck.type);
    setPtac(String(truck.ptac));
    setStatus(truck.status);
    setNote(truck.note ?? "");
    setInsuranceExpiry(truck.insuranceExpiry.slice(0, 10));
  }, [truck]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!plateNumber.trim()) newErrors.plateNumber = "Plate number is required";
    if (!type.trim()) newErrors.type = "Type is required";
    if (!ptac || Number(ptac) <= 0) newErrors.ptac = "PTAC must be a positive number";
    if (!insuranceExpiry) newErrors.insuranceExpiry = "Insurance expiry is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateTruck(truck.id, {
        plateNumber: plateNumber.trim(),
        type: type.trim(),
        ptac: Number(ptac),
        status,
        note: note.trim(),
        insuranceExpiry: new Date(insuranceExpiry).toISOString(),
      });
      toast.success("Truck updated successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update truck");
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
          <DialogTitle>Edit Truck</DialogTitle>
          <DialogDescription>Update this truck's information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
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
              <Label htmlFor="edit-type">Type *</Label>
              <Input
                id="edit-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className={errors.type ? "border-destructive" : ""}
              />
              {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-ptac">PTAC (kg) *</Label>
              <Input
                id="edit-ptac"
                type="number"
                min={1}
                value={ptac}
                onChange={(e) => setPtac(e.target.value)}
                className={errors.ptac ? "border-destructive" : ""}
              />
              {errors.ptac && <p className="text-sm text-destructive">{errors.ptac}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as TruckStatus)}>
                <SelectTrigger id="edit-status" className="w-full">
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
            <Label htmlFor="edit-insuranceExpiry">Insurance Expiry *</Label>
            <Input
              id="edit-insuranceExpiry"
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
            <Label htmlFor="edit-note">Note</Label>
            <Input id="edit-note" value={note} onChange={(e) => setNote(e.target.value)} />
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
                "Update Truck"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
