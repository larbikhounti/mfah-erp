import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface Machine {
  id: number;
  name: string;
  machineTypeId?: number | null;
  domeId?: number | null;
  createdAt: string;
  updatedAt: string;
  machineType?: {
    id: number;
    name: string;
  } | null;
  dome?: {
    id: number;
    name: string;
  } | null;
  chairsCount?: number;
  experiencesCount?: number;
}

export interface CreateMachinePayload {
  name: string;
  machineTypeId?: number;
  domeId?: number;
  chairsNumber?: number;
}

export interface UpdateMachinePayload {
  name?: string;
  machineTypeId?: number;
  domeId?: number;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  machineId?: number;
  machineTypeId?: number;
  domeId?: number;
}

export interface MachinesResponse {
  data: Machine[];
  total: number;
}

interface MachinesStore {
  machines: Machine[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedMachines: number[];

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Actions
  fetchMachines: (params?: FilterParams) => Promise<void>;
  createMachine: (machineData: CreateMachinePayload) => Promise<void>;
  updateMachine: (
    id: number,
    machineData: UpdateMachinePayload
  ) => Promise<void>;
  deleteMachine: (id: number) => Promise<void>;
  bulkDeleteMachines: (machineIds: number[]) => Promise<void>;
  getMachineById: (id: number) => Promise<Machine | null>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Selection actions
  selectMachine: (id: number) => void;
  selectAllMachines: () => void;
  clearSelection: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMachinesStore = create<MachinesStore>((set, get) => ({
  machines: [],
  total: 0,
  loading: false,
  error: null,
  selectedMachines: [],

  // Pagination state
  currentPage: 1,
  pageSize: 13,
  totalPages: 0,

  // Fetch machines with filtering
  fetchMachines: async (params: FilterParams = {}) => {
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
      if (params.machineId && params.machineId > 0) {
        apiParams.machineId = Math.floor(params.machineId);
      }
      if (params.machineTypeId && params.machineTypeId > 0) {
        apiParams.machineTypeId = Math.floor(params.machineTypeId);
      }
      if (params.domeId && params.domeId > 0) {
        apiParams.domeId = Math.floor(params.domeId);
      }

      const response = await axiosInstance.get<MachinesResponse>(
        "/machines/admin/list/all",
        {
          params: apiParams,
        }
      );

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        machines: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch machines",
        loading: false,
      });
    }
  },

  // Create a new machine (admin only)
  createMachine: async (machineData: CreateMachinePayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/machines/admin/create", machineData);

      // Refresh the machines list
      await get().fetchMachines();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create machine",
        loading: false,
      });
      throw error;
    }
  },

  // Update machine (admin only)
  updateMachine: async (id: number, machineData: UpdateMachinePayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.put(`/machines/admin/${id}`, machineData);

      // Refresh the machines list
      await get().fetchMachines();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update machine",
        loading: false,
      });
      throw error;
    }
  },

  // Delete machine (admin only)
  deleteMachine: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete(`/machines/admin/${id}`);

      // Refresh the machines list
      await get().fetchMachines();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete machine",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk delete machines (admin only)
  bulkDeleteMachines: async (machineIds: number[]) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete("/machines/admin", {
        data: { ids: machineIds },
      });

      // Clear selection and refresh
      set({ selectedMachines: [] });
      await get().fetchMachines();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete machines",
        loading: false,
      });
      throw error;
    }
  },

  // Get machine by ID
  getMachineById: async (id: number) => {
    try {
      const response = await axiosInstance.get<Machine>(`/machines/${id}`);
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch machine",
      });
      return null;
    }
  },

  // Pagination actions
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchMachines();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, currentPage: 1 });
    get().fetchMachines();
  },

  // Selection actions
  selectMachine: (id: number) => {
    const { selectedMachines } = get();
    const isSelected = selectedMachines.includes(id);

    set({
      selectedMachines: isSelected
        ? selectedMachines.filter((machineId) => machineId !== id)
        : [...selectedMachines, id],
    });
  },

  selectAllMachines: () => {
    const { machines, selectedMachines } = get();
    const allIds = machines.map((machine) => machine.id);

    set({
      selectedMachines: selectedMachines.length === allIds.length ? [] : allIds,
    });
  },

  clearSelection: () => {
    set({ selectedMachines: [] });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
