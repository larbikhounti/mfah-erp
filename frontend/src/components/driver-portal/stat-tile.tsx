import { cn } from "@/lib/utils";

const TONES = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/15 text-warning-foreground",
};

export function StatTile({ value, label, tone }: { value: number; label: string; tone: keyof typeof TONES }) {
  return (
    <div className={cn("flex flex-col items-center justify-center rounded-xl px-2 py-3 text-center", TONES[tone])}>
      <span className="text-2xl font-bold">{value}</span>
      <span className="text-xs leading-tight">{label}</span>
    </div>
  );
}
