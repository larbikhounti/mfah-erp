"use client";

import { useEffect } from "react";
import { useContractorTrucksStore } from "@/stores/contractor-trucks-store";
import { EnhancedContractorTruckTable } from "@/components/contractor-truck/enhanced-contractor-truck-table";

export default function ContractorTrucksPage() {
  const { fetchContractorTrucks } = useContractorTrucksStore();

  useEffect(() => {
    fetchContractorTrucks();
  }, [fetchContractorTrucks]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Contractor Trucks</h1>
        </div>
      </div>

      <EnhancedContractorTruckTable />
    </section>
  );
}
