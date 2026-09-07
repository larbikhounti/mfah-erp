"use client";

import type React from "react";
import { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit } from "lucide-react";
import { useDriversStore, type Driver, type DriverStatus } from "@/stores/drivers-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditDriverDialogProps {
  driver: Driver;
}

const STATUS_OPTIONS: DriverStatus[] = ["ACTIF", "EN_CONGE", "EN_MISSION", "INDISPONIBLE"];

export function EditDriverDialog({ driver }: EditDriverDialogProps) {
  const { updateDriver, loading } = useDriversStore();
  const [isOpen, setIsOpen] = useState(false);

  const [fullName, setFullName] = useState(driver.fullName);
  const [cin, setCin] = useState(driver.cin);
  const [phone, setPhone] = useState(driver.phone);
  const [status, setStatus] = useState<DriverStatus>(driver.status);
  const [note, setNote] = useState(driver.note ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFullName(driver.fullName);
    setCin(driver.cin);
    setPhone(driver.phone);
    setStatus(driver.status);
    setNote(driver.note ?? "");
  }, [driver]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!cin.trim()) newErrors.cin = "CIN is required";
    if (!phone.trim()) newErrors.phone = "Phone is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateDriver(driver.id, {
        fullName: fullName.trim(),
        cin: cin.trim(),
        phone: phone.trim(),
        status,
        note: note.trim(),
      });
      toast.success("Driver updated successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update driver");
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Driver</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-fullName">Full Name *</Label>
            <Input
              id="edit-fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-cin">CIN *</Label>
              <Input
                id="edit-cin"
                value={cin}
                onChange={(e) => setCin(e.target.value)}
                className={errors.cin ? "border-destructive" : ""}
              />
              {errors.cin && <p className="text-sm text-destructive">{errors.cin}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input
                id="edit-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={errors.phone ? "border-destructive" : ""}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as DriverStatus)}>
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
                "Update Driver"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
