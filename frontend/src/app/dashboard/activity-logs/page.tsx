"use client";

import { useEffect, useState } from "react";
import { IconDownload, IconTrash, IconRefresh, IconLockAccess } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Loader } from "@/components/loader";
import { useActivityLogStore } from "@/stores/activity-log-store";

const LIMIT_OPTIONS = [50, 100, 200, 500];

export default function ActivityLogPage() {
  const {
    raw,
    totalCount,
    loading,
    clearing,
    downloading,
    forbidden,
    error,
    limit,
    setLimit,
    fetchLatest,
    clearLog,
    downloadLog,
  } = useActivityLogStore();

  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  useEffect(() => {
    fetchLatest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleClear = async () => {
    try {
      await clearLog();
      toast.success("Activity log cleared");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to clear activity log");
    } finally {
      setClearDialogOpen(false);
    }
  };

  const handleDownload = async () => {
    try {
      await downloadLog();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to download activity log");
    }
  };

  if (forbidden) {
    return (
      <section className="flex flex-col gap-4 w-full px-6 py-4">
        <h1 className="text-2xl font-semibold">Activity Log</h1>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
            <IconLockAccess className="h-10 w-10" />
            <p>Admins only. Your account doesn&apos;t have access to this page.</p>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Activity Log</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={String(limit)} onValueChange={(v) => setLimit(Number(v))}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((option) => (
                <SelectItem key={option} value={String(option)}>
                  Latest {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => fetchLatest()} disabled={loading}>
            <IconRefresh className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleDownload} disabled={downloading}>
            <IconDownload />
            Download full file
          </Button>
          <Button
            variant="destructive"
            onClick={() => setClearDialogOpen(true)}
            disabled={clearing || totalCount === 0}
          >
            <IconTrash />
            Clear
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>
            Showing {Math.min(limit, totalCount)} of {totalCount} recorded {totalCount === 1 ? "entry" : "entries"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader size={24} />
            </div>
          ) : raw ? (
            <pre className="max-h-[65vh] overflow-auto rounded-md border bg-muted/30 p-4 text-xs leading-relaxed whitespace-pre-wrap font-mono">
              {raw}
            </pre>
          ) : (
            <p className="py-16 text-center text-muted-foreground">No activity recorded yet.</p>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={clearDialogOpen} onOpenChange={setClearDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear the activity log?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes every recorded entry from the log file. This cannot be
              undone — download a copy first if you need to keep it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClear} className="bg-destructive hover:bg-destructive/90">
              Clear log
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
