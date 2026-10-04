"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/driver/push";
import { useDriverSessionStore } from "@/stores/driver-session-store";

/** One-time client setup for the whole driver portal. */
export function DriverAppProviders({ children }: { children: React.ReactNode }) {
  const hydrate = useDriverSessionStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
    registerServiceWorker();
  }, [hydrate]);

  return <>{children}</>;
}
