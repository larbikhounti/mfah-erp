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
import { Banknote } from "lucide-react";
import { useClientInvoicesStore, type ClientInvoice } from "@/stores/client-invoices-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface RecordPaymentDialogProps {
  invoice: ClientInvoice;
}

export function RecordPaymentDialog({ invoice }: RecordPaymentDialogProps) {
  const { recordPayment, loading } = useClientInvoicesStore();
  const [isOpen, setIsOpen] = useState(false);
  const [amountPaid, setAmountPaid] = useState(invoice.amountPaid);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountPaid || Number(amountPaid) < 0) {
      setError("Enter a valid amount");
      return;
    }
    try {
      await recordPayment(invoice.id, Number(amountPaid));
      toast.success("Payment recorded");
      setIsOpen(false);
    } catch (err) {
      toast.error("Failed to record payment");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) { setAmountPaid(invoice.amountPaid); setError(""); } }}>
      <DialogTrigger asChild>
        <span className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
          <Banknote className="mr-2 h-4 w-4" />
          Record Payment
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Record Payment — {invoice.invoiceNumber}</DialogTitle>
          <DialogDescription>
            Total: {Number(invoice.amount).toLocaleString()} {invoice.currency}. Status is recomputed automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="amountPaid">Amount Paid *</Label>
            <Input
              id="amountPaid"
              type="number"
              min={0}
              value={amountPaid}
              onChange={(e) => { setAmountPaid(e.target.value); setError(""); }}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <Loader size={16} />
                  <span className="ml-2">Saving...</span>
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
