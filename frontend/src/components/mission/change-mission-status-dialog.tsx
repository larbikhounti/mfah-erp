"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { ArrowLeftRight } from "lucide-react";
import { useMissionsStore, type Mission, type MissionStatus } from "@/stores/missions-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface ChangeMissionStatusDialogProps {
  mission: Mission;
}

const STATUS_OPTIONS: MissionStatus[] = ["PLANNED", "IN_PROGRESS", "FINISHED", "CANCELLED"];

export function ChangeMissionStatusDialog({ mission }: ChangeMissionStatusDialogProps) {
  const { updateMissionStatus, loading } = useMissionsStore();
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<MissionStatus>(mission.status);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateMissionStatus(mission.id, status);
      toast.success("Mission status updated");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to update mission status");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (open) setStatus(mission.status); }}>
      <DialogTrigger asChild>
        <span className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
          <ArrowLeftRight className="mr-2 h-4 w-4" />
          Change Status
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[380px]">
        <DialogHeader>
          <DialogTitle>Change Status — {mission.reference}</DialogTitle>
          <DialogDescription>
            For in-house missions, entering "In Progress" marks the truck/driver as on mission;
            finishing or cancelling frees them up again.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as MissionStatus)}>
              <SelectTrigger id="status" className="w-full">
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
