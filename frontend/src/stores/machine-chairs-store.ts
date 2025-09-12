import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface MachineChair {
  id: number;
  name: string;
  status: number;
  machineId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  machines?: {
    id: number;
    name: string;
  };
}

export interface CreateMachineChairPayload {
  name: string;
  status: number;
  machineId: number;
}

export interface UpdateMachineChairPayload {
  name?: string;
  status?: number;
  machineId?: number;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  status?: number;
  machineId?: number;
}

export interface MachineChairsResponse {
  data: MachineChair[];
  total: number;
}

interface MachineChairsStore {
  machineChairs: MachineChair[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedMachineChairs: number[];

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Actions
  setMachineChairs: (machineChairs: MachineChair[]) => void;
  setTotal: (total: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedMachineChairs: (ids: number[]) => void;
  addSelectedMachineChair: (id: number) => void;
  removeSelectedMachineChair: (id: number) => void;
  clearSelectedMachineChairs: () => void;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Selection actions
  selectMachineChair: (id: number) => void;
  selectAllMachineChairs: () => void;
  clearSelection: () => void;
  clearError: () => void;

  // API methods
  fetchMachineChairs: (params?: FilterParams) => Promise<void>;
  createMachineChair: (data: CreateMachineChairPayload) => Promise<boolean>;
  updateMachineChair: (
    id: number,
    data: UpdateMachineChairPayload
  ) => Promise<boolean>;
  deleteMachineChair: (id: number) => Promise<boolean>;
  bulkDeleteMachineChairs: (ids: number[]) => Promise<boolean>;
  fetchMachineChairsByMachine: (machineId: number) => Promise<MachineChair[]>;
}

export const useMachineChairsStore = create<MachineChairsStore>((set, get) => ({
  machineChairs: [],
  total: 0,
  loading: false,
  error: null,
  selectedMachineChairs: [],

  // Pagination state
  currentPage: 1,
  pageSize: 13,
  totalPages: 0,

  // Setters
  setMachineChairs: (machineChairs) => set({ machineChairs }),
  setTotal: (total) => set({ total }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSelectedMachineChairs: (ids) => set({ selectedMachineChairs: ids }),
  addSelectedMachineChair: (id) =>
    set((state) => ({
      selectedMachineChairs: [...state.selectedMachineChairs, id],
    })),
  removeSelectedMachineChair: (id) =>
    set((state) => ({
      selectedMachineChairs: state.selectedMachineChairs.filter(
        (chairId) => chairId !== id
      ),
    })),
  clearSelectedMachineChairs: () => set({ selectedMachineChairs: [] }),

  // API methods
  fetchMachineChairs: async (params = {}) => {
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
      if (params.status !== undefined) {
        apiParams.status = Math.floor(params.status);
      }
      if (params.machineId && params.machineId > 0) {
        apiParams.machineId = Math.floor(params.machineId);
      }

      const response = await axiosInstance.get<MachineChairsResponse>(
        "/machine-chairs/admin/list/all",
        {
          params: apiParams,
        }
      );

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        machineChairs: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error:
          error.response?.data?.message || "Failed to fetch machine chairs",
        loading: false,
      });
    }
  },

  createMachineChair: async (data) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.post("/machine-chairs/admin/create", data);
      set({ loading: false });

      // Refresh the list
      await get().fetchMachineChairs();
      return true;
    } catch (error) {
      console.error("Error creating machine chair:", error);
      set({
        error: "Failed to create machine chair",
        loading: false,
      });
      return false;
    }
  },

  updateMachineChair: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.put(`/machine-chairs/admin/update/${id}`, data);
      set({ loading: false });

      // Refresh the list
      await get().fetchMachineChairs();
      return true;
    } catch (error) {
      console.error("Error updating machine chair:", error);
      set({
        error: "Failed to update machine chair",
        loading: false,
      });
      return false;
    }
  },

  deleteMachineChair: async (id) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete(`/machine-chairs/admin/delete/${id}`);
      set({ loading: false });

      // Refresh the list
      await get().fetchMachineChairs();
      return true;
    } catch (error) {
      console.error("Error deleting machine chair:", error);
      set({
        error: "Failed to delete machine chair",
        loading: false,
      });
      return false;
    }
  },

  bulkDeleteMachineChairs: async (ids) => {
    set({ loading: true, error: null });
    try {
      await axiosInstance.delete("/machine-chairs/admin/bulk-delete", {
        data: { ids },
      });
      set({ loading: false });

      // Clear selections and refresh the list
      get().clearSelectedMachineChairs();
      await get().fetchMachineChairs();
      return true;
    } catch (error) {
      console.error("Error bulk deleting machine chairs:", error);
      set({
        error: "Failed to delete machine chairs",
        loading: false,
      });
      return false;
    }
  },

  fetchMachineChairsByMachine: async (machineId) => {
    try {
      const response = await axiosInstance.get<MachineChair[]>(
        `/machine-chairs/machine/${machineId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching machine chairs by machine:", error);
      throw new Error("Failed to fetch machine chairs by machine");
    }
  },

  // Pagination methods
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchMachineChairs();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, currentPage: 1 });
    get().fetchMachineChairs();
  },

  // Selection methods
  selectMachineChair: (id: number) => {
    set((state) => ({
      selectedMachineChairs: state.selectedMachineChairs.includes(id)
        ? state.selectedMachineChairs.filter((chairId) => chairId !== id)
        : [...state.selectedMachineChairs, id],
    }));
  },

  selectAllMachineChairs: () => {
    const { machineChairs, selectedMachineChairs } = get();
    const allIds = machineChairs.map((chair) => chair.id);
    set({
      selectedMachineChairs:
        selectedMachineChairs.length === allIds.length ? [] : allIds,
    });
  },

  clearSelection: () => set({ selectedMachineChairs: [] }),

  clearError: () => set({ error: null }),
}));
