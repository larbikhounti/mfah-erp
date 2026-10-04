import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DriverMissionDetail } from "@/stores/driver-missions-store";
import { formatDateTime, pluralize } from "@/lib/driver/format";

type StepState = "done" | "current" | "todo";

interface Step {
  title: string;
  subtitle: string;
  state: StepState;
}

function stepsFor(mission: DriverMissionDetail): Step[] {
  const started = !!mission.loadingConfirmedAt;
  const completed = !!mission.completedAt;
  const hasFuel = mission.fuelEntryCount > 0;
  const hasCmr = mission.closureFiles.some((f) => f.category === "CMR");

  return [
    {
      title: started ? "Loading confirmed" : "Confirm loading",
      subtitle: started ? formatDateTime(mission.loadingConfirmedAt!) : "Tap when the truck is loaded",
      state: started ? "done" : "current",
    },
    {
      title: "Add fuel",
      subtitle: hasFuel ? pluralize(mission.fuelEntryCount, "fuel entry", "fuel entries") : "Record your fuel purchases",
      state: !started ? "todo" : hasFuel || completed ? "done" : "current",
    },
    {
      title: "Delivery & Closure",
      subtitle: hasCmr ? "CMR uploaded" : "Upload CMR after delivery",
      state: completed ? "done" : started && hasCmr ? "current" : "todo",
    },
    {
      title: mission.status === "FINISHED" ? "Mission completed" : completed ? "In review by operations" : "Mission completed",
      subtitle: completed ? formatDateTime(mission.completedAt!) : "",
      state: mission.status === "FINISHED" ? "done" : completed ? "current" : "todo",
    },
  ];
}

export function MissionTimeline({ mission }: { mission: DriverMissionDetail }) {
  const steps = stepsFor(mission);

  return (
    <ol className="relative space-y-5">
      <span className="absolute top-3 bottom-3 left-[13px] w-px bg-border" aria-hidden />
      {steps.map((step) => (
        <li key={step.title} className="relative flex gap-3">
          <span
            className={cn(
              "flex size-7 shrink-0 items-center justify-center rounded-full border-2 bg-background",
              step.state === "done" && "border-success bg-success text-success-foreground",
              step.state === "current" && "border-primary",
            )}
          >
            {step.state === "done" && <Check className="size-4" />}
            {step.state === "current" && <span className="size-2.5 rounded-full bg-primary" />}
          </span>
          <div>
            <p className={cn("font-medium", step.state === "current" && "text-primary")}>{step.title}</p>
            {step.subtitle && <p className="text-xs text-muted-foreground">{step.subtitle}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
