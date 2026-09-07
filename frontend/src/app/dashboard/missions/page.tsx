"use client";

import { useEffect } from "react";
import { useMissionsStore } from "@/stores/missions-store";
import { EnhancedMissionTable } from "@/components/mission/enhanced-mission-table";

export default function MissionsPage() {
  const { fetchMissions } = useMissionsStore();

  useEffect(() => {
    fetchMissions();
  }, [fetchMissions]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Missions</h1>
        </div>
      </div>

      <EnhancedMissionTable />
    </section>
  );
}
