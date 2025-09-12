"use client";

import { useEffect } from "react";
import { useMachinesStore, type Machine } from "@/stores/machines-store";
import { EnhancedMachineTable } from "@/components/machines/enhanced-machine-table";

export default function MachinesPage() {
  const { fetchMachines } = useMachinesStore();

  // Fetch machines on component mount
  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Machines Management</h1>
          <p className="text-muted-foreground">
            Manage your gaming machines and their configurations
          </p>
        </div>
      </div>

      <EnhancedMachineTable />
    </section>
  );
}
