"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import { toast } from "sonner";
import { axiosInstance } from "@/lib/utils";
import { exportToExcel, ExcelColumn } from "@/lib/excel-export";

interface ExportExcelButtonProps<T> {
  // List endpoint to fetch every matching record from, e.g. "/clients".
  endpoint: string;
  // Already-known total record count for the current filters (from the
  // domain store) — used as the fetch limit so this pulls everything in one
  // request instead of just the page currently loaded on screen.
  total: number;
  filenamePrefix: string;
  sheetName: string;
  mapRow: (item: T) => Record<string, string | number>;
  columns: ExcelColumn[];
  // Extra query params to keep in sync with the table's current filters
  // (e.g. { showArchived }).
  extraParams?: Record<string, unknown>;
}

export function ExportExcelButton<T>({
  endpoint,
  total,
  filenamePrefix,
  sheetName,
  mapRow,
  columns,
  extraParams,
}: ExportExcelButtonProps<T>) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    try {
      setExporting(true);
      const response = await axiosInstance.get<{ data: T[]; total: number }>(endpoint, {
        params: { offset: 0, limit: Math.max(total, 1), ...extraParams },
      });

      await exportToExcel(
        `${filenamePrefix}-${new Date().toISOString().slice(0, 10)}.xlsx`,
        sheetName,
        response.data.data.map(mapRow),
        columns,
      );
    } catch {
      toast.error(`Failed to export ${sheetName.toLowerCase()}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting || total === 0}>
      <IconDownload className="mr-2 size-4" />
      {exporting ? "Exporting..." : "Export Excel"}
    </Button>
  );
}
