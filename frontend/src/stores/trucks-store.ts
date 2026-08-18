import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export type TruckStatus = "DISPO" | "EN_MISSION" | "MAINTENANCE" | "INDISPONIBLE";

export interface Truck {
  id: number;
  plateNumber: string;
  type: string;
  ptac: number;
  status: TruckStatus;
  note: string | null;
  insuranceExpiry: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateTruckPayload {
  plateNumber: string;
  type: string;
  ptac: number;
  status?: TruckStatus;
  note?: string;
  insuranceExpiry: string;
}

export interface UpdateTruckPayload {
  plateNumber?: string;
  type?: string;
  ptac?: number;
  status?: TruckStatus;
  note?: string;
  insuranceExpiry?: string;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  status?: TruckStatus;
  showArchived?: boolean;
}

export interface TrucksResponse {
  data: Truck[];
  total: number;
}

interface TrucksStore {
  trucks: Truck[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedTrucks: number[];
  showArchived: boolean;

  currentPage: number;
  pageSize: number;
  totalPages: number;

  fetchTrucks: (params?: FilterParams) => Promise<void>;
  createTruck: (data: CreateTruckPayload) => Promise<void>;
  updateTruck: (id: number, data: UpdateTruckPayload) => Promise<void>;
  deleteTruck: (id: number) => Promise<void>;
  bulkDeleteTrucks: (truckIds: number[]) => Promise<void>;
  restoreTruck: (id: number) => Promise<void>;
  bulkRestoreTrucks: (truckIds: number[]) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setShowArchived: (show: boolean) => void;

  selectTruck: (id: number) => void;
  selectAllTrucks: () => void;
  clearSelection: () => void;

  clearError: () => void;
}

export const useTrucksStore = create<TrucksStore>((set, get) => ({
  trucks: [],
  total: 0,
  loading: false,
  error: null,
  selectedTrucks: [],
  showArchived: false,

  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  fetchTrucks: async (params: FilterParams = {}) => {
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
      if (params.status) {
        apiParams.status = params.status;
      }

      const response = await axiosInstance.get<TrucksResponse>("/trucks", {
        params: apiParams,
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        trucks: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch trucks",
        loading: false,
      });
    }
  },

  createTruck: async (data: CreateTruckPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/trucks/admin/create", data);
      await get().fetchTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create truck",
        loading: false,
      });
      throw error;
    }
  },

  updateTruck: async (id: number, data: UpdateTruckPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/trucks/admin/${id}`, data);
      await get().fetchTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update truck",
        loading: false,
      });
      throw error;
    }
  },

  deleteTruck: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete(`/trucks/admin/${id}`);
      await get().fetchTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete truck",
        loading: false,
      });
      throw error;
    }
  },

  bulkDeleteTrucks: async (truckIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete("/trucks/admin/bulk", { data: { truckIds } });
      set({ selectedTrucks: [] });
      await get().fetchTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete trucks",
        loading: false,
      });
      throw error;
    }
  },

  restoreTruck: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/trucks/admin/${id}/restore`);
      await get().fetchTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore truck",
        loading: false,
      });
      throw error;
    }
  },

  bulkRestoreTrucks: async (truckIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/trucks/admin/bulk-restore", { truckIds });
      set({ selectedTrucks: [] });
      await get().fetchTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore trucks",
        loading: false,
      });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ currentPage: Math.max(1, Math.floor(page)) });
    get().fetchTrucks();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, Math.floor(pageSize)), currentPage: 1 });
    get().fetchTrucks();
  },

  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchTrucks({ showArchived: show });
  },

  selectTruck: (id: number) => {
    const { selectedTrucks } = get();
    set({
      selectedTrucks: selectedTrucks.includes(id)
        ? selectedTrucks.filter((truckId) => truckId !== id)
        : [...selectedTrucks, id],
    });
  },

  selectAllTrucks: () => {
    const { trucks } = get();
    set({ selectedTrucks: trucks.map((truck) => truck.id) });
  },

  clearSelection: () => set({ selectedTrucks: [] }),

  clearError: () => set({ error: null }),
}));
