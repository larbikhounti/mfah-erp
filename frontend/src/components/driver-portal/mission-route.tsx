import { MapPin } from "lucide-react";

interface RouteStop {
  place: string;
  detail?: string;
}

/** Loading → delivery, as two pins joined by a line. */
export function MissionRoute({ from, to }: { from: RouteStop; to: RouteStop }) {
  return (
    <div className="relative space-y-3">
      <span className="absolute top-5 bottom-5 left-[9px] w-px bg-border" aria-hidden />
      {[from, to].map((stop, index) => (
        <div key={index} className="relative flex gap-3">
          <MapPin className="mt-0.5 size-5 shrink-0 fill-background text-foreground" />
          <div className="min-w-0">
            <p className="truncate font-medium">{stop.place}</p>
            {stop.detail && <p className="text-sm text-muted-foreground">{stop.detail}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
