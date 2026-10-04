"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Box, FileText, Fuel, Package, Truck, Weight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { DriverPageHeader } from "@/components/driver-portal/driver-page-header";
import { MissionStatusBadge } from "@/components/driver-portal/mission-status-badge";
import { MissionRoute } from "@/components/driver-portal/mission-route";
import { MissionTimeline } from "@/components/driver-portal/mission-timeline";
import { ActionCard } from "@/components/driver-portal/action-card";
import { ConfirmButton } from "@/components/driver-portal/confirm-button";
import { apiErrorMessage } from "@/lib/driver/api";
import { formatDate, formatDateTime, formatNumber } from "@/lib/driver/format";
import { useDriverMissionsStore } from "@/stores/driver-missions-store";

function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-3">
      <Icon className="size-5 shrink-0 text-muted-foreground" />
      <span>
        {label}: {value}
      </span>
    </div>
  );
}

export default function DriverMissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const missionId = Number(use(params).id);
  const router = useRouter();
  const { mission, fetchMission, confirmLoading } = useDriverMissionsStore();

  useEffect(() => {
    fetchMission(missionId).catch((error) => {
      toast.error(apiErrorMessage(error, "Mission not found"));
      router.replace("/driver/missions");
    });
  }, [missionId, fetchMission, router]);

  const current = mission?.id === missionId ? mission : null;

  return (
    <>
      <DriverPageHeader title="Mission details" backHref="/driver" />

      {!current ? (
        <div className="space-y-4 p-4">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      ) : (
        <div className="space-y-4 p-4">
          <section className="space-y-5 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="truncate text-xl font-bold"># {current.reference}</h2>
              <MissionStatusBadge status={current.status} />
            </div>

            <MissionRoute
              from={{ place: current.loadingLocation, detail: `Loading: ${formatDateTime(current.missionDate)}` }}
              to={{
                place: current.deliveryLocation,
                detail: current.expectedDeliveryDate
                  ? `Expected delivery: ${formatDate(current.expectedDeliveryDate)}`
                  : undefined,
              }}
            />

            <div className="space-y-3 text-sm">
              <InfoRow icon={Truck} label="Truck" value={current.truck?.plateNumber ?? null} />
              <InfoRow icon={Package} label="Goods" value={current.goods} />
              <InfoRow
                icon={Weight}
                label="Weight"
                value={current.weightKg !== null ? `${formatNumber(current.weightKg)} kg` : null}
              />
              <InfoRow icon={FileText} label="Reference" value={current.clientReference} />
            </div>

            <div className="border-t pt-5">
              <MissionTimeline mission={current} />
            </div>
          </section>

          {current.status === "PLANNED" && (
            <ConfirmButton
              title="Confirm loading?"
              description="The mission will start and the operations team will see your truck on the road."
              confirmLabel="Confirm loading"
              onConfirm={async () => {
                try {
                  await confirmLoading(current.id);
                  toast.success("Loading confirmed. Drive safe!");
                } catch (error) {
                  toast.error(apiErrorMessage(error));
                }
              }}
            >
              <Box className="size-5" />
              Confirm loading
            </ConfirmButton>
          )}

          {current.status === "IN_PROGRESS" && (
            <>
              <ActionCard
                href={`/driver/missions/${current.id}/fuel`}
                icon={Fuel}
                title="Add fuel"
                subtitle="Record your fuel purchases"
              />
              <ActionCard
                href={`/driver/missions/${current.id}/closure`}
                icon={FileText}
                title="Delivery & Closure"
                subtitle="Upload CMR and finish mission"
              />
            </>
          )}

          {(current.status === "PENDING_REVIEW" || current.status === "FINISHED") && (
            <ActionCard
              href={`/driver/missions/${current.id}/completed`}
              icon={FileText}
              title="Mission summary"
              subtitle="Fuel and documents sent to operations"
            />
          )}
        </div>
      )}
    </>
  );
}
