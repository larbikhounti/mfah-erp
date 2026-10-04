import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

/** Big tappable card linking to a mission step (Add fuel, Delivery & Closure). */
export function ActionCard({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-4 rounded-xl bg-primary/10 p-4 transition-colors active:bg-primary/20"
    >
      <Icon className="size-9 shrink-0 text-primary" />
      <div className="flex-1">
        <p className="text-lg font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <ChevronRight className="size-5 text-primary" />
    </Link>
  );
}
