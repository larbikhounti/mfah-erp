"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DriverFile } from "@/stores/driver-missions-store";
import { useDriverFileUrl } from "./use-driver-file-url";

/** Preview of an uploaded file: the image itself, or a document icon. */
export function FileThumbnail({ file, className }: { file: DriverFile; className?: string }) {
  const isImage = file.mimeType?.startsWith("image/");
  const url = useDriverFileUrl(isImage ? file.id : null);
  const [broken, setBroken] = useState(false);

  return (
    <div className={cn("flex items-center justify-center overflow-hidden rounded-md bg-muted", className)}>
      {isImage && url && !broken ? (
        <img src={url} alt={file.label} className="size-full object-cover" onError={() => setBroken(true)} />
      ) : (
        <FileText className="size-6 text-muted-foreground" />
      )}
    </div>
  );
}
