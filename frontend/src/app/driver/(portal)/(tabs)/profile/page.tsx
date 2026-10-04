"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IdCard, LogOut, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { PushNotificationsCard } from "@/components/driver-portal/push-notifications-card";
import { DRIVER_LOGIN_PATH } from "@/lib/driver/api";
import { DriverProfile, useDriverSessionStore } from "@/stores/driver-session-store";

export default function DriverProfilePage() {
  const router = useRouter();
  const { profile: session, fetchProfile, logout } = useDriverSessionStore();
  const [profile, setProfile] = useState<DriverProfile | null>(null);

  useEffect(() => {
    fetchProfile().then(setProfile).catch(() => undefined);
  }, [fetchProfile]);

  const name = profile?.fullName ?? session?.fullName ?? "";

  return (
    <>
      <header className="flex flex-col items-center gap-3 bg-brand px-4 pt-[calc(2rem+env(safe-area-inset-top))] pb-8 text-brand-foreground">
        <Avatar className="size-20 border-2 border-white/30">
          <AvatarFallback className="bg-white/15 text-2xl font-semibold text-brand-foreground">
            {name
              .split(" ")
              .slice(0, 2)
              .map((p) => p[0])
              .join("")
              .toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-xl font-bold">{name}</h1>
      </header>

      <div className="space-y-4 p-4">
        <div className="divide-y rounded-xl border bg-card">
          <div className="flex items-center gap-3 p-4">
            <Phone className="size-5 text-muted-foreground" />
            <span>{profile?.phone ?? session?.phone}</span>
          </div>
          {profile?.cin && (
            <div className="flex items-center gap-3 p-4">
              <IdCard className="size-5 text-muted-foreground" />
              <span>{profile.cin}</span>
            </div>
          )}
        </div>

        <PushNotificationsCard />

        <Button
          variant="outline"
          size="lg"
          className="w-full text-destructive"
          onClick={async () => {
            await logout();
            router.replace(DRIVER_LOGIN_PATH);
          }}
        >
          <LogOut className="size-4" />
          Log out
        </Button>
      </div>
    </>
  );
}
