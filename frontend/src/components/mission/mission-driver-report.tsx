"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, FileText, Fuel, ImageOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { axiosInstance } from "@/lib/utils";
import { useAuthedFileUrl } from "@/hooks/use-authed-file-url";
import { useMissionsStore, type Mission } from "@/stores/missions-store";
import {
  MissionFile,
  useMissionReviewStore,
} from "@/stores/mission-review-store";

const formatDateTime = (value: string) => new Date(value).toLocaleString();

const CATEGORY_LABEL: Record<NonNullable<MissionFile["category"]>, string> = {
  CMR: "Signed CMR",
  ODOMETER_PHOTO: "Odometer photo",
  FUEL_RECEIPT: "Fuel receipt",
};

async function downloadFile(file: MissionFile) {
  try {
    const { data } = await axiosInstance.get(
      `/attachments/${file.id}/download`,
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.fileName;
    link.click();
    URL.revokeObjectURL(url);
  } catch {
    toast.error("Failed to download file");
  }
}

/** Image preview (or document icon) that downloads the file on click. */
function FilePreview({
  file,
  className,
}: {
  file: MissionFile;
  className: string;
}) {
  const isImage = !!file.mimeType?.startsWith("image/");
  const url = useAuthedFileUrl(
    axiosInstance,
    isImage ? `/attachments/${file.id}/download` : null,
  );

  return (
    <button
      type="button"
      onClick={() => downloadFile(file)}
      title={`Download ${file.fileName}`}
      className={`flex items-center justify-center overflow-hidden rounded-md border bg-muted ${className}`}
    >
      {isImage && url ? (
        <img src={url} alt={file.label} className="size-full object-cover" />
      ) : (
        <FileText className="size-6 text-muted-foreground" />
      )}
    </button>
  );
}

function Step({ label, at }: { label: string; at: string | null }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={at ? "font-medium" : "text-muted-foreground"}>
        {label}
      </span>
      <span className="text-muted-foreground">
        {at ? formatDateTime(at) : "—"}
      </span>
    </div>
  );
}

/**
 * The driver-portal side of an IN_HOUSE mission: workflow timestamps, the
 * CMR / odometer files, fuel entries with receipts, the driver's comment,
 * and the Approve action while the mission is PENDING_REVIEW.
 */
export function MissionDriverReport({
  mission,
  onApproved,
}: {
  mission: Mission;
  onApproved: () => void;
}) {
  const { fuelEntries, fuelTotals, files, loading, fetchReport } =
    useMissionReviewStore();
  const { approveMission } = useMissionsStore();
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    fetchReport(mission.id).catch(() =>
      toast.error("Failed to load the driver report"),
    );
  }, [mission.id, fetchReport]);

  const closureFiles = files.filter(
    (f) => f.category === "CMR" || f.category === "ODOMETER_PHOTO",
  );
  const hasCmr = closureFiles.some((f) => f.category === "CMR");

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Driver report</h3>
        {mission.status === "PENDING_REVIEW" && (
          <Badge
            variant="outline"
            className="border-warning bg-warning/15 text-warning-foreground"
          >
            Waiting for your review
          </Badge>
        )}
      </div>

      <div className="space-y-1.5 rounded-md border p-3">
        <Step label="Loading confirmed" at={mission.loadingConfirmedAt} />
        <Step label="Delivery completed" at={mission.completedAt} />
        <Step label="Approved by operations" at={mission.reviewedAt} />
      </div>

      {mission.completionComment && (
        <div className="rounded-md bg-muted p-3 text-sm">
          <p className="mb-1 text-xs text-muted-foreground">Driver comment</p>
          {mission.completionComment}
        </div>
      )}

      <div className="space-y-2">
        <p className="text-sm font-medium">Documents</p>
        {!loading && closureFiles.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No CMR or odometer photo uploaded yet.
          </p>
        )}
        <div className="grid grid-cols-2 gap-2">
          {closureFiles.map((file) => (
            <div key={file.id} className="space-y-1">
              <FilePreview file={file} className="h-28 w-full" />
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Download className="size-3" />
                {file.category ? CATEGORY_LABEL[file.category] : file.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-medium">
            <Fuel className="size-4" /> Fuel
          </p>
          <span className="text-sm text-muted-foreground">
            {Object.entries(fuelTotals)
              .map(
                ([currency, t]) =>
                  `${t!.amount} ${currency} · ${Number(t!.litres)} L`,
              )
              .join("  |  ") || "No fuel recorded"}
          </span>
        </div>
        {fuelEntries.length > 0 && (
          <div className="divide-y rounded-md border">
            {fuelEntries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-2 text-sm"
              >
                {entry.receipt ? (
                  <FilePreview
                    file={entry.receipt}
                    className="size-10 shrink-0"
                  />
                ) : (
                  <span
                    title="No receipt photo"
                    className="flex size-10 shrink-0 items-center justify-center rounded-md border border-dashed text-warning-foreground"
                  >
                    <ImageOff className="size-4" />
                  </span>
                )}
                <div className="flex-1">
                  <p>
                    {Number(entry.litres)} L × {Number(entry.unitPrice)}{" "}
                    {entry.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateTime(entry.createdAt)} ·{" "}
                    {entry.odometerKm.toLocaleString()} km
                  </p>
                </div>
                <span className="font-medium">
                  {entry.totalAmount} {entry.currency}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {mission.status === "PENDING_REVIEW" && (
        <>
          <Button className="w-full" onClick={() => setConfirmOpen(true)}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Approve delivery
          </Button>
          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Approve {mission.reference}?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {hasCmr
                    ? "The mission will be marked as finished."
                    : "No CMR is attached. Approve anyway? The mission will be marked as finished."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    try {
                      await approveMission(mission.id);
                      toast.success("Mission approved");
                      onApproved();
                    } catch (error: any) {
                      toast.error(
                        error.response?.data?.message ||
                          "Failed to approve mission",
                      );
                    }
                  }}
                >
                  Approve
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </div>
  );
}
