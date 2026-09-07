"use client";

import { useEffect } from "react";
import { useSubcontractorsStore } from "@/stores/subcontractors-store";
import { EnhancedSubcontractorTable } from "@/components/subcontractor/enhanced-subcontractor-table";

export default function SubcontractorsPage() {
  const { fetchSubcontractors } = useSubcontractorsStore();

  useEffect(() => {
    fetchSubcontractors();
  }, [fetchSubcontractors]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Subcontractors</h1>
        </div>
      </div>

      <EnhancedSubcontractorTable />
    </section>
  );
}
