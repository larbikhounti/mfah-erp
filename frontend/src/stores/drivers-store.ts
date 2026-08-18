import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export type DriverStatus = "ACTIF" | "EN_CONGE" | "EN_MISSION" | "INDISPONIBLE";

export interface Driver {
  id: number;
  fullName: string;
  cin: string;
  phone: string;
  status: DriverStatus;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateDriverPayload {
  fullName: string;
  cin: string;
  phone: string;
  status?: DriverStatus;
  note?: string;
}

export interface UpdateDriverPayload {
  fullName?: string;
  cin?: string;
  phone?: string;
  status?: DriverStatus;
  note?: string;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  status?: DriverStatus;
  showArchived?: boolean;
}

export interface DriversResponse {
  data: Driver[];
  total: number;
}

interface DriversStore {
  drivers: Driver[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedDrivers: number[];
  showArchived: boolean;

  currentPage: number;
  pageSize: number;
  totalPages: number;

  fetchDrivers: (params?: FilterParams) => Promise<void>;
  createDriver: (data: CreateDriverPayload) => Promise<void>;
  updateDriver: (id: number, data: UpdateDriverPayload) => Promise<void>;
  deleteDriver: (id: number) => Promise<void>;
  bulkDeleteDrivers: (driverIds: number[]) => Promise<void>;
  restoreDriver: (id: number) => Promise<void>;
  bulkRestoreDrivers: (driverIds: number[]) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setShowArchived: (show: boolean) => void;

  selectDriver: (id: number) => void;
  selectAllDrivers: () => void;
  clearSelection: () => void;

  clearError: () => void;
}

export const useDriversStore = create<DriversStore>((set, get) => ({
  drivers: [],
  total: 0,
  loading: false,
  error: null,
  selectedDrivers: [],
  showArchived: false,

  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  fetchDrivers: async (params: FilterParams = {}) => {
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

      const response = await axiosInstance.get<DriversResponse>("/drivers", {
        params: apiParams,
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        drivers: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch drivers",
        loading: false,
      });
    }
  },

  createDriver: async (data: CreateDriverPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/drivers/admin/create", data);
      await get().fetchDrivers();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create driver",
        loading: false,
      });
      throw error;
    }
  },

  updateDriver: async (id: number, data: UpdateDriverPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/drivers/admin/${id}`, data);
      await get().fetchDrivers();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update driver",
        loading: false,
      });
      throw error;
    }
  },

  deleteDriver: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete(`/drivers/admin/${id}`);
      await get().fetchDrivers();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete driver",
        loading: false,
      });
      throw error;
    }
  },

  bulkDeleteDrivers: async (driverIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete("/drivers/admin/bulk", { data: { driverIds } });
      set({ selectedDrivers: [] });
      await get().fetchDrivers();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete drivers",
        loading: false,
      });
      throw error;
    }
  },

  restoreDriver: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/drivers/admin/${id}/restore`);
      await get().fetchDrivers();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore driver",
        loading: false,
      });
      throw error;
    }
  },

  bulkRestoreDrivers: async (driverIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/drivers/admin/bulk-restore", { driverIds });
      set({ selectedDrivers: [] });
      await get().fetchDrivers();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore drivers",
        loading: false,
      });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ currentPage: Math.max(1, Math.floor(page)) });
    get().fetchDrivers();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, Math.floor(pageSize)), currentPage: 1 });
    get().fetchDrivers();
  },

  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchDrivers({ showArchived: show });
  },

  selectDriver: (id: number) => {
    const { selectedDrivers } = get();
    set({
      selectedDrivers: selectedDrivers.includes(id)
        ? selectedDrivers.filter((driverId) => driverId !== id)
        : [...selectedDrivers, id],
    });
  },

  selectAllDrivers: () => {
    const { drivers } = get();
    set({ selectedDrivers: drivers.map((driver) => driver.id) });
  },

  clearSelection: () => set({ selectedDrivers: [] }),

  clearError: () => set({ error: null }),
}));
