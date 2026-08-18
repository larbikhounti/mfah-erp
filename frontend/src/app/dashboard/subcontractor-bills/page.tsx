"use client";

import { useEffect } from "react";
import { useSubcontractorBillsStore } from "@/stores/subcontractor-bills-store";
import { EnhancedSubcontractorBillTable } from "@/components/subcontractor-bill/enhanced-subcontractor-bill-table";

export default function SubcontractorBillsPage() {
  const { fetchBills } = useSubcontractorBillsStore();

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">Subcontractor Bills</h1>
          <p className="text-muted-foreground">
            Bills received from subcontractors for missions, and their payment status.
          </p>
        </div>
      </div>

      <EnhancedSubcontractorBillTable />
    </section>
  );
}
