"use client";

import { useEffect } from "react";
import { useDomsStore, type Dom } from "@/stores/doms-store";
import { EnhancedDomTable } from "@/components/doms/enhanced-dom-table";

export default function DomsPage() {
  const { fetchDoms } = useDomsStore();

  // Fetch doms on component mount
  useEffect(() => {
    fetchDoms();
  }, [fetchDoms]);

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">DOMs Management</h1>
          <p className="text-muted-foreground">
            Manage your Digital Operations Management locations and facilities
          </p>
        </div>
      </div>

      <EnhancedDomTable />
    </section>
  );
}
