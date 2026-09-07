"use client";

import { useEffect } from "react";
import { useDriversStore } from "@/stores/drivers-store";
import { EnhancedDriverTable } from "@/components/driver/enhanced-driver-table";

export default function DriversPage() {
  const { fetchDrivers } = useDriversStore();

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Drivers</h1>
        </div>
      </div>

      <EnhancedDriverTable />
    </section>
  );
}
