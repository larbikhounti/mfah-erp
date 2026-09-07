"use client";

import { useCallback, useEffect, useState } from "react";
import { DateRange } from "react-day-picker";
import RangeDate from "@/components/range-date";
import { Loader } from "@/components/loader";
import { Combobox } from "@/components/ui/combobox";
import { useRemoteComboboxOptions } from "@/hooks/use-remote-combobox-options";
import { useReportsStore } from "@/stores/reports-store";
import type { Client } from "@/stores/clients-store";
import { DriverReportTable } from "@/components/reports/driver-report-table";
import { TruckReportTable } from "@/components/reports/truck-report-table";

export default function ReportsPage() {
  const {
    driverReport,
    truckReport,
    loading,
    error,
    clientId,
    fetchReports,
    setDateRange,
    setClientId,
    clearError,
  } = useReportsStore();

  const [clientLabel, setClientLabel] = useState("");
  const mapClient = useCallback((c: Client) => ({ value: c.id.toString(), label: c.companyName }), []);
  const {
    options: clientOptions,
    loading: clientsLoading,
    search: searchClients,
  } = useRemoteComboboxOptions<Client>({ endpoint: "/clients", mapItem: mapClient });

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [error, clearError]);

  const handleDateChange = (range: DateRange | undefined) => {
    setDateRange(
      range?.from ? range.from.toISOString() : null,
      range?.to ? range.to.toISOString() : null
    );
  };

  return (
    <section className="flex flex-col gap-4 w-full px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Reports</h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Combobox
            value={clientId ? String(clientId) : ""}
            onChange={(value) => {
              setClientId(value ? Number(value) : null);
              setClientLabel(clientOptions.find((o) => o.value === value)?.label ?? "");
            }}
            onSearchChange={searchClients}
            loading={clientsLoading}
            selectedLabel={clientLabel}
            placeholder="Filter by client"
            searchPlaceholder="Search clients..."
            emptyText="No client found."
            className="w-[200px]"
            options={[{ value: "", label: "All Clients" }, ...clientOptions]}
          />
          <RangeDate onDateChange={handleDateChange} />
        </div>
      </div>

      {loading && driverReport.length === 0 && truckReport.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader size={24} />
        </div>
      ) : (
        <>
          <DriverReportTable data={driverReport} />
          <TruckReportTable data={truckReport} />
        </>
      )}
    </section>
  );
}
