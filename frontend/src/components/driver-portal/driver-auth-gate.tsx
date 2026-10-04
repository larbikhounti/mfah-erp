"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/loader";
import { useDriverSessionStore } from "@/stores/driver-session-store";
import { DRIVER_LOGIN_PATH } from "@/lib/driver/api";

/** Sends drivers without a session to the PIN screen. */
export function DriverAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { ready, profile } = useDriverSessionStore();

  useEffect(() => {
    if (ready && !profile) router.replace(DRIVER_LOGIN_PATH);
  }, [ready, profile, router]);

  if (!ready || !profile) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader size={20} />
      </div>
    );
  }
  return <>{children}</>;
}
