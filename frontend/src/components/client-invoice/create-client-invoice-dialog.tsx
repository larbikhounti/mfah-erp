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
import { Plus, FileText } from "lucide-react";
import { useClientInvoicesStore } from "@/stores/client-invoices-store";
import { useMissionsStore } from "@/stores/missions-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateClientInvoiceDialogProps {
  trigger?: React.ReactNode;
}

export function CreateClientInvoiceDialog({ trigger }: CreateClientInvoiceDialogProps) {
  const { createInvoice, loading } = useClientInvoicesStore();
  const { missions, fetchMissions } = useMissionsStore();

  const [isOpen, setIsOpen] = useState(false);
  const [missionId, setMissionId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchMissions({ limit: 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const resetForm = () => {
    setMissionId("");
    setIssueDate("");
    setDueDate("");
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!missionId) newErrors.missionId = "Mission is required";
    if (!issueDate) newErrors.issueDate = "Issue date is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await createInvoice({
        missionId: Number(missionId),
        issueDate: new Date(issueDate).toISOString(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      });
      toast.success("Client invoice created successfully");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to create client invoice");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Invoice
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Client Invoice
          </DialogTitle>
          <DialogDescription>
            Amount and currency come from the mission's own client price.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="missionId">Mission *</Label>
            <Select value={missionId} onValueChange={setMissionId}>
              <SelectTrigger id="missionId" className={"w-full" + (errors.missionId ? " border-destructive" : "")}>
                <SelectValue placeholder="Select mission" />
              </SelectTrigger>
              <SelectContent>
                {missions.map((m) => (
                  <SelectItem key={m.id} value={m.id.toString()}>
                    {m.reference} — {Number(m.clientPrice).toLocaleString()} {m.currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.missionId && <p className="text-sm text-destructive">{errors.missionId}</p>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="issueDate">Issue Date *</Label>
              <Input
                id="issueDate"
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className={errors.issueDate ? "border-destructive" : ""}
              />
              {errors.issueDate && <p className="text-sm text-destructive">{errors.issueDate}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
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
                "Create Invoice"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
