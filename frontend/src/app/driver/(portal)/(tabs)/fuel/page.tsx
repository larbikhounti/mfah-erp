"use client";

import { useEffect } from "react";
import { Fuel } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { FuelEntryRow } from "@/components/driver-portal/fuel-entry-row";
import { EmptyState } from "@/components/driver-portal/empty-state";
import { formatMoney, formatNumber, pluralize } from "@/lib/driver/format";
import { useDriverFuelStore } from "@/stores/driver-fuel-store";

/** Every fuel entry the driver has recorded, across missions. */
export default function DriverFuelPage() {
  const { entries, totals, loading, fetchEntries } = useDriverFuelStore();

  useEffect(() => {
    fetchEntries().catch(() => undefined);
  }, [fetchEntries]);

  const totalsList = Object.entries(totals);

  return (
    <>
      <header className="bg-brand px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-6 text-brand-foreground">
        <h1 className="mb-4 text-xl font-bold">Fuel</h1>
        <div className="grid grid-cols-2 gap-3">
          {totalsList.length === 0 && <p className="col-span-2 text-sm text-brand-foreground/70">No fuel recorded yet.</p>}
          {totalsList.map(([currency, total]) => (
            <div key={currency} className="rounded-xl bg-white/10 p-3">
              <p className="text-xs text-brand-foreground/70">Total {currency}</p>
              <p className="text-lg font-bold">{formatMoney(total!.amount, currency)}</p>
              <p className="text-xs text-brand-foreground/70">{formatNumber(total!.litres)} L · {pluralize(total!.entries, "entry", "entries")}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="m-4 rounded-xl border bg-card px-4">
        {loading && entries.length === 0 && <Skeleton className="my-4 h-12" />}
        {!loading && entries.length === 0 && <EmptyState icon={Fuel} text="Fuel entries you add to a mission show up here." />}
        <div className="divide-y">
          {entries.map((entry) => (
            <FuelEntryRow key={entry.id} entry={entry} showMission />
          ))}
        </div>
      </div>
    </>
  );
}
