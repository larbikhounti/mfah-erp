"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Check, CheckCircle2, Clock, FileText, Fuel, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BrandMark } from "@/components/driver-portal/brand-mark";
import { MissionStatusBadge } from "@/components/driver-portal/mission-status-badge";
import { MissionRoute } from "@/components/driver-portal/mission-route";
import { formatDate, formatMoney, formatNumber } from "@/lib/driver/format";
import { useDriverMissionsStore } from "@/stores/driver-missions-store";

export default function DriverMissionCompletedPage({ params }: { params: Promise<{ id: string }> }) {
  const missionId = Number(use(params).id);
  const { mission, fetchMission } = useDriverMissionsStore();

  useEffect(() => {
    fetchMission(missionId).catch(() => undefined);
  }, [missionId, fetchMission]);

  const current = mission?.id === missionId ? mission : null;
  const fuelTotals = Object.entries(current?.fuelTotals ?? {});
  const hasCmr = current?.closureFiles.some((f) => f.category === "CMR");
  const approved = current?.status === "FINISHED";

  return (
    <main className="flex min-h-svh flex-col bg-brand px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-brand-foreground">
      <BrandMark compact />

      <div className="my-8 flex flex-col items-center gap-3 text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-success ring-4 ring-white">
          <Check className="size-12 text-success-foreground" strokeWidth={3} />
        </span>
        <h1 className="text-2xl font-bold">Mission completed!</h1>
        <p className="text-brand-foreground/80">
          {approved ? "Approved by the operations team." : "Thank you for your work. Operations will review it."}
        </p>
      </div>

      {!current ? (
        <Skeleton className="h-72 rounded-xl" />
      ) : (
        <section className="space-y-4 rounded-xl bg-card p-4 text-card-foreground">
          <div className="flex items-center justify-between gap-2">
            <h2 className="truncate text-lg font-bold"># {current.reference}</h2>
            <MissionStatusBadge status={current.status} />
          </div>
          <MissionRoute from={{ place: current.loadingLocation }} to={{ place: current.deliveryLocation }} />
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <CalendarDays className="size-5 text-muted-foreground" />
              {formatDate(current.loadingConfirmedAt ?? current.missionDate)} →{" "}
              {formatDate(current.completedAt ?? current.missionDate)}
            </div>
            {current.truck && (
              <div className="flex items-center gap-3">
                <Truck className="size-5 text-muted-foreground" />
                Truck: {current.truck.plateNumber}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Fuel className="size-4" /> Total fuel
              </p>
              {fuelTotals.length === 0 && <p className="font-semibold">—</p>}
              {fuelTotals.map(([currency, total]) => (
                <div key={currency}>
                  <p className="font-bold">{formatMoney(total!.amount, currency)}</p>
                  <p className="text-xs text-muted-foreground">({formatNumber(total!.litres)} L)</p>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="size-4" /> CMR
              </p>
              {hasCmr ? (
                <p className="mt-1 flex items-center gap-1 text-sm font-medium text-success">
                  <CheckCircle2 className="size-4" /> Uploaded
                </p>
              ) : (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="size-4" /> Missing
                </p>
              )}
            </div>
          </div>

          <Button asChild size="lg" className="h-12 w-full">
            <Link href="/driver/missions">
              <ArrowLeft className="size-4" /> Back to missions
            </Link>
          </Button>
        </section>
      )}

      <p className="mt-auto pt-8 text-center text-xs tracking-[0.3em] text-brand-foreground/70">
        SAME ROADS
        <br />
        BIGGER OPPORTUNITIES
      </p>
    </main>
  );
}
