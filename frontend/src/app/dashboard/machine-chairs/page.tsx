"use client";

import { useEffect } from "react";
import { useMachineChairsStore } from "@/stores/machine-chairs-store";
import { EnhancedMachineChairTable } from "@/components/machine-chairs/enhanced-machine-chair-table";

export default function MachineChairsPage() {
  const { fetchMachineChairs } = useMachineChairsStore();

  // Fetch machine chairs on component mount
  useEffect(() => {
    fetchMachineChairs();
  }, [fetchMachineChairs]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Machine Chairs Management</h1>
          <p className="text-muted-foreground">
            Manage machine chairs and their availability status
          </p>
        </div>
      </div>

      <EnhancedMachineChairTable />
    </section>
  );
}
