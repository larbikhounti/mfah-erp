"use client";

import { useEffect } from "react";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { DomSelector } from "@/components/dom-selector";
import { DateRangePicker } from "@/components/date-range-picker";
import { useStatisticsStore } from "@/stores/statistics-store";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";
import { DateRange } from "react-day-picker";

import data from "./data.json";

export default function Page() {
  const { fetchStatistics, selectedDomId, dateRange, setDateRange, loading } =
    useStatisticsStore();

  // Fetch statistics on initial load
  useEffect(() => {
    fetchStatistics(selectedDomId, dateRange);
  }, []);

  const handleRefresh = () => {
    fetchStatistics(selectedDomId, dateRange);
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-4 px-4 lg:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <DomSelector />
              <DateRangePicker
                value={dateRange}
                onChange={handleDateRangeChange}
              />
            </div>
            <Button
              onClick={handleRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 w-fit"
            >
              <IconRefresh
                className={`size-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
          <SectionCards />
          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data} />
        </div>
      </div>
    </div>
  );
}
