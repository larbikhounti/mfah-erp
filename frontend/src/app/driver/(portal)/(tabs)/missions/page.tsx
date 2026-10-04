"use client";

import { useEffect, useState } from "react";
import { Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MissionCard } from "@/components/driver-portal/mission-card";
import { EmptyState } from "@/components/driver-portal/empty-state";
import { MissionBucket, useDriverMissionsStore } from "@/stores/driver-missions-store";

const BUCKET_LABELS: Record<MissionBucket, string> = {
  active: "Active",
  upcoming: "Upcoming",
  completed: "Completed",
};

export default function DriverMissionsPage() {
  const [bucket, setBucket] = useState<MissionBucket>("active");
  const { missions, loading, fetchMissions } = useDriverMissionsStore();

  useEffect(() => {
    fetchMissions(bucket).catch(() => undefined);
  }, [bucket, fetchMissions]);

  return (
    <>
      <header className="sticky top-0 z-10 bg-brand px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-4 text-brand-foreground">
        <h1 className="mb-3 text-xl font-bold">Missions</h1>
        <Tabs value={bucket} onValueChange={(v) => setBucket(v as MissionBucket)}>
          <TabsList className="grid w-full grid-cols-3">
            {(Object.keys(BUCKET_LABELS) as MissionBucket[]).map((key) => (
              <TabsTrigger key={key} value={key}>
                {BUCKET_LABELS[key]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </header>

      <div className="space-y-3 p-4">
        {loading && missions.length === 0 &&
          Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        {!loading && missions.length === 0 && (
          <EmptyState icon={Truck} text={`No ${BUCKET_LABELS[bucket].toLowerCase()} missions.`} />
        )}
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </>
  );
}
