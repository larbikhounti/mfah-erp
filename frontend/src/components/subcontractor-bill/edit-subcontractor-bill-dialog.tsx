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
import { CalendarClock } from "lucide-react";
import { useSubcontractorBillsStore, type SubcontractorBill } from "@/stores/subcontractor-bills-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface EditSubcontractorBillDialogProps {
  bill: SubcontractorBill;
}

const toDateInputValue = (value: string | null) => (value ? value.slice(0, 10) : "");

export function EditSubcontractorBillDialog({ bill }: EditSubcontractorBillDialogProps) {
  const { updateBill, loading } = useSubcontractorBillsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [issueDate, setIssueDate] = useState(toDateInputValue(bill.issueDate));
  const [dueDate, setDueDate] = useState(toDateInputValue(bill.dueDate));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setIssueDate(toDateInputValue(bill.issueDate));
    setDueDate(toDateInputValue(bill.dueDate));
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!issueDate) newErrors.issueDate = "Issue date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await updateBill(bill.id, {
        issueDate: new Date(issueDate).toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      toast.success("Bill dates updated");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update bill dates");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) resetForm(); }}>
      <DialogTrigger asChild>
        <span className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
          <CalendarClock className="mr-2 h-4 w-4" />
          Edit Dates
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Edit Dates — {bill.billNumber}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-issueDate">Issue Date *</Label>
              <Input
                id="edit-issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className={errors.issueDate ? "border-destructive" : ""}
              />
              {errors.issueDate && <p className="text-sm text-destructive">{errors.issueDate}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-dueDate">Due Date</Label>
              <Input id="edit-dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
