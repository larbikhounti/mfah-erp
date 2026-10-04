import { Badge } from "@/components/ui/badge";
import type { MissionStatus } from "@/stores/missions-store";

/** Human labels, in workflow order — also the order of status pickers. */
export const MISSION_STATUS_LABEL: Record<MissionStatus, string> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
  PENDING_REVIEW: "Pending Review",
  FINISHED: "Finished",
  CANCELLED: "Cancelled",
};

export const MISSION_STATUSES = Object.keys(MISSION_STATUS_LABEL) as MissionStatus[];

const STATUS_VARIANT: Record<MissionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PLANNED: "outline",
  IN_PROGRESS: "secondary",
  PENDING_REVIEW: "outline",
  FINISHED: "default",
  CANCELLED: "destructive",
};

/** Shared by the missions table, the mission dialog and the dashboard. */
export function MissionStatusBadge({ status }: { status: MissionStatus }) {
  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      className={status === "PENDING_REVIEW" ? "border-warning bg-warning/15 text-warning-foreground" : undefined}
    >
      {MISSION_STATUS_LABEL[status]}
    </Badge>
  );
}
