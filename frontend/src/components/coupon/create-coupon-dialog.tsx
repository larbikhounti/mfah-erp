"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Ticket } from "lucide-react";
import { useCouponsStore, type CreateCouponPayload } from "@/stores/coupons-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateCouponDialogProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CreateCouponDialog({
  trigger,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: CreateCouponDialogProps) {
  const { createCoupon, loading } = useCouponsStore();
  const [internalIsOpen, setInternalIsOpen] = useState(false);

  // Use external state if provided, otherwise use internal state
  const isDialogOpen =
    externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsDialogOpen =
    externalOnClose !== undefined
      ? (open: boolean) => {
          if (!open) externalOnClose();
        }
      : setInternalIsOpen;

  // Form state
  const [formData, setFormData] = useState<CreateCouponPayload>({
    code: "",
    discount: 0,
    isActive: true,
  });

  // Form errors
  const [errors, setErrors] = useState<{
    code?: string;
    discount?: string;
  }>({});

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.code?.trim()) {
      newErrors.code = "Coupon code is required";
    } else if (formData.code.length < 3) {
      newErrors.code = "Coupon code must be at least 3 characters";
    } else if (formData.code.length > 50) {
      newErrors.code = "Coupon code must be less than 50 characters";
    }

    if (formData.discount === undefined || formData.discount === null) {
      newErrors.discount = "Discount is required";
    } else if (formData.discount < 0) {
      newErrors.discount = "Discount cannot be negative";
    } else if (formData.discount > 100) {
      newErrors.discount = "Discount cannot exceed 100";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createCoupon(formData);
      toast.success("Coupon created successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to create coupon:", error);
      toast.error("Failed to create coupon");
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setFormData({ code: "", discount: 0, isActive: true });
    setErrors({});
    setIsDialogOpen(false);
  };

  // Handle input changes
  const handleInputChange = (field: keyof CreateCouponPayload, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Coupon
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Create New Coupon
          </DialogTitle>
          <DialogDescription>
            Create a new coupon code that customers can use for discounts.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              placeholder="Enter coupon code (e.g., SUMMER2024)"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
              className={errors.code ? "border-destructive" : ""}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="discount">Discount (%)</Label>
            <Input
              id="discount"
              type="number"
              min="0"
              max="100"
              step="0.01"
              placeholder="Enter discount percentage"
              value={formData.discount}
              onChange={(e) => handleInputChange("discount", parseFloat(e.target.value) || 0)}
              className={errors.discount ? "border-destructive" : ""}
            />
            {errors.discount && (
              <p className="text-sm text-destructive">{errors.discount}</p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Active</Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <span className="flex items-center">
                           <Loader size={16} />
                            <span className="ml-2">Creating...</span>
                        </span> : "Create Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
