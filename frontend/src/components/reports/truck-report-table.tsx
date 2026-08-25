"use client";

import { DataTable, TableColumn } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { IconDownload } from "@tabler/icons-react";
import { exportToExcel } from "@/lib/excel-export";
import type { TruckReportRow } from "@/stores/reports-store";

export function TruckReportTable({ data }: { data: TruckReportRow[] }) {
  const columns: TableColumn<TruckReportRow>[] = [
    {
      key: "plateNumber",
      label: "Truck",
      sortable: true,
    },
    {
      key: "truckType",
      label: "Type",
      sortable: true,
    },
    {
      key: "missionCount",
      label: "Missions",
      sortable: true,
      render: (row) => <div className="font-medium">{row.missionCount}</div>,
    },
    {
      key: "revenueMAD",
      label: "Total MAD",
      sortable: true,
      sortFunction: (a, b) => a.revenue.MAD - b.revenue.MAD,
      render: (row) => <div className="text-sm">{row.revenue.MAD.toLocaleString()}</div>,
    },
    {
      key: "revenueEUR",
      label: "Total EUR",
      sortable: true,
      sortFunction: (a, b) => a.revenue.EUR - b.revenue.EUR,
      render: (row) => <div className="text-sm">{row.revenue.EUR.toLocaleString()}</div>,
    },
  ];

  const handleExport = () =>
    exportToExcel(
      `truck-report-${new Date().toISOString().slice(0, 10)}.xlsx`,
      "Truck Report",
      data.map((r) => ({
        Truck: r.plateNumber,
        Type: r.truckType,
        Missions: r.missionCount,
        "Total MAD": r.revenue.MAD,
        "Total EUR": r.revenue.EUR,
      })),
      [
        { key: "Truck", header: "Truck" },
        { key: "Type", header: "Type" },
        { key: "Missions", header: "Missions" },
        { key: "Total MAD", header: "Total MAD" },
        { key: "Total EUR", header: "Total EUR" },
      ],
    );

  return (
    <DataTable
      title="Truck Report"
      data={data}
      columns={columns}
      searchKeys={["plateNumber", "truckType"]}
      searchPlaceholder="Search trucks..."
      emptyMessage="No trucks found"
      getRowKey={(row) => String(row.truckId)}
      customHeader={
        <Button variant="outline" size="sm" onClick={handleExport} disabled={data.length === 0}>
          <IconDownload className="mr-2 size-4" />
          Export Excel
        </Button>
      }
    />
  );
}
