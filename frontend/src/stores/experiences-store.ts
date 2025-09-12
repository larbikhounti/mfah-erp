import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface MachineChair {
  id: number;
  name: string;
  status: number;
  ticketCount: number;
}

export interface Experience {
  id: number;
  machineId: number;
  machine: string;
  gameId: number;
  game: string;
  domeId: number;
  dome: string;
  createdAt: string;
  updatedAt: string;
  // Extended information
  machineType: string;
  machineChairs: MachineChair[];
  gamePrice: number;
  gamePlayTime: number;
  gameType: string;
  requiredMachineType: string;
  domeAddress: string;
  ticketCount: number;
  // Basic ticket summary
  ticketSummary: {
    totalCount: number;
    paidCount: number;
    unpaidCount: number;
    totalRevenue: number;
  };
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  experienceId?: number;
  machineId?: number;
  gameId?: number;
  domeId?: number;
  startDate?: string;
  endDate?: string;
}

export interface ExperiencesResponse {
  data: Experience[];
  total: number;
}

interface ExperiencesStore {
  experiences: Experience[];
  total: number;
  loading: boolean;
  error: string | null;

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Actions
  fetchExperiences: (params?: FilterParams) => Promise<void>;
  getExperienceById: (id: number) => Promise<Experience | null>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useExperiencesStore = create<ExperiencesStore>((set, get) => ({
  experiences: [],
  total: 0,
  loading: false,
  error: null,

  // Pagination state
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,

  // Fetch experiences with filtering
  fetchExperiences: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize } = get();
      const offset = Math.max(0, (currentPage - 1) * pageSize);

      // Always send default values to ensure integers
      const finalOffset = Math.max(0, Math.floor(params.offset ?? offset));
      const finalLimit = Math.max(1, Math.floor(params.limit ?? pageSize));

      // Use axios params instead of URLSearchParams for better type handling
      const apiParams: any = {
        offset: finalOffset,
        limit: finalLimit,
      };

      if (params.search && params.search.trim()) {
        apiParams.search = params.search.trim();
      }
      if (params.experienceId && params.experienceId > 0) {
        apiParams.experienceId = Math.floor(params.experienceId);
      }
      if (params.machineId && params.machineId > 0) {
        apiParams.machineId = Math.floor(params.machineId);
      }
      if (params.gameId && params.gameId > 0) {
        apiParams.gameId = Math.floor(params.gameId);
      }
      if (params.domeId && params.domeId > 0) {
        apiParams.domeId = Math.floor(params.domeId);
      }
      if (params.startDate) {
        apiParams.startDate = params.startDate;
      }
      if (params.endDate) {
        apiParams.endDate = params.endDate;
      }

      const response = await axiosInstance.get<ExperiencesResponse>(
        "/experiences/all",
        {
          params: apiParams,
        }
      );

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        experiences: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch experiences",
        loading: false,
      });
      throw error;
    }
  },

  // Get experience by ID
  getExperienceById: async (id: number): Promise<Experience | null> => {
    try {
      set({ loading: true, error: null });

      const response = await axiosInstance.get<Experience>(
        `/experiences/${id}`
      );

      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch experience",
        loading: false,
      });
      return null;
    }
  },

  // Pagination actions
  setPage: (page: number) => {
    set({ currentPage: Math.max(1, page) });
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, pageSize), currentPage: 1 });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
