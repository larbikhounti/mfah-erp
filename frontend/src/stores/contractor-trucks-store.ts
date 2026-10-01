import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface ContractorTruck {
  id: number;
  plateNumber: string;
  subcontractorId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateContractorTruckPayload {
  plateNumber: string;
  subcontractorId: number;
}

export interface UpdateContractorTruckPayload {
  plateNumber?: string;
  subcontractorId?: number;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  subcontractorId?: number;
  showArchived?: boolean;
}

export interface ContractorTrucksResponse {
  data: ContractorTruck[];
  total: number;
}

interface ContractorTrucksStore {
  contractorTrucks: ContractorTruck[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedContractorTrucks: number[];
  showArchived: boolean;

  currentPage: number;
  pageSize: number;
  totalPages: number;

  fetchContractorTrucks: (params?: FilterParams) => Promise<void>;
  createContractorTruck: (data: CreateContractorTruckPayload) => Promise<void>;
  updateContractorTruck: (id: number, data: UpdateContractorTruckPayload) => Promise<void>;
  deleteContractorTruck: (id: number) => Promise<void>;
  bulkDeleteContractorTrucks: (contractorTruckIds: number[]) => Promise<void>;
  restoreContractorTruck: (id: number) => Promise<void>;
  bulkRestoreContractorTrucks: (contractorTruckIds: number[]) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setShowArchived: (show: boolean) => void;

  selectContractorTruck: (id: number) => void;
  selectAllContractorTrucks: () => void;
  clearSelection: () => void;

  clearError: () => void;
}

export const useContractorTrucksStore = create<ContractorTrucksStore>((set, get) => ({
  contractorTrucks: [],
  total: 0,
  loading: false,
  error: null,
  selectedContractorTrucks: [],
  showArchived: false,

  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  fetchContractorTrucks: async (params: FilterParams = {}) => {
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
      if (params.subcontractorId) {
        apiParams.subcontractorId = params.subcontractorId;
      }

      const response = await axiosInstance.get<ContractorTrucksResponse>("/contractor-trucks", {
        params: apiParams,
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        contractorTrucks: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch contractor trucks",
        loading: false,
      });
    }
  },

  createContractorTruck: async (data: CreateContractorTruckPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/contractor-trucks/admin/create", data);
      await get().fetchContractorTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create contractor truck",
        loading: false,
      });
      throw error;
    }
  },

  updateContractorTruck: async (id: number, data: UpdateContractorTruckPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/contractor-trucks/admin/${id}`, data);
      await get().fetchContractorTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update contractor truck",
        loading: false,
      });
      throw error;
    }
  },

  deleteContractorTruck: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete(`/contractor-trucks/admin/${id}`);
      await get().fetchContractorTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete contractor truck",
        loading: false,
      });
      throw error;
    }
  },

  bulkDeleteContractorTrucks: async (contractorTruckIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete("/contractor-trucks/admin/bulk", { data: { contractorTruckIds } });
      set({ selectedContractorTrucks: [] });
      await get().fetchContractorTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete contractor trucks",
        loading: false,
      });
      throw error;
    }
  },

  restoreContractorTruck: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/contractor-trucks/admin/${id}/restore`);
      await get().fetchContractorTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore contractor truck",
        loading: false,
      });
      throw error;
    }
  },

  bulkRestoreContractorTrucks: async (contractorTruckIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/contractor-trucks/admin/bulk-restore", { contractorTruckIds });
      set({ selectedContractorTrucks: [] });
      await get().fetchContractorTrucks();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore contractor trucks",
        loading: false,
      });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ currentPage: Math.max(1, Math.floor(page)) });
    get().fetchContractorTrucks();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, Math.floor(pageSize)), currentPage: 1 });
    get().fetchContractorTrucks();
  },

  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchContractorTrucks({ showArchived: show });
  },

  selectContractorTruck: (id: number) => {
    const { selectedContractorTrucks } = get();
    set({
      selectedContractorTrucks: selectedContractorTrucks.includes(id)
        ? selectedContractorTrucks.filter((truckId) => truckId !== id)
        : [...selectedContractorTrucks, id],
    });
  },

  selectAllContractorTrucks: () => {
    const { contractorTrucks } = get();
    set({ selectedContractorTrucks: contractorTrucks.map((truck) => truck.id) });
  },

  clearSelection: () => set({ selectedContractorTrucks: [] }),

  clearError: () => set({ error: null }),
}));
