import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export type TransportType = "EXPORT" | "IMPORT";
export type ExecutionMode = "IN_HOUSE" | "SUBCONTRACTED";
export type MissionStatus = "PLANNED" | "IN_PROGRESS" | "FINISHED" | "CANCELLED";
export type Currency = "MAD" | "EUR";

export interface Mission {
  id: number;
  reference: string;
  clientId: number;
  transportType: TransportType;
  executionMode: ExecutionMode;
  loadingLocation: string;
  deliveryLocation: string;
  clientPrice: string;
  currency: Currency;
  subcontractorId: number | null;
  subcontractorCost: string | null;
  truckId: number | null;
  driverId: number | null;
  status: MissionStatus;
  missionDate: string;
  autoInvoice: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateMissionPayload {
  clientId: number;
  transportType: TransportType;
  executionMode: ExecutionMode;
  loadingLocation: string;
  deliveryLocation: string;
  clientPrice: number;
  currency: Currency;
  subcontractorId?: number;
  subcontractorCost?: number;
  truckId?: number;
  driverId?: number;
  missionDate: string;
  autoInvoice?: boolean;
}

export interface UpdateMissionPayload extends Partial<CreateMissionPayload> {}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  status?: MissionStatus;
  transportType?: TransportType;
  executionMode?: ExecutionMode;
  currency?: Currency;
  showArchived?: boolean;
}

export interface MissionsResponse {
  data: Mission[];
  total: number;
}

interface MissionsStore {
  missions: Mission[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedMissions: number[];
  showArchived: boolean;

  currentPage: number;
  pageSize: number;
  totalPages: number;

  fetchMissions: (params?: FilterParams) => Promise<void>;
  createMission: (data: CreateMissionPayload) => Promise<void>;
  updateMission: (id: number, data: UpdateMissionPayload) => Promise<void>;
  updateMissionStatus: (id: number, status: MissionStatus) => Promise<void>;
  deleteMission: (id: number) => Promise<void>;
  bulkDeleteMissions: (missionIds: number[]) => Promise<void>;
  restoreMission: (id: number) => Promise<void>;
  bulkRestoreMissions: (missionIds: number[]) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setShowArchived: (show: boolean) => void;

  selectMission: (id: number) => void;
  selectAllMissions: () => void;
  clearSelection: () => void;

  clearError: () => void;
}

export const useMissionsStore = create<MissionsStore>((set, get) => ({
  missions: [],
  total: 0,
  loading: false,
  error: null,
  selectedMissions: [],
  showArchived: false,

  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  fetchMissions: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize, showArchived } = get();
      const offset = Math.max(0, (currentPage - 1) * pageSize);

      const apiParams: any = {
        offset: Math.max(0, Math.floor(params.offset ?? offset)),
        limit: Math.max(1, Math.floor(params.limit ?? pageSize)),
        showArchived: params.showArchived ?? showArchived,
      };

      if (params.search && params.search.trim()) apiParams.search = params.search.trim();
      if (params.status) apiParams.status = params.status;
      if (params.transportType) apiParams.transportType = params.transportType;
      if (params.executionMode) apiParams.executionMode = params.executionMode;
      if (params.currency) apiParams.currency = params.currency;

      const response = await axiosInstance.get<MissionsResponse>("/missions", {
        params: apiParams,
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        missions: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch missions",
        loading: false,
      });
    }
  },

  createMission: async (data: CreateMissionPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/missions/admin/create", data);
      await get().fetchMissions();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create mission",
        loading: false,
      });
      throw error;
    }
  },

  updateMission: async (id: number, data: UpdateMissionPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/missions/admin/${id}`, data);
      await get().fetchMissions();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update mission",
        loading: false,
      });
      throw error;
    }
  },

  updateMissionStatus: async (id: number, status: MissionStatus) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/missions/admin/${id}/status`, { status });
      await get().fetchMissions();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update mission status",
        loading: false,
      });
      throw error;
    }
  },

  deleteMission: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete(`/missions/admin/${id}`);
      await get().fetchMissions();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete mission",
        loading: false,
      });
      throw error;
    }
  },

  bulkDeleteMissions: async (missionIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete("/missions/admin/bulk", { data: { missionIds } });
      set({ selectedMissions: [] });
      await get().fetchMissions();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete missions",
        loading: false,
      });
      throw error;
    }
  },

  restoreMission: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/missions/admin/${id}/restore`);
      await get().fetchMissions();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore mission",
        loading: false,
      });
      throw error;
    }
  },

  bulkRestoreMissions: async (missionIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/missions/admin/bulk-restore", { missionIds });
      set({ selectedMissions: [] });
      await get().fetchMissions();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore missions",
        loading: false,
      });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ currentPage: Math.max(1, Math.floor(page)) });
    get().fetchMissions();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, Math.floor(pageSize)), currentPage: 1 });
    get().fetchMissions();
  },

  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchMissions({ showArchived: show });
  },

  selectMission: (id: number) => {
    const { selectedMissions } = get();
    set({
      selectedMissions: selectedMissions.includes(id)
        ? selectedMissions.filter((missionId) => missionId !== id)
        : [...selectedMissions, id],
    });
  },

  selectAllMissions: () => {
    const { missions } = get();
    set({ selectedMissions: missions.map((m) => m.id) });
  },

  clearSelection: () => set({ selectedMissions: [] }),

  clearError: () => set({ error: null }),
}));
