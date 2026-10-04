"use client";

import { driverApi } from "@/lib/driver/api";
import { useAuthedFileUrl } from "@/hooks/use-authed-file-url";

/** Object URL for one of the driver's own uploaded files. */
export function useDriverFileUrl(fileId: number | null | undefined) {
  return useAuthedFileUrl(driverApi, fileId ? `/driver/files/${fileId}/download` : null);
}
