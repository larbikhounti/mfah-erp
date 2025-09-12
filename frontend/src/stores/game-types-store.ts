import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface GameType {
  id: number;
  name: string;
  gamesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGameTypePayload {
  name: string;
}

export interface UpdateGameTypePayload {
  name?: string;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  gameTypeId?: number;
}

export interface GameTypesResponse {
  data: GameType[];
  total: number;
}

interface GameTypesStore {
  gameTypes: GameType[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedGameTypes: number[];

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Actions
  fetchGameTypes: (params?: FilterParams) => Promise<void>;
  createGameType: (gameTypeData: CreateGameTypePayload) => Promise<void>;
  updateGameType: (
    id: number,
    gameTypeData: UpdateGameTypePayload
  ) => Promise<void>;
  deleteGameType: (id: number) => Promise<void>;
  bulkDeleteGameTypes: (gameTypeIds: number[]) => Promise<void>;
  getGameTypeById: (id: number) => Promise<GameType | null>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Selection actions
  selectGameType: (id: number) => void;
  selectAllGameTypes: () => void;
  clearSelection: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useGameTypesStore = create<GameTypesStore>((set, get) => ({
  gameTypes: [],
  total: 0,
  loading: false,
  error: null,
  selectedGameTypes: [],

  // Pagination state
  currentPage: 1,
  pageSize: 13,
  totalPages: 0,

  // Fetch game types with filtering
  fetchGameTypes: async (params: FilterParams = {}) => {
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
      if (params.gameTypeId && params.gameTypeId > 0) {
        apiParams.gameTypeId = Math.floor(params.gameTypeId);
      }

      const response = await axiosInstance.get<GameTypesResponse>(
        "/game-types/admin/list/all",
        {
          params: apiParams,
        }
      );

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        gameTypes: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch game types",
        loading: false,
      });
    }
  },

  // Create a new game type (admin only)
  createGameType: async (gameTypeData: CreateGameTypePayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/game-types/admin/create", gameTypeData);

      // Refresh the game types list
      await get().fetchGameTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create game type",
        loading: false,
      });
      throw error;
    }
  },

  // Update game type (admin only)
  updateGameType: async (id: number, gameTypeData: UpdateGameTypePayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.put(`/game-types/admin/${id}`, gameTypeData);

      // Refresh the game types list
      await get().fetchGameTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update game type",
        loading: false,
      });
      throw error;
    }
  },

  // Delete game type (admin only)
  deleteGameType: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete(`/game-types/admin/${id}`);

      // Refresh the game types list
      await get().fetchGameTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete game type",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk delete game types (admin only)
  bulkDeleteGameTypes: async (gameTypeIds: number[]) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete("/game-types/admin", {
        data: { ids: gameTypeIds },
      });

      // Clear selection and refresh
      set({ selectedGameTypes: [] });
      await get().fetchGameTypes();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete game types",
        loading: false,
      });
      throw error;
    }
  },

  // Get game type by ID
  getGameTypeById: async (id: number) => {
    try {
      const response = await axiosInstance.get<GameType>(`/game-types/${id}`);
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch game type",
      });
      return null;
    }
  },

  // Pagination actions
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchGameTypes();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, currentPage: 1 });
    get().fetchGameTypes();
  },

  // Selection actions
  selectGameType: (id: number) => {
    const { selectedGameTypes } = get();
    const isSelected = selectedGameTypes.includes(id);

    set({
      selectedGameTypes: isSelected
        ? selectedGameTypes.filter((gameTypeId) => gameTypeId !== id)
        : [...selectedGameTypes, id],
    });
  },

  selectAllGameTypes: () => {
    const { gameTypes, selectedGameTypes } = get();
    const allIds = gameTypes.map((gameType) => gameType.id);

    set({
      selectedGameTypes:
        selectedGameTypes.length === allIds.length ? [] : allIds,
    });
  },

  clearSelection: () => {
    set({ selectedGameTypes: [] });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
