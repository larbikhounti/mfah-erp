import type { LucideIcon } from "lucide-react";

export function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-muted-foreground">
      <Icon className="size-8" />
      {text}
    </div>
  );
}
