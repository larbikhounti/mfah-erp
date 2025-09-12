"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useDomsStore, type Dom } from "@/stores/doms-store";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditDomDialogProps {
  dom: Dom | null;
}

export function EditDomDialog({ dom }: EditDomDialogProps) {
  const { updateDom, loading } = useDomsStore();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  useEffect(() => {
    if (dom) {
      setName(dom.name);
      setAddress(dom.address);
    }
  }, [dom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dom || !name || !address) return;

    try {
      await updateDom(dom.id, {
        name,
        address,
      });
      toast.success("DOM updated successfully");
    } catch (error) {
      console.error("Failed to update DOM:", error);
    }
  };

  const handleClose = () => {
    setName("");
    setAddress("");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </span>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit DOM</DialogTitle>
          <DialogDescription>
            Update DOM information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter DOM name"
                required
              />
            </div>

            {/* Address */}
            <div className="grid gap-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Textarea
                id="edit-address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter complete address"
                required
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ?   <span className="flex items-center">
                               <Loader size={16} />
                                <span className="ml-2">
                                  Updating...
                                </span>
                            </span>: "Update DOM"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
