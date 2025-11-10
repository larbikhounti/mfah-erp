import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";
import { DateRange } from "react-day-picker";

export interface DomStatistics {
  totalExperiences: number;
  fractionedExperiences: number;
  soldTickets: number;
  unsoldTickets: number;
  moneyMade: number;
  potentialRevenue: number;
  domId?: number;
  domName?: string;
}

export interface StatisticsResponse {
  success: boolean;
  data: DomStatistics;
  message?: string;
}

interface StatisticsStore {
  statistics: DomStatistics | null;
  loading: boolean;
  error: string | null;
  selectedDomId: string; // Can be number as string or "all"
  dateRange: DateRange | undefined;

  // Actions
  fetchStatistics: (
    domId: string,
    dateRange?: DateRange | undefined
  ) => Promise<void>;
  setSelectedDom: (domId: string) => void;
  setDateRange: (dateRange: DateRange | undefined) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useStatisticsStore = create<StatisticsStore>((set, get) => ({
  statistics: null,
  loading: false,
  error: null,
  selectedDomId: "all", // Default to "all"
  dateRange: undefined,

  // Fetch statistics for a specific DOM or all DOMs with optional date range
  fetchStatistics: async (
    domId: string,
    dateRange?: DateRange | undefined
  ) => {
    try {
      set({ loading: true, error: null });

      // Build query parameters
      const params: any = {};
      if (dateRange?.from) {
        // Set to start of day for the "from" date
        const startDate = new Date(dateRange.from);
        startDate.setHours(0, 0, 0, 0);
        params.startDate = startDate.toISOString();
      }
      if (dateRange?.to) {
        // Set to end of day for the "to" date
        const endDate = new Date(dateRange.to);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      }

      const response = await axiosInstance.get<StatisticsResponse>(
        `/statistics/dom/${domId}`,
        { params }
      );

      set({
        statistics: response.data.data,
        selectedDomId: domId,
        dateRange,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch statistics",
        loading: false,
      });
    }
  },

  // Set selected DOM and fetch its statistics
  setSelectedDom: (domId: string) => {
    const { dateRange } = get();
    set({ selectedDomId: domId });
    get().fetchStatistics(domId, dateRange);
  },

  // Set date range and refetch statistics
  setDateRange: (dateRange: DateRange | undefined) => {
    const { selectedDomId } = get();
    set({ dateRange });
    get().fetchStatistics(selectedDomId, dateRange);
  },

  // Utility actions
  clearError: () => set({ error: null }),
  setLoading: (loading: boolean) => set({ loading }),
}));
