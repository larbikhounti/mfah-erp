import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface Dom {
  id: number;
  name: string;
  address: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    Users: number;
    experiences: number;
    machines: number;
    tickets: number;
  };
}

export interface CreateDomPayload {
  name: string;
  address: string;
}

export interface UpdateDomPayload {
  name?: string;
  address?: string;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  domId?: number;
}

export interface DomsResponse {
  data: Dom[];
  total: number;
}

interface DomsStore {
  doms: Dom[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedDoms: number[];
  
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Actions
  fetchDoms: (params?: FilterParams) => Promise<void>;
  createDom: (domData: CreateDomPayload) => Promise<void>;
  updateDom: (id: number, domData: UpdateDomPayload) => Promise<void>;
  deleteDom: (id: number) => Promise<void>;
  bulkDeleteDoms: (domIds: number[]) => Promise<void>;
  getDomById: (id: number) => Promise<Dom | null>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Selection actions
  selectDom: (id: number) => void;
  selectAllDoms: () => void;
  clearSelection: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useDomsStore = create<DomsStore>((set, get) => ({
  doms: [],
  total: 0,
  loading: false,
  error: null,
  selectedDoms: [],
  
  // Pagination state
  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  // Fetch doms with filtering
  fetchDoms: async (params: FilterParams = {}) => {
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
      if (params.domId && params.domId > 0) {
        apiParams.domId = Math.floor(params.domId);
      }

      const response = await axiosInstance.get<DomsResponse>('/doms/admin/list/all', {
        params: apiParams
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        doms: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch DOMs",
        loading: false,
      });
    }
  },

  // Create a new dom (admin only)
  createDom: async (domData: CreateDomPayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/doms/admin/create", domData);

      // Refresh the doms list
      await get().fetchDoms();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create DOM",
        loading: false,
      });
      throw error;
    }
  },

  // Update dom (admin only)
  updateDom: async (id: number, domData: UpdateDomPayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.put(`/doms/admin/${id}`, domData);

      // Refresh the doms list
      await get().fetchDoms();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update DOM",
        loading: false,
      });
      throw error;
    }
  },

  // Delete dom (admin only)
  deleteDom: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete(`/doms/admin/${id}`);

      // Remove dom from local state
      const { doms } = get();
      set({
        doms: doms.filter((dom) => dom.id !== id),
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete DOM",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk delete doms (admin only)
  bulkDeleteDoms: async (domIds: number[]) => {
    try {
      set({ loading: true, error: null });

      const response = await axiosInstance.delete("/doms/admin/bulk", {
        data: { domIds },
      });

      // Remove deleted doms from local state
      const { doms } = get();
      set({
        doms: doms.filter((dom) => !domIds.includes(dom.id)),
        selectedDoms: [],
        loading: false,
      });

      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete DOMs",
        loading: false,
      });
      throw error;
    }
  },

  // Get dom by ID (admin only)
  getDomById: async (id: number): Promise<Dom | null> => {
    try {
      const response = await axiosInstance.get<Dom>(`/doms/admin/${id}`);
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch DOM" });
      return null;
    }
  },

  // Pagination actions
  setPage: (page: number) => {
    const validPage = Math.max(1, Math.floor(page));
    set({ currentPage: validPage });
    get().fetchDoms();
  },

  setPageSize: (pageSize: number) => {
    const validPageSize = Math.max(1, Math.floor(pageSize));
    set({ pageSize: validPageSize, currentPage: 1 });
    get().fetchDoms();
  },

  // Selection management
  selectDom: (id: number) => {
    const { selectedDoms } = get();
    const isSelected = selectedDoms.includes(id);

    if (isSelected) {
      set({ selectedDoms: selectedDoms.filter((domId) => domId !== id) });
    } else {
      set({ selectedDoms: [...selectedDoms, id] });
    }
  },

  selectAllDoms: () => {
    const { doms } = get();
    set({ selectedDoms: doms.map((dom) => dom.id) });
  },

  clearSelection: () => {
    set({ selectedDoms: [] });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
