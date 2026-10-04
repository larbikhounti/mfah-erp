import { cn } from "@/lib/utils";

/** "MFAH FLOW" wordmark + the Globalog logo, for navy backgrounds. */
export function BrandMark({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div className={cn("flex flex-col items-center text-brand-foreground", className)}>
      <span className={cn("font-black italic tracking-tight", compact ? "text-xl" : "text-3xl")}>
        MFAH FLOW
      </span>
      <img
        src="/mfah-logo.png"
        alt="MFAH Globalog"
        className={cn("mt-1 w-auto opacity-90", compact ? "h-2.5" : "h-3.5")}
      />
    </div>
  );
}
