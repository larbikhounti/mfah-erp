"use client";

import { useEffect } from "react";
import {
  useMachineTypesStore,
  type MachineType,
} from "@/stores/machine-types-store";
import { EnhancedMachineTypeTable } from "@/components/machine-types/enhanced-machine-type-table";

export default function MachineTypesPage() {
  const { fetchMachineTypes } = useMachineTypesStore();

  // Fetch machine types on component mount
  useEffect(() => {
    fetchMachineTypes();
  }, [fetchMachineTypes]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Machine Types Management</h1>
          <p className="text-muted-foreground">
            Manage your machine type categories and specifications
          </p>
        </div>
      </div>

      <EnhancedMachineTypeTable />
    </section>
  );
}
