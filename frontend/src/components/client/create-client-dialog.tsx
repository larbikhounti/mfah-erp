"use client";

import type React from "react";
import { useState } from "react";
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
import { Plus, Building } from "lucide-react";
import { useClientsStore, type CreateClientPayload } from "@/stores/clients-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateClientDialogProps {
  trigger?: React.ReactNode;
}

const emptyForm: CreateClientPayload = {
  companyName: "",
  address: "",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
  ice: "",
  bankName: "",
  bankRib: "",
  bankIban: "",
  bankSwift: "",
};

export function CreateClientDialog({ trigger }: CreateClientDialogProps) {
  const { createClient, loading } = useClientsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<CreateClientPayload>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: keyof CreateClientPayload, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company name is required";
    if (!formData.ice.trim()) newErrors.ice = "ICE is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: CreateClientPayload = {
        companyName: formData.companyName.trim(),
        ice: formData.ice.trim(),
        address: formData.address?.trim() || undefined,
        contactName: formData.contactName?.trim() || undefined,
        contactPhone: formData.contactPhone?.trim() || undefined,
        contactEmail: formData.contactEmail?.trim() || undefined,
        bankName: formData.bankName?.trim() || undefined,
        bankRib: formData.bankRib?.trim() || undefined,
        bankIban: formData.bankIban?.trim() || undefined,
        bankSwift: formData.bankSwift?.trim() || undefined,
      };
      await createClient(payload);
      toast.success("Client created successfully");
      setFormData(emptyForm);
      setErrors({});
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create client");
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          setFormData(emptyForm);
          setErrors({});
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Add New Client
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="companyName">Company Name *</Label>
              <Input
                id="companyName"
                value={formData.companyName}
                onChange={(e) => handleChange("companyName", e.target.value)}
                className={errors.companyName ? "border-destructive" : ""}
              />
              {errors.companyName && <p className="text-sm text-destructive">{errors.companyName}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ice">ICE *</Label>
              <Input
                id="ice"
                value={formData.ice}
                onChange={(e) => handleChange("ice", e.target.value)}
                className={errors.ice ? "border-destructive" : ""}
              />
              {errors.ice && <p className="text-sm text-destructive">{errors.ice}</p>}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="contactName">Contact Name</Label>
              <Input
                id="contactName"
                value={formData.contactName}
                onChange={(e) => handleChange("contactName", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input
                id="contactPhone"
                value={formData.contactPhone}
                onChange={(e) => handleChange("contactPhone", e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleChange("contactEmail", e.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input id="bankName" value={formData.bankName} onChange={(e) => handleChange("bankName", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bankRib">Bank RIB</Label>
              <Input id="bankRib" value={formData.bankRib} onChange={(e) => handleChange("bankRib", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bankIban">Bank IBAN</Label>
              <Input id="bankIban" value={formData.bankIban} onChange={(e) => handleChange("bankIban", e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bankSwift">Bank SWIFT</Label>
              <Input id="bankSwift" value={formData.bankSwift} onChange={(e) => handleChange("bankSwift", e.target.value)} />
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
                  <span className="ml-2">Creating...</span>
                </span>
              ) : (
                "Create Client"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
