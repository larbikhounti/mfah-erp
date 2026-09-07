"use client";

import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMissionsStore, type Mission, type MissionStatus } from "@/stores/missions-store";
import { useClientsStore } from "@/stores/clients-store";
import { useTrucksStore } from "@/stores/trucks-store";
import { useDriversStore } from "@/stores/drivers-store";
import { useSubcontractorsStore } from "@/stores/subcontractors-store";

interface ViewMissionDialogProps {
  missionId: number;
  trigger: React.ReactNode;
}

const STATUS_VARIANT: Record<MissionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PLANNED: "outline",
  IN_PROGRESS: "secondary",
  FINISHED: "default",
  CANCELLED: "destructive",
};

// Shared with any row-level "View Mission" trigger (client invoices,
// subcontractor bills) so the link itself hints at the mission's status
// before the dialog is even opened.
export const MISSION_LINK_COLOR: Record<MissionStatus, string> = {
  PLANNED: "text-primary",
  IN_PROGRESS: "text-yellow-500",
  FINISHED: "text-green-600",
  CANCELLED: "text-destructive",
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 py-1.5 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="col-span-2 font-medium">{value}</div>
    </div>
  );
}

export function ViewMissionDialog({ missionId, trigger }: ViewMissionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mission, setMission] = useState<Mission | null>(null);
  const [notFound, setNotFound] = useState(false);

  const { fetchMissionById } = useMissionsStore();
  const { clients, fetchClients } = useClientsStore();
  const { trucks, fetchTrucks } = useTrucksStore();
  const { drivers, fetchDrivers } = useDriversStore();
  const { subcontractors, fetchSubcontractors } = useSubcontractorsStore();

  useEffect(() => {
    if (!isOpen) return;
    fetchClients({ limit: 100 });
    fetchTrucks({ limit: 100 });
    fetchDrivers({ limit: 100 });
    fetchSubcontractors({ limit: 100 });
    setNotFound(false);
    fetchMissionById(missionId)
      .then((m) => setMission(m))
      .catch(() => setNotFound(true));
  }, [isOpen, missionId, fetchMissionById, fetchClients, fetchTrucks, fetchDrivers, fetchSubcontractors]);

  const clientName = useMemo(
    () => (mission ? clients.find((c) => c.id === mission.clientId)?.companyName : undefined),
    [clients, mission]
  );
  const truckLabel = useMemo(
    () => (mission?.truckId ? trucks.find((t) => t.id === mission.truckId)?.plateNumber : undefined),
    [trucks, mission]
  );
  const driverLabel = useMemo(
    () => (mission?.driverId ? drivers.find((d) => d.id === mission.driverId)?.fullName : undefined),
    [drivers, mission]
  );
  const subcontractorLabel = useMemo(
    () =>
      mission?.subcontractorId
        ? subcontractors.find((s) => s.id === mission.subcontractorId)?.companyName
        : undefined,
    [subcontractors, mission]
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mission ? `Mission ${mission.reference}` : "Mission"}
            {mission?.deletedAt && <Badge variant="destructive">Deleted</Badge>}
          </DialogTitle>
        </DialogHeader>

        {notFound && (
          <p className="text-muted-foreground py-8 text-center text-sm">
            Mission #{missionId} could not be found.
          </p>
        )}

        {!notFound && !mission && (
          <p className="text-muted-foreground py-8 text-center text-sm">Loading mission...</p>
        )}

        {mission?.deletedAt && (
          <div className="bg-destructive/10 text-destructive rounded-md px-3 py-2 text-sm">
            This mission was deleted on {new Date(mission.deletedAt).toLocaleDateString()}. Its truck,
            driver, and subcontractor assignments below reflect its state at that time.
          </div>
        )}

        {mission && (
          <div className="divide-y">
            <DetailRow
              label="Status"
              value={<Badge variant={STATUS_VARIANT[mission.status]}>{mission.status.replace("_", " ")}</Badge>}
            />
            <DetailRow
              label="Type"
              value={
                <div className="flex gap-2">
                  <Badge variant="outline">{mission.transportType}</Badge>
                  <Badge variant={mission.executionMode === "IN_HOUSE" ? "default" : "secondary"}>
                    {mission.executionMode === "IN_HOUSE" ? "In-house" : "Subcontracted"}
                  </Badge>
                </div>
              }
            />
            <DetailRow label="Client" value={clientName || `Client #${mission.clientId}`} />
            <DetailRow label="Route" value={`${mission.loadingLocation} → ${mission.deliveryLocation}`} />
            <DetailRow
              label="Client Price"
              value={`${Number(mission.clientPrice).toLocaleString()} ${mission.currency}`}
            />
            {mission.executionMode === "IN_HOUSE" ? (
              <>
                <DetailRow label="Truck" value={truckLabel || (mission.truckId ? `Truck #${mission.truckId}` : "-")} />
                <DetailRow
                  label="Driver"
                  value={driverLabel || (mission.driverId ? `Driver #${mission.driverId}` : "-")}
                />
              </>
            ) : (
              <>
                <DetailRow
                  label="Subcontractor"
                  value={subcontractorLabel || (mission.subcontractorId ? `Subcontractor #${mission.subcontractorId}` : "-")}
                />
                <DetailRow
                  label="Subcontractor Cost"
                  value={
                    mission.subcontractorCost
                      ? `${Number(mission.subcontractorCost).toLocaleString()} ${mission.currency}`
                      : "-"
                  }
                />
              </>
            )}
            <DetailRow label="Mission Date" value={new Date(mission.missionDate).toLocaleDateString()} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
