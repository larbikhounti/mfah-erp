"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, FileText, Info, X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "@/components/loader";
import { DriverPageHeader } from "@/components/driver-portal/driver-page-header";
import { PhotoPicker } from "@/components/driver-portal/photo-picker";
import { FileThumbnail } from "@/components/driver-portal/file-thumbnail";
import { ConfirmButton } from "@/components/driver-portal/confirm-button";
import { apiErrorMessage } from "@/lib/driver/api";
import { formatFileSize } from "@/lib/driver/format";
import { ClosureFileCategory, DriverFile, useDriverMissionsStore } from "@/stores/driver-missions-store";

function UploadedFile({ file, onRemove }: { file: DriverFile; onRemove: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-2">
      <FileThumbnail file={file} className="size-16 shrink-0" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="truncate font-medium">{file.fileName}</p>
        <p className="text-muted-foreground">{formatFileSize(file.fileSize)}</p>
      </div>
      <button type="button" onClick={onRemove} aria-label="Remove file" className="rounded-md p-2 hover:bg-muted">
        <X className="size-5" />
      </button>
    </div>
  );
}

export default function DriverClosurePage({ params }: { params: Promise<{ id: string }> }) {
  const missionId = Number(use(params).id);
  const router = useRouter();
  const { mission, fetchMission, uploadClosureFile, deleteClosureFile, completeMission } = useDriverMissionsStore();
  const [uploading, setUploading] = useState<ClosureFileCategory | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    fetchMission(missionId).catch(() => undefined);
  }, [missionId, fetchMission]);

  const current = mission?.id === missionId ? mission : null;
  const cmrFiles = current?.closureFiles.filter((f) => f.category === "CMR") ?? [];
  const odometer = current?.closureFiles.find((f) => f.category === "ODOMETER_PHOTO");

  const upload = async (category: ClosureFileCategory, file: File | null) => {
    if (!file) return;
    setUploading(category);
    try {
      await uploadClosureFile(missionId, category, file);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Upload failed"));
    } finally {
      setUploading(null);
    }
  };

  const remove = async (file: DriverFile) => {
    try {
      await deleteClosureFile(missionId, file.id);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <>
      <DriverPageHeader title="Delivery & Closure" backHref={`/driver/missions/${missionId}`} />

      {!current ? (
        <Skeleton className="m-4 h-96 rounded-xl" />
      ) : (
        <div className="space-y-4 p-4">
          <section className="space-y-5 rounded-xl border bg-card p-4">
            <div className="flex items-center gap-3">
              <FileText className="size-9 text-brand dark:text-primary" />
              <div>
                <h2 className="text-lg font-bold">Delivery & Closure</h2>
                <p className="text-sm text-muted-foreground">Upload the signed CMR and confirm the end of the mission.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Upload signed CMR *</Label>
              {cmrFiles.map((file) => (
                <UploadedFile key={file.id} file={file} onRemove={() => remove(file)} />
              ))}
              {uploading === "CMR" ? (
                <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed">
                  <Loader size={20} />
                </div>
              ) : (
                <PhotoPicker
                  file={null}
                  onChange={(file) => upload("CMR", file)}
                  allowPdf
                  label={cmrFiles.length ? "Add another file (PDF, JPG, PNG)" : "Add the signed CMR (PDF, JPG, PNG)"}
                  className="h-28 w-full"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label>Photo of odometer (optional)</Label>
              {odometer ? (
                <UploadedFile file={odometer} onRemove={() => remove(odometer)} />
              ) : uploading === "ODOMETER_PHOTO" ? (
                <div className="flex h-28 items-center justify-center rounded-lg border-2 border-dashed">
                  <Loader size={20} />
                </div>
              ) : (
                <PhotoPicker
                  file={null}
                  onChange={(file) => upload("ODOMETER_PHOTO", file)}
                  label="Add a photo"
                  className="h-28 w-full"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Comments (optional)</Label>
              <Textarea
                id="comment"
                placeholder="Add a comment..."
                value={comment}
                maxLength={1000}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
          </section>

          <ConfirmButton
            className="bg-success text-success-foreground hover:bg-success/90"
            disabled={cmrFiles.length === 0 || uploading !== null || current.status !== "IN_PROGRESS"}
            title="Complete this mission?"
            description="It will be sent to the operations team for review. You won't be able to change fuel or documents afterwards."
            confirmLabel="Complete mission"
            onConfirm={async () => {
              try {
                await completeMission(missionId, comment);
                router.replace(`/driver/missions/${missionId}/completed`);
              } catch (error) {
                toast.error(apiErrorMessage(error));
              }
            }}
          >
            <CheckCircle2 className="size-5" />
            Complete mission
          </ConfirmButton>

          <p className="flex gap-2 rounded-lg bg-success/10 p-3 text-xs text-success">
            <Info className="size-4 shrink-0" />
            {cmrFiles.length === 0
              ? "Upload the signed CMR to complete the mission."
              : "The mission will be marked as completed and sent to the operations team."}
          </p>
        </div>
      )}
    </>
  );
}
