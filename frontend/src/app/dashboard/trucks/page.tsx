"use client";

import { useEffect } from "react";
import { useTrucksStore } from "@/stores/trucks-store";
import { EnhancedTruckTable } from "@/components/truck/enhanced-truck-table";

export default function TrucksPage() {
  const { fetchTrucks } = useTrucksStore();

  useEffect(() => {
    fetchTrucks();
  }, [fetchTrucks]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Trucks</h1>
          <p className="text-muted-foreground">
            Manage the fleet: plate numbers, PTAC, status, and insurance expiry.
          </p>
        </div>
      </div>

      <EnhancedTruckTable />
    </section>
  );
}
