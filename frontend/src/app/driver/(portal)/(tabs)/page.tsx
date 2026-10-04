"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bell, Truck } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandMark } from "@/components/driver-portal/brand-mark";
import { StatTile } from "@/components/driver-portal/stat-tile";
import { MissionCard } from "@/components/driver-portal/mission-card";
import { EmptyState } from "@/components/driver-portal/empty-state";
import { PushNotificationsPrompt } from "@/components/driver-portal/push-notifications-card";
import { useDriverSessionStore } from "@/stores/driver-session-store";
import { useDriverMissionsStore } from "@/stores/driver-missions-store";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

export default function DriverHomePage() {
  const profile = useDriverSessionStore((s) => s.profile);
  const { overview, fetchOverview } = useDriverMissionsStore();

  useEffect(() => {
    fetchOverview().catch(() => undefined);
  }, [fetchOverview]);

  const missions = overview ? [...overview.active, ...overview.upcoming, ...overview.recentCompleted] : [];

  return (
    <>
      <header className="bg-brand px-5 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-14 text-brand-foreground">
        <div className="relative">
          <BrandMark />
          <Link
            href="/driver/profile"
            aria-label="Notification settings"
            className="absolute top-0 right-0 rounded-full p-2 hover:bg-white/10"
          >
            <Bell className="size-6" />
          </Link>
        </div>
        <div className="mt-6 flex items-center gap-3">
          <Avatar className="size-12 border-2 border-white/30">
            <AvatarFallback className="bg-white/15 font-semibold text-brand-foreground">
              {initials(profile?.fullName ?? "")}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-lg font-semibold">Hello {profile?.fullName.split(" ")[0]}</p>
            <p className="text-sm text-brand-foreground/70">Drive safe!</p>
          </div>
        </div>
      </header>

      <div className="-mt-10 space-y-5 px-4">
        <div className="grid grid-cols-3 gap-3 rounded-2xl bg-card p-3 shadow-md">
          {overview ? (
            <>
              <StatTile value={overview.counts.active} label="Active missions" tone="primary" />
              <StatTile value={overview.counts.completed} label="Completed" tone="success" />
              <StatTile value={overview.counts.upcoming} label="Upcoming" tone="warning" />
            </>
          ) : (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)
          )}
        </div>

        <PushNotificationsPrompt />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">My missions</h2>
            <Link href="/driver/missions" className="text-sm font-medium text-primary">
              See all
            </Link>
          </div>

          {!overview && Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
          {overview && missions.length === 0 && <EmptyState icon={Truck} text="No missions assigned to you yet." />}
          {missions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
          ))}
        </section>
      </div>
    </>
  );
}
