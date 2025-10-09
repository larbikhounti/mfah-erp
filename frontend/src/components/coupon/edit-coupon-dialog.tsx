"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import { Edit, Ticket } from "lucide-react";
import { useCouponsStore, type Coupon, type UpdateCouponPayload } from "@/stores/coupons-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditCouponDialogProps {
  coupon: Coupon;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function EditCouponDialog({
  coupon,
  trigger,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: EditCouponDialogProps) {
  const { updateCoupon, loading } = useCouponsStore();
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
  const [formData, setFormData] = useState<UpdateCouponPayload>({
    code: coupon.code,
    discount: coupon.discount,
    isActive: coupon.isActive,
  });

  // Form errors
  const [errors, setErrors] = useState<{
    code?: string;
    discount?: string;
  }>({});

  // Update form data when coupon prop changes
  useEffect(() => {
    setFormData({
      code: coupon.code,
      discount: coupon.discount,
      isActive: coupon.isActive,
    });
    setErrors({});
  }, [coupon]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (formData.code !== undefined) {
      if (!formData.code?.trim()) {
        newErrors.code = "Coupon code is required";
      } else if (formData.code.length < 3) {
        newErrors.code = "Coupon code must be at least 3 characters";
      } else if (formData.code.length > 50) {
        newErrors.code = "Coupon code must be less than 50 characters";
      }
    }

    if (formData.discount !== undefined) {
      if (formData.discount < 0) {
        newErrors.discount = "Discount cannot be negative";
      } else if (formData.discount > 100) {
        newErrors.discount = "Discount cannot exceed 100";
      }
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
      await updateCoupon(coupon.id, formData);
      toast.success("Coupon updated successfully");
      handleClose();
    } catch (error) {
      console.error("Failed to update coupon:", error);
      toast.error("Failed to update coupon");
    }
  };

  // Handle dialog close
  const handleClose = () => {
    setFormData({
      code: coupon.code,
      discount: coupon.discount,
      isActive: coupon.isActive,
    });
    setErrors({});
    setIsDialogOpen(false);
  };

  // Handle input changes
  const handleInputChange = (field: keyof UpdateCouponPayload, value: string | number | boolean) => {
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
          <div className="flex items-center w-full">
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </div>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Edit Coupon
          </DialogTitle>
          <DialogDescription>
            Update the coupon information. This will affect all future uses of this coupon.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-code">Coupon Code</Label>
            <Input
              id="edit-code"
              placeholder="Enter coupon code"
              value={formData.code}
              onChange={(e) => handleInputChange("code", e.target.value.toUpperCase())}
              className={errors.code ? "border-destructive" : ""}
            />
            {errors.code && (
              <p className="text-sm text-destructive">{errors.code}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-discount">Discount (%)</Label>
            <Input
              id="edit-discount"
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
            <Label htmlFor="edit-isActive">Active</Label>
            <Switch
              id="edit-isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
          </div>

          <div className="bg-muted/50 p-3 rounded-md">
            <div className="text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Coupon ID:</span>
                <span className="font-mono">{coupon.id}</span>
              </div>
              <div className="flex justify-between">
                <span>Tickets Used:</span>
                <span>{coupon._count?.tickets || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Created:</span>
                <span>{new Date(coupon.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
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
                            <span className="ml-2">
                              Updating...
                            </span>
                        </span> : "Update Coupon"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
