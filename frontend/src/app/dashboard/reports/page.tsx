"use client";

import { useEffect } from "react";
import { DateRange } from "react-day-picker";
import RangeDate from "@/components/range-date";
import { Loader } from "@/components/loader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useReportsStore } from "@/stores/reports-store";
import { useClientsStore } from "@/stores/clients-store";
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

  const { clients, fetchClients } = useClientsStore();

  useEffect(() => {
    fetchReports();
    fetchClients({ limit: 100 });
  }, [fetchReports, fetchClients]);

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
          <p className="text-muted-foreground">Driver and truck activity for a date range.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={clientId ? String(clientId) : "all"}
            onValueChange={(value) => setClientId(value === "all" ? null : Number(value))}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by client" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              {clients.map((c) => (
                <SelectItem key={c.id} value={c.id.toString()}>
                  {c.companyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
