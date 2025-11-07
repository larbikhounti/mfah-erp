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
import { Plus, Building } from "lucide-react";
import { useDomsStore, type CreateDomPayload } from "@/stores/doms-store";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { Loader } from "../loader";

interface CreateDomDialogProps {
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onClose?: () => void;
}

export function CreateDomDialog({
  trigger,
  isOpen: externalIsOpen,
  onClose: externalOnClose,
}: CreateDomDialogProps) {
  const { createDom, loading } = useDomsStore();
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
  
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !address) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const domData: CreateDomPayload = {
        name,
        address,
      };

      await createDom(domData);
      toast.success("Store created successfully");

      // Reset form
      setName("");
      setAddress("");
      setIsDialogOpen(false);
    } catch (error) {
      // Error is handled in the store
    }
  };

  const defaultTrigger = (
    <Button>
      <Building className="mr-2 h-4 w-4" />
      Add Store
    </Button>
  );

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
          <DialogDescription>
            Create a new Store (Digital Operations Management) location with the required information.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter Store name (e.g., VR Experience Center)"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Address *</Label>
              <Textarea
                id="address"
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
              onClick={() => setIsDialogOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ?   <span className="flex items-center">
                               <Loader size={16} />
                                <span className="ml-2">Creating...</span>
                            </span> : "Create Store"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
