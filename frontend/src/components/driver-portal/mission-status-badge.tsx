import { cn } from "@/lib/utils";
import type { DriverMissionStatus } from "@/stores/driver-missions-store";

const STATUS_STYLES: Record<DriverMissionStatus, { label: string; className: string }> = {
  PLANNED: { label: "Assigned", className: "bg-muted text-muted-foreground" },
  IN_PROGRESS: { label: "In progress", className: "bg-primary text-primary-foreground" },
  PENDING_REVIEW: { label: "In review", className: "bg-warning/20 text-warning-foreground" },
  FINISHED: { label: "Completed", className: "bg-success/15 text-success" },
  CANCELLED: { label: "Cancelled", className: "bg-destructive/10 text-destructive" },
};

export function MissionStatusBadge({ status, className }: { status: DriverMissionStatus; className?: string }) {
  const { label, className: style } = STATUS_STYLES[status];
  return (
    <span className={cn("inline-flex shrink-0 rounded-full px-3 py-1 text-xs font-medium", style, className)}>
      {label}
    </span>
  );
}
