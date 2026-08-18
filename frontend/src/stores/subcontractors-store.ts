import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface Subcontractor {
  id: number;
  companyName: string;
  address: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  ice: string;
  bankName: string | null;
  bankRib: string | null;
  bankIban: string | null;
  bankSwift: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateSubcontractorPayload {
  companyName: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  ice: string;
  bankName?: string;
  bankRib?: string;
  bankIban?: string;
  bankSwift?: string;
}

export interface UpdateSubcontractorPayload extends Partial<CreateSubcontractorPayload> {}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  showArchived?: boolean;
}

export interface SubcontractorsResponse {
  data: Subcontractor[];
  total: number;
}

interface SubcontractorsStore {
  subcontractors: Subcontractor[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedSubcontractors: number[];
  showArchived: boolean;

  currentPage: number;
  pageSize: number;
  totalPages: number;

  fetchSubcontractors: (params?: FilterParams) => Promise<void>;
  createSubcontractor: (data: CreateSubcontractorPayload) => Promise<void>;
  updateSubcontractor: (id: number, data: UpdateSubcontractorPayload) => Promise<void>;
  deleteSubcontractor: (id: number) => Promise<void>;
  bulkDeleteSubcontractors: (subcontractorIds: number[]) => Promise<void>;
  restoreSubcontractor: (id: number) => Promise<void>;
  bulkRestoreSubcontractors: (subcontractorIds: number[]) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setShowArchived: (show: boolean) => void;

  selectSubcontractor: (id: number) => void;
  selectAllSubcontractors: () => void;
  clearSelection: () => void;

  clearError: () => void;
}

export const useSubcontractorsStore = create<SubcontractorsStore>((set, get) => ({
  subcontractors: [],
  total: 0,
  loading: false,
  error: null,
  selectedSubcontractors: [],
  showArchived: false,

  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  fetchSubcontractors: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize, showArchived } = get();
      const offset = Math.max(0, (currentPage - 1) * pageSize);

      const apiParams: any = {
        offset: Math.max(0, Math.floor(params.offset ?? offset)),
        limit: Math.max(1, Math.floor(params.limit ?? pageSize)),
        showArchived: params.showArchived ?? showArchived,
      };

      if (params.search && params.search.trim()) {
        apiParams.search = params.search.trim();
      }

      const response = await axiosInstance.get<SubcontractorsResponse>("/subcontractors", {
        params: apiParams,
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        subcontractors: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch subcontractors",
        loading: false,
      });
    }
  },

  createSubcontractor: async (data: CreateSubcontractorPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/subcontractors/admin/create", data);
      await get().fetchSubcontractors();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create subcontractor",
        loading: false,
      });
      throw error;
    }
  },

  updateSubcontractor: async (id: number, data: UpdateSubcontractorPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/subcontractors/admin/${id}`, data);
      await get().fetchSubcontractors();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update subcontractor",
        loading: false,
      });
      throw error;
    }
  },

  deleteSubcontractor: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete(`/subcontractors/admin/${id}`);
      await get().fetchSubcontractors();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete subcontractor",
        loading: false,
      });
      throw error;
    }
  },

  bulkDeleteSubcontractors: async (subcontractorIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete("/subcontractors/admin/bulk", { data: { subcontractorIds } });
      set({ selectedSubcontractors: [] });
      await get().fetchSubcontractors();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete subcontractors",
        loading: false,
      });
      throw error;
    }
  },

  restoreSubcontractor: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/subcontractors/admin/${id}/restore`);
      await get().fetchSubcontractors();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore subcontractor",
        loading: false,
      });
      throw error;
    }
  },

  bulkRestoreSubcontractors: async (subcontractorIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/subcontractors/admin/bulk-restore", { subcontractorIds });
      set({ selectedSubcontractors: [] });
      await get().fetchSubcontractors();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore subcontractors",
        loading: false,
      });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ currentPage: Math.max(1, Math.floor(page)) });
    get().fetchSubcontractors();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, Math.floor(pageSize)), currentPage: 1 });
    get().fetchSubcontractors();
  },

  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchSubcontractors({ showArchived: show });
  },

  selectSubcontractor: (id: number) => {
    const { selectedSubcontractors } = get();
    set({
      selectedSubcontractors: selectedSubcontractors.includes(id)
        ? selectedSubcontractors.filter((subId) => subId !== id)
        : [...selectedSubcontractors, id],
    });
  },

  selectAllSubcontractors: () => {
    const { subcontractors } = get();
    set({ selectedSubcontractors: subcontractors.map((s) => s.id) });
  },

  clearSelection: () => set({ selectedSubcontractors: [] }),

  clearError: () => set({ error: null }),
}));
