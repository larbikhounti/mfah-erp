"use client";

import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Loader } from "@/components/loader";
import { Download, Paperclip, Trash2, Upload } from "lucide-react";

export interface Attachment {
  id: number;
  label: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedAt: string;
}

interface AttachmentsPanelProps {
  /** URL segment for the owner's resource, e.g. "trucks", "client-invoices". */
  resourcePath: string;
  ownerId: number;
  ownerLabel?: string;
  trigger?: React.ReactNode;
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsPanel({
  resourcePath,
  ownerId,
  ownerLabel,
  trigger,
}: AttachmentsPanelProps) {
  const [open, setOpen] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [label, setLabel] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchAttachments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<Attachment[]>(
        `/${resourcePath}/${ownerId}/attachments`
      );
      setAttachments(response.data);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to load attachments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchAttachments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Choose a file first");
      return;
    }
    if (!label.trim()) {
      toast.error("Give the file a label so it stays recognizable");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("label", label.trim());

      await axiosInstance.post(
        `/${resourcePath}/admin/${ownerId}/attachments`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success("Attachment uploaded");
      setLabel("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchAttachments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload attachment");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId: number) => {
    try {
      await axiosInstance.delete(`/${resourcePath}/admin/attachments/${attachmentId}`);
      toast.success("Attachment deleted");
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete attachment");
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      setDownloadingId(attachment.id);
      const response = await axiosInstance.get(`/attachments/${attachment.id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = attachment.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to download attachment");
    } finally {
      setDownloadingId(null);
    }
  };

  const defaultTrigger = (
    <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
      <Paperclip className="h-4 w-4" />
      Attachments
    </Button>
  );

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Attachments{ownerLabel ? ` — ${ownerLabel}` : ""}</SheetTitle>
          <SheetDescription>
            Upload and manage files. Give each one a clear label so it's easy to recognize later.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleUpload} className="flex flex-col gap-3 px-4">
          <div className="grid gap-2">
            <Label htmlFor="attachment-label">Label *</Label>
            <Input
              id="attachment-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Insurance certificate 2027"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="attachment-file-input">File *</Label>
            <Input
              id="attachment-file-input"
              ref={fileInputRef}
              type="file"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" disabled={uploading} className="gap-2">
            {uploading ? (
              <>
                <Loader size={16} />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Upload
              </>
            )}
          </Button>
        </form>

        <div className="mt-2 flex flex-col gap-2 overflow-y-auto px-4 pb-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader size={20} />
            </div>
          ) : attachments.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              No attachments yet.
            </p>
          ) : (
            attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between gap-2 rounded-md border p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{attachment.label}</p>
                  <p className="text-muted-foreground truncate text-xs">
                    {attachment.fileName}
                    {attachment.fileSize ? ` · ${formatFileSize(attachment.fileSize)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    disabled={downloadingId === attachment.id}
                    onClick={() => handleDownload(attachment)}
                  >
                    {downloadingId === attachment.id ? (
                      <Loader size={14} />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive h-8 w-8"
                    onClick={() => handleDelete(attachment.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
