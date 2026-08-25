"use client";

import { DataTable, TableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import { exportToExcel } from "@/lib/excel-export";
import type { DriverReportRow } from "@/stores/reports-store";

export function DriverReportTable({ data }: { data: DriverReportRow[] }) {
  const columns: TableColumn<DriverReportRow>[] = [
    {
      key: "driverName",
      label: "Driver",
      sortable: true,
    },
    {
      key: "missionCount",
      label: "Missions",
      sortable: true,
      render: (row) => <div className="font-medium">{row.missionCount}</div>,
    },
  ];

  const handleExport = () =>
    exportToExcel(
      `driver-report-${new Date().toISOString().slice(0, 10)}.xlsx`,
      "Driver Report",
      data.map((r) => ({ Driver: r.driverName, Missions: r.missionCount })),
      [
        { key: "Driver", header: "Driver" },
        { key: "Missions", header: "Missions" },
      ],
    );

  return (
    <DataTable
      title="Driver Report"
      data={data}
      columns={columns}
      searchKeys={["driverName"]}
      searchPlaceholder="Search drivers..."
      emptyMessage="No drivers found"
      getRowKey={(row) => String(row.driverId)}
      customHeader={
        <Button variant="outline" size="sm" onClick={handleExport} disabled={data.length === 0}>
          <IconDownload className="mr-2 size-4" />
          Export Excel
        </Button>
      }
    />
  );
}
