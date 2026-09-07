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
import { Edit } from "lucide-react";
import {
  useSubcontractorsStore,
  type Subcontractor,
  type UpdateSubcontractorPayload,
} from "@/stores/subcontractors-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditSubcontractorDialogProps {
  subcontractor: Subcontractor;
}

export function EditSubcontractorDialog({ subcontractor }: EditSubcontractorDialogProps) {
  const { updateSubcontractor, loading } = useSubcontractorsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateSubcontractorPayload>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData({
      companyName: subcontractor.companyName,
      address: subcontractor.address ?? "",
      contactName: subcontractor.contactName ?? "",
      contactPhone: subcontractor.contactPhone ?? "",
      contactEmail: subcontractor.contactEmail ?? "",
      ice: subcontractor.ice,
      bankName: subcontractor.bankName ?? "",
      bankRib: subcontractor.bankRib ?? "",
      bankIban: subcontractor.bankIban ?? "",
      bankSwift: subcontractor.bankSwift ?? "",
    });
  }, [subcontractor]);

  const handleChange = (field: keyof UpdateSubcontractorPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName?.trim()) newErrors.companyName = "Company name is required";
    if (!formData.ice?.trim()) newErrors.ice = "ICE is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateSubcontractor(subcontractor.id, formData);
      toast.success("Subcontractor updated successfully");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update subcontractor");
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
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Subcontractor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-companyName">Company Name *</Label>
              <Input
                id="edit-companyName"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className={errors.companyName ? "border-destructive" : ""}
              />
              {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-ice">ICE *</Label>
              <Input
                id="edit-ice"
                value={formData.ice}
                onChange={(e) => handleChange("ice", e.target.value)}
                className={errors.ice ? "border-destructive" : ""}
              />
              {errors.ice && <p className="text-sm text-destructive">{errors.ice}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-address">Address</Label>
            <Input id="edit-address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-contactName">Contact Name</Label>
              <Input
                id="edit-contactName"
                value={formData.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contactPhone">Contact Phone</Label>
              <Input
                id="edit-contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-contactEmail">Contact Email</Label>
              <Input
                id="edit-contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-bankName">Bank Name</Label>
              <Input id="edit-bankName" value={formData.bankName} onChange={(e) => handleChange("bankName", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bankRib">Bank RIB</Label>
              <Input id="edit-bankRib" value={formData.bankRib} onChange={(e) => handleChange("bankRib", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bankIban">Bank IBAN</Label>
              <Input id="edit-bankIban" value={formData.bankIban} onChange={(e) => handleChange("bankIban", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-bankSwift">Bank SWIFT</Label>
              <Input id="edit-bankSwift" value={formData.bankSwift} onChange={(e) => handleChange("bankSwift", e.target.value)} />
            </div>
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
                "Update Subcontractor"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
