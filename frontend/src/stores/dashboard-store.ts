import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export type MissionStatus = "PLANNED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
export type TruckStatus = "DISPO" | "EN_MISSION" | "MAINTENANCE" | "INDISPONIBLE";
export type DriverStatus = "ACTIF" | "EN_CONGE" | "EN_MISSION" | "INDISPONIBLE";

export interface CurrencyBreakdown {
  MAD: number;
  EUR: number;
}

export interface MissionSummaryRow {
  id: number;
  reference: string;
  clientId: number;
  clientName: string;
  transportType: string;
  executionMode: string;
  status: MissionStatus;
  clientPrice: string;
  currency: string;
  missionDate: string;
  clientInvoiceStatus: string | null;
  subcontractorBillStatus: string | null;
}

export interface DashboardSummary {
  missionTotal: number;
  missionsByStatus: Record<MissionStatus, number>;
  revenue: CurrencyBreakdown;
  outstanding: CurrencyBreakdown;
  subcontractorSpend: CurrencyBreakdown;
  subcontractorOutstanding: CurrencyBreakdown;
  fleetStatus: Record<TruckStatus, number>;
  driverStatus: Record<DriverStatus, number>;
  overdueClientInvoices: number;
  overdueSubcontractorBills: number;
  missions: {
    data: MissionSummaryRow[];
    total: number;
  };
}

interface DashboardStore {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;

  startDate: string | null;
  endDate: string | null;
  currentPage: number;
  pageSize: number;

  fetchSummary: () => Promise<void>;
  setDateRange: (startDate: string | null, endDate: string | null) => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  clearError: () => void;
}

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  summary: null,
  loading: false,
  error: null,

  startDate: null,
  endDate: null,
  currentPage: 1,
  pageSize: 10,

  fetchSummary: async () => {
    try {
      set({ loading: true, error: null });

      const { startDate, endDate, currentPage, pageSize } = get();
      const params: any = {
        offset: (currentPage - 1) * pageSize,
        limit: pageSize,
      };
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await axiosInstance.get<DashboardSummary>("/dashboard/summary", { params });

      set({ summary: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch dashboard summary",
        loading: false,
      });
    }
  },

  setDateRange: (startDate: string | null, endDate: string | null) => {
    set({ startDate, endDate, currentPage: 1 });
    get().fetchSummary();
  },

  setPage: (page: number) => {
    set({ currentPage: Math.max(1, Math.floor(page)) });
    get().fetchSummary();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, Math.floor(pageSize)), currentPage: 1 });
    get().fetchSummary();
  },

  clearError: () => set({ error: null }),
}));
