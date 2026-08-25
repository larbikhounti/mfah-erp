import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface CurrencyBreakdown {
  MAD: number;
  EUR: number;
}

export interface DriverReportRow {
  driverId: number;
  driverName: string;
  missionCount: number;
  archived: boolean;
}

export interface TruckReportRow {
  truckId: number;
  plateNumber: string;
  truckType: string;
  missionCount: number;
  revenue: CurrencyBreakdown;
  archived: boolean;
}

interface ReportsStore {
  driverReport: DriverReportRow[];
  truckReport: TruckReportRow[];
  loading: boolean;
  error: string | null;

  startDate: string | null;
  endDate: string | null;
  clientId: number | null;

  fetchReports: () => Promise<void>;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setClientId: (clientId: number | null) => void;

  clearError: () => void;
}

export const useReportsStore = create<ReportsStore>((set, get) => ({
  driverReport: [],
  truckReport: [],
  loading: false,
  error: null,

  startDate: null,
  endDate: null,
  clientId: null,

  fetchReports: async () => {
    try {
      set({ loading: true, error: null });

      const { startDate, endDate, clientId } = get();
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (clientId) params.clientId = clientId;

      const [driversRes, trucksRes] = await Promise.all([
        axiosInstance.get<DriverReportRow[]>("/reports/drivers", { params }),
        axiosInstance.get<TruckReportRow[]>("/reports/trucks", { params }),
      ]);

      set({
        driverReport: driversRes.data,
        truckReport: trucksRes.data,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch reports",
        loading: false,
      });
    }
  },

  setDateRange: (startDate: string | null, endDate: string | null) => {
    set({ startDate, endDate });
    get().fetchReports();
  },

  setClientId: (clientId: number | null) => {
    set({ clientId });
    get().fetchReports();
  },

  clearError: () => set({ error: null }),
}));
