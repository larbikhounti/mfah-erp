"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoPickerProps {
  file: File | null;
  onChange: (file: File | null) => void;
  label: string;
  /** Also accept PDFs (e.g. a scanned CMR), not only photos. */
  allowPdf?: boolean;
  className?: string;
}

/**
 * Dashed "Add a photo" tile that opens the phone camera directly
 * (`capture`), with a removable preview once a file is chosen.
 */
export function PhotoPicker({ file, onChange, label, allowPdf, className }: PhotoPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (file) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg border bg-muted", className)}>
        {preview ? (
          <img src={preview} alt={label} className="size-full object-cover" />
        ) : (
          <div className="flex size-full flex-col items-center justify-center gap-1 p-2 text-center text-xs">
            <FileText className="size-6" />
            <span className="line-clamp-2 break-all">{file.name}</span>
          </div>
        )}
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove"
          className="absolute top-1.5 right-1.5 rounded-full bg-black/60 p-1 text-white"
        >
          <X className="size-4" />
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-primary/40 p-3 text-center text-sm text-muted-foreground",
          className,
        )}
      >
        <Camera className="size-7 text-primary" />
        {label}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={allowPdf ? "image/*,application/pdf" : "image/*"}
        capture={allowPdf ? undefined : "environment"}
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = "";
        }}
      />
    </>
  );
}
