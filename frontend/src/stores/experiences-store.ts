import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface MachineChair {
  id: number;
  name: string;
  status: number;
  ticketCount: number;
}

export interface CouponUsed {
  id: number;
  code: string;
  discount: number;
  usageCount: number;
}

export interface CommentUsed {
  id: number;
  content: string;
  createdAt: string;
  usageCount: number;
}

export interface ParentTicket {
  id: number;
  alias: string;
  chairName: string;
  machineName: string;
  machineAlias: string;
  gameName: string;
  gamePrice: number;
}

export interface DetailedTicket {
  id: number;
  alias: string;
  isPaid: boolean;
  paidWith: number | null;
  price: number | null;
  notes: string | null;
  chairId: number | null;
  chairName: string;
  createdAt: string;
  coupon: {
    id: number;
    code: string;
    discount: number;
  } | null;
  comments: Array<{
    id: number;
    content: string;
  }>;
  parentTicket: ParentTicket | null;
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
  deletedAt?: string | null;
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
  couponsUsed?: CouponUsed[];
  commentsUsed?: CommentUsed[];
  // Timing fields
  startedAt?: string | null;
  endedAt?: string | null;
  isNext?: boolean;
  isStarted?: boolean;
  isEnded?: boolean;
  isFractioned?: boolean;
  // Detailed tickets
  tickets?: DetailedTicket[];
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
  showArchived?: boolean;
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
  selectedExperiences: number[];
  showArchived: boolean;

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Actions
  fetchExperiences: (params?: FilterParams) => Promise<void>;
  deleteExperience: (id: number) => Promise<void>;
  bulkDeleteExperiences: (experienceIds: number[]) => Promise<void>;
  restoreExperience: (id: number) => Promise<void>;
  bulkRestoreExperiences: (experienceIds: number[]) => Promise<void>;
  getExperienceById: (id: number) => Promise<Experience | null>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Archive actions
  setShowArchived: (show: boolean) => void;

  // Selection actions
  selectExperience: (id: number) => void;
  selectAllExperiences: () => void;
  clearSelection: () => void;

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
  selectedExperiences: [],
  showArchived: false,

  // Pagination state
  currentPage: 1,
  pageSize: 10,
  totalPages: 0,

  // Fetch experiences with filtering
  fetchExperiences: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize, showArchived } = get();
      const offset = Math.max(0, (currentPage - 1) * pageSize);

      // Always send default values to ensure integers
      const finalOffset = Math.max(0, Math.floor(params.offset ?? offset));
      const finalLimit = Math.max(1, Math.floor(params.limit ?? pageSize));

      // Use axios params instead of URLSearchParams for better type handling
      const apiParams: any = {
        offset: finalOffset,
        limit: finalLimit,
        showArchived: params.showArchived ?? showArchived,
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

  // Delete experience (admin only)
  deleteExperience: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete(`/experiences/admin/${id}`);

      // Refresh the experiences list
      await get().fetchExperiences();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete experience",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk delete experiences (admin only)
  bulkDeleteExperiences: async (experienceIds: number[]) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete("/experiences/admin/bulk", {
        data: { experienceIds },
      });

      // Clear selection and refresh
      set({ selectedExperiences: [] });
      await get().fetchExperiences();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete experiences",
        loading: false,
      });
      throw error;
    }
  },

  // Restore experience (admin only)
  restoreExperience: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.patch(`/experiences/admin/${id}/restore`);

      // Refresh the experiences list
      await get().fetchExperiences();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore experience",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk restore experiences (admin only)
  bulkRestoreExperiences: async (experienceIds: number[]) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/experiences/admin/bulk-restore", {
        experienceIds: experienceIds,
      });

      // Clear selection and refresh
      set({ selectedExperiences: [] });
      await get().fetchExperiences();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore experiences",
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

  // Archive actions
  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchExperiences({ showArchived: show });
  },

  // Selection management
  selectExperience: (id: number) => {
    const { selectedExperiences } = get();
    const isSelected = selectedExperiences.includes(id);

    if (isSelected) {
      set({ selectedExperiences: selectedExperiences.filter((experienceId) => experienceId !== id) });
    } else {
      set({ selectedExperiences: [...selectedExperiences, id] });
    }
  },

  selectAllExperiences: () => {
    const { experiences } = get();
    set({ selectedExperiences: experiences.map((experience) => experience.id) });
  },

  clearSelection: () => {
    set({ selectedExperiences: [] });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
