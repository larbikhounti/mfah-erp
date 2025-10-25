"use client";

import { useEffect, useState, useCallback } from "react";
import { MachineStatsTable } from "@/components/machine-stats-table";
import { SectionCards } from "@/components/section-cards";
import { DomSelector } from "@/components/dom-selector";
import RangeDate from "@/components/range-date";
import { useStatisticsStore } from "@/stores/statistics-store";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";
import { DateRange } from "react-day-picker";
import { axiosInstance } from "@/lib/utils";

interface MachineStats {
  id: number;
  name: string;
  alias: string;
  domName: string;
  experiencesCount: number;
  totalRevenue: number;
}

export default function Page() {
  const { selectedDomId, setDateRange, loading } = useStatisticsStore();

  const [machineStats, setMachineStats] = useState<MachineStats[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [localDateRange, setLocalDateRange] = useState<DateRange | undefined>();

  // Fetch machine stats with DOM and date range filters
  const fetchMachineStats = useCallback(async () => {
    try {
      setLoadingMachines(true);

      // Build query parameters
      const params: any = {};
      if (localDateRange?.from) {
        params.startDate = localDateRange.from.toISOString();
      }
      if (localDateRange?.to) {
        // Set to end of day for the "to" date
        const endDate = new Date(localDateRange.to);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      }

      const response = await axiosInstance.get(
        `/statistics/machines/${selectedDomId}`,
        { params }
      );
      setMachineStats(response.data.data);
    } catch (error) {
      console.error("Error fetching machine stats:", error);
      setMachineStats([]);
    } finally {
      setLoadingMachines(false);
    }
  }, [selectedDomId, localDateRange]);

  // Initialize date range to today only once
  useEffect(() => {
    if (!isInitialized) {
      const today = new Date();
      const initialRange = { from: today, to: today };
      setLocalDateRange(initialRange);
      setDateRange(initialRange); // This will trigger fetchStatistics in the store
      setIsInitialized(true);
    }
  }, [isInitialized, setDateRange]);

  // Fetch machine stats when DOM or date range changes
  useEffect(() => {
    if (isInitialized && localDateRange) {
      fetchMachineStats();
    }
  }, [isInitialized, fetchMachineStats, localDateRange]);

  const handleRefresh = () => {
    if (localDateRange) {
      setDateRange(localDateRange); // This will trigger fetchStatistics in the store
      fetchMachineStats();
    }
  };

  const handleDateRangeChange = useCallback((range: DateRange | undefined) => {
    setLocalDateRange(range);
    setDateRange(range); // This will trigger fetchStatistics in the store
  }, [setDateRange]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="flex flex-col gap-4 px-4 lg:px-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <DomSelector />
              <RangeDate
                initialDate={localDateRange}
                onDateChange={handleDateRangeChange}
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
            {loadingMachines ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-sm text-gray-600">Loading machine statistics...</div>
              </div>
            ) : (
              <MachineStatsTable data={machineStats} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
