import Link from "next/link";
import { CalendarDays, ChevronRight, Truck } from "lucide-react";
import type { DriverMission } from "@/stores/driver-missions-store";
import { formatDate } from "@/lib/driver/format";
import { MissionStatusBadge } from "./mission-status-badge";
import { MissionRoute } from "./mission-route";

function dateLines(mission: DriverMission): string[] {
  if (mission.status === "FINISHED" || mission.status === "PENDING_REVIEW") {
    return [`Delivered: ${formatDate(mission.completedAt ?? mission.missionDate)}`];
  }
  const lines = [`Loading: ${formatDate(mission.missionDate)}`];
  if (mission.expectedDeliveryDate) {
    lines.push(`Expected delivery: ${formatDate(mission.expectedDeliveryDate)}`);
  }
  return lines;
}

export function MissionCard({ mission }: { mission: DriverMission }) {
  return (
    <Link
      href={`/driver/missions/${mission.id}`}
      className="block rounded-xl border bg-card p-4 shadow-sm transition-colors active:bg-muted"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="truncate text-lg font-bold"># {mission.reference}</span>
        <MissionStatusBadge status={mission.status} />
      </div>

      <div className="flex items-center gap-2">
        <div className="min-w-0 flex-1 space-y-3">
          <MissionRoute from={{ place: mission.loadingLocation }} to={{ place: mission.deliveryLocation }} />
          <div className="flex gap-3 text-sm">
            <CalendarDays className="size-5 shrink-0 text-muted-foreground" />
            <div>
              {dateLines(mission).map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
          {mission.truck && (
            <div className="flex gap-3 text-sm">
              <Truck className="size-5 shrink-0 text-muted-foreground" />
              <span>Truck: {mission.truck.plateNumber}</span>
            </div>
          )}
        </div>
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      </div>
    </Link>
  );
}
