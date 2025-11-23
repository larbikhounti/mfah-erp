import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface MachineType {
  id: number;
  name: string;
  machinesCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateMachineTypePayload {
  name: string;
}

export interface UpdateMachineTypePayload {
  name?: string;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  machineTypeId?: number;
  showArchived?: boolean;
}

export interface MachineTypesResponse {
  data: MachineType[];
  total: number;
}

interface MachineTypesStore {
  machineTypes: MachineType[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedMachineTypes: number[];
  showArchived: boolean;

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Actions
  fetchMachineTypes: (params?: FilterParams) => Promise<void>;
  createMachineType: (
    machineTypeData: CreateMachineTypePayload
  ) => Promise<void>;
  updateMachineType: (
    id: number,
    machineTypeData: UpdateMachineTypePayload
  ) => Promise<void>;
  deleteMachineType: (id: number) => Promise<void>;
  bulkDeleteMachineTypes: (machineTypeIds: number[]) => Promise<void>;
  restoreMachineType: (id: number) => Promise<void>;
  bulkRestoreMachineTypes: (machineTypeIds: number[]) => Promise<void>;
  getMachineTypeById: (id: number) => Promise<MachineType | null>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Archive actions
  setShowArchived: (show: boolean) => void;

  // Selection actions
  selectMachineType: (id: number) => void;
  selectAllMachineTypes: () => void;
  clearSelection: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useMachineTypesStore = create<MachineTypesStore>((set, get) => ({
  machineTypes: [],
  total: 0,
  loading: false,
  error: null,
  selectedMachineTypes: [],
  showArchived: false,

  // Pagination state
  currentPage: 1,
  pageSize: 13,
  totalPages: 0,

  // Fetch machine types with filtering
  fetchMachineTypes: async (params: FilterParams = {}) => {
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
      if (params.machineTypeId && params.machineTypeId > 0) {
        apiParams.machineTypeId = Math.floor(params.machineTypeId);
      }

      const response = await axiosInstance.get<MachineTypesResponse>(
        "/machine-types/admin/list/all",
        {
          params: apiParams,
        }
      );

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        machineTypes: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch machine types",
        loading: false,
      });
    }
  },

  // Create a new machine type (admin only)
  createMachineType: async (machineTypeData: CreateMachineTypePayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/machine-types/admin/create", machineTypeData);

      // Refresh the machine types list
      await get().fetchMachineTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create machine type",
        loading: false,
      });
      throw error;
    }
  },

  // Update machine type (admin only)
  updateMachineType: async (
    id: number,
    machineTypeData: UpdateMachineTypePayload
  ) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.put(`/machine-types/admin/${id}`, machineTypeData);

      // Refresh the machine types list
      await get().fetchMachineTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update machine type",
        loading: false,
      });
      throw error;
    }
  },

  // Delete machine type (admin only)
  deleteMachineType: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete(`/machine-types/admin/${id}`);

      // Refresh the machine types list
      await get().fetchMachineTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete machine type",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk delete machine types (admin only)
  bulkDeleteMachineTypes: async (machineTypeIds: number[]) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete("/machine-types/admin/bulk", {
        data: { machineTypeIds: machineTypeIds },
      });

      // Clear selection and refresh
      set({ selectedMachineTypes: [] });
      await get().fetchMachineTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to delete machine types",
        loading: false,
      });
      throw error;
    }
  },

  // Get machine type by ID
  getMachineTypeById: async (id: number) => {
    try {
      const response = await axiosInstance.get<MachineType>(
        `/machine-types/${id}`
      );
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch machine type",
      });
      return null;
    }
  },

  // Restore machine type (admin only)
  restoreMachineType: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.patch(`/machine-types/admin/${id}/restore`);

      // Refresh the machine types list
      await get().fetchMachineTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore machine type",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk restore machine types (admin only)
  bulkRestoreMachineTypes: async (machineTypeIds: number[]) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/machine-types/admin/bulk-restore", {
        machineTypeIds: machineTypeIds,
      });

      // Clear selection and refresh
      set({ selectedMachineTypes: [] });
      await get().fetchMachineTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to restore machine types",
        loading: false,
      });
      throw error;
    }
  },

  // Pagination actions
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchMachineTypes();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, currentPage: 1 });
    get().fetchMachineTypes();
  },

  // Archive actions
  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchMachineTypes({ showArchived: show });
  },

  // Selection actions
  selectMachineType: (id: number) => {
    const { selectedMachineTypes } = get();
    const isSelected = selectedMachineTypes.includes(id);

    set({
      selectedMachineTypes: isSelected
        ? selectedMachineTypes.filter((machineTypeId) => machineTypeId !== id)
        : [...selectedMachineTypes, id],
    });
  },

  selectAllMachineTypes: () => {
    const { machineTypes, selectedMachineTypes } = get();
    const allIds = machineTypes.map((machineType) => machineType.id);

    set({
      selectedMachineTypes:
        selectedMachineTypes.length === allIds.length ? [] : allIds,
    });
  },

  clearSelection: () => {
    set({ selectedMachineTypes: [] });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
