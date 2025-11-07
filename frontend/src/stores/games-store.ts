import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface Game {
  id: number;
  name: string;
  price: number;
  playTime: number;
  gameTypeId?: number | null;
  isFavored?: boolean;
  createdAt: string;
  updatedAt: string;
  gameType?: {
    id: number;
    name: string;
  } | null;
  machineTypes?: {
    id: number;
    name: string;
  }[];
  experiencesCount?: number;
  age?: number;
  domes?: {
    id: number;
    name: string;
  }[];
}

export interface CreateGamePayload {
  name: string;
  price: number;
  playTime: number;
  age?: number;
  isFavored?: boolean;
  gameTypeId?: number;
  machineTypeIds?: number[];
  domeId: number[];
}

export interface UpdateGamePayload {
  name?: string;
  price?: number;
  playTime?: number;
  age?: number;
  isFavored?: boolean;
  gameTypeId?: number;
  machineTypeIds?: number[];
  domeId?: number[];
}

export interface FilterParams {
  page?: number;
  limit?: number;
  name?: string;
  gameTypeId?: number;
  machineTypeIds?: number[];
  minPrice?: number;
  maxPrice?: number;
  minPlayTime?: number;
  maxPlayTime?: number;
  isFavored?: boolean;
}

export interface GamesResponse {
  games: Game[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GamesStore {
  games: Game[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedGames: number[];

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Actions
  fetchGames: (params?: FilterParams) => Promise<void>;
  createGame: (gameData: CreateGamePayload) => Promise<void>;
  updateGame: (id: number, gameData: UpdateGamePayload) => Promise<void>;
  deleteGame: (id: number) => Promise<void>;
  bulkDeleteGames: (gameIds: number[]) => Promise<void>;
  getGameById: (id: number) => Promise<Game | null>;
  toggleFavorite: (id: number) => Promise<void>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Selection actions
  selectGame: (id: number) => void;
  selectAllGames: () => void;
  clearSelection: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useGamesStore = create<GamesStore>((set, get) => ({
  games: [],
  total: 0,
  loading: false,
  error: null,
  selectedGames: [],

  // Pagination state
  currentPage: 1,
  pageSize: 13,
  totalPages: 0,

  // Fetch games with filtering
  fetchGames: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize } = get();

      // Use the backend pagination format
      const apiParams: any = {
        page: params.page ?? currentPage,
        limit: params.limit ?? pageSize,
      };

      if (params.name && params.name.trim()) {
        apiParams.name = params.name.trim();
      }
      if (params.gameTypeId && params.gameTypeId > 0) {
        apiParams.gameTypeId = params.gameTypeId;
      }
      if (params.machineTypeIds && params.machineTypeIds.length > 0) {
        apiParams.machineTypeIds = params.machineTypeIds;
      }
      if (params.minPrice !== undefined) {
        apiParams.minPrice = params.minPrice;
      }
      if (params.maxPrice !== undefined) {
        apiParams.maxPrice = params.maxPrice;
      }
      if (params.minPlayTime !== undefined) {
        apiParams.minPlayTime = params.minPlayTime;
      }
      if (params.maxPlayTime !== undefined) {
        apiParams.maxPlayTime = params.maxPlayTime;
      }
      if (params.isFavored !== undefined) {
        apiParams.isFavored = params.isFavored;
      }

      const response = await axiosInstance.get<GamesResponse>("/games", {
        params: apiParams,
      });

      set({
        games: response.data.games,
        total: response.data.total,
        currentPage: response.data.page,
        totalPages: response.data.totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch games",
        loading: false,
      });
    }
  },

  // Create a new game (admin only)
  createGame: async (gameData: CreateGamePayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/games", gameData);

      // Refresh the games list
      await get().fetchGames();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create game",
        loading: false,
      });
      throw error;
    }
  },

  // Update game (admin only)
  updateGame: async (id: number, gameData: UpdateGamePayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.patch(`/games/${id}`, gameData);

      // Refresh the games list
      await get().fetchGames();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update game",
        loading: false,
      });
      throw error;
    }
  },

  // Delete game (admin only)
  deleteGame: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete(`/games/${id}`);

      // Refresh the games list
      await get().fetchGames();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete game",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk delete games (admin only)
  bulkDeleteGames: async (gameIds: number[]) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete("/games/admin/bulk", {
        data: { ids: gameIds },
      });

      // Clear selection and refresh
      set({ selectedGames: [] });
      await get().fetchGames();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete games",
        loading: false,
      });
      throw error;
    }
  },

  // Get game by ID
  getGameById: async (id: number) => {
    try {
      const response = await axiosInstance.get<Game>(`/games/${id}`);
      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch game",
      });
      return null;
    }
  },

  // Toggle favorite status
  toggleFavorite: async (id: number) => {
    try {
      const { games } = get();
      const game = games.find((g) => g.id === id);
      
      if (!game) {
        set({ error: "Game not found" });
        return;
      }

      await axiosInstance.patch(`/games/${id}`, {
        isFavored: !game.isFavored,
      });

      // Update the game in the local state
      set({
        games: games.map((g) =>
          g.id === id ? { ...g, isFavored: !g.isFavored } : g
        ),
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to toggle favorite",
      });
    }
  },

  // Pagination actions
  setPage: (page: number) => {
    set({ currentPage: page });
    get().fetchGames({ page });
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize, currentPage: 1 });
    get().fetchGames({ page: 1, limit: pageSize });
  },

  // Selection actions
  selectGame: (id: number) => {
    const { selectedGames } = get();
    const isSelected = selectedGames.includes(id);

    set({
      selectedGames: isSelected
        ? selectedGames.filter((gameId) => gameId !== id)
        : [...selectedGames, id],
    });
  },

  selectAllGames: () => {
    const { games, selectedGames } = get();
    const allIds = games.map((game) => game.id);

    set({
      selectedGames: selectedGames.length === allIds.length ? [] : allIds,
    });
  },

  clearSelection: () => {
    set({ selectedGames: [] });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
