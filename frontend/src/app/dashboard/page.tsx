"use client";

import { useEffect, useState } from "react";
import { MachineStatsTable } from "@/components/machine-stats-table";
import { SectionCards } from "@/components/section-cards";
import { DomSelector } from "@/components/dom-selector";
import { DateRangePicker } from "@/components/date-range-picker";
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
  const { fetchStatistics, selectedDomId, dateRange, setDateRange, loading } =
    useStatisticsStore();

  const [machineStats, setMachineStats] = useState<MachineStats[]>([]);
  const [loadingMachines, setLoadingMachines] = useState(true);

  // Fetch machine stats with DOM and date range filters
  const fetchMachineStats = async () => {
    try {
      setLoadingMachines(true);

      // Build query parameters
      const params: any = {};
      if (dateRange?.from) {
        params.startDate = dateRange.from.toISOString();
      }
      if (dateRange?.to) {
        // Set to end of day for the "to" date
        const endDate = new Date(dateRange.to);
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
  };

  // Fetch all data
  const fetchAllData = () => {
    fetchStatistics(selectedDomId, dateRange);
    fetchMachineStats();
  };

  // Fetch data on initial load
  useEffect(() => {
    fetchAllData();
  }, []);

  // Re-fetch machine stats when DOM or date range changes
  useEffect(() => {
    fetchMachineStats();
  }, [selectedDomId, dateRange]);

  const handleRefresh = () => {
    fetchAllData();
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
