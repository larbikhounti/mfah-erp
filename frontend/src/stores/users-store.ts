import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  dom: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password: string;
  role_id?: number;
  dom_id?: number;
}

export interface UpdateUserPayload {
  name?: string;
  email?: string;
  password?: string;
  role_id?: number;
  dom_id?: number;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  userId?: number;
}

export interface UsersResponse {
  data: User[];
  total: number;
}

interface UsersStore {
  users: User[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedUsers: number[];
  
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Actions
  fetchUsers: (params?: FilterParams) => Promise<void>;
  createUser: (userData: CreateUserPayload) => Promise<void>;
  updateUser: (id: number, userData: UpdateUserPayload) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  bulkDeleteUsers: (userIds: number[]) => Promise<void>;
  getUserById: (id: number) => Promise<User | null>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Selection actions
  selectUser: (id: number) => void;
  selectAllUsers: () => void;
  clearSelection: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  total: 0,
  loading: false,
  error: null,
  selectedUsers: [],
  
  // Pagination state
  currentPage: 1,
  pageSize: 13,
  totalPages: 0,

  // Fetch users with filtering
  fetchUsers: async (params: FilterParams = {}) => {
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
      if (params.userId && params.userId > 0) {
        apiParams.userId = Math.floor(params.userId);
      }

      const response = await axiosInstance.get<UsersResponse>('/users/admin/list/all', {
        params: apiParams
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        users: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch users",
        loading: false,
      });
    }
  },

  // Create a new user (admin only)
  createUser: async (userData: CreateUserPayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/users/admin/create", userData);

      // Refresh the users list
      await get().fetchUsers();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create user",
        loading: false,
      });
      throw error;
    }
  },

  // Update user (admin only)
  updateUser: async (id: number, userData: UpdateUserPayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.put(`/users/admin/${id}`, userData);

      // Refresh the users list
      await get().fetchUsers();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update user",
        loading: false,
      });
      throw error;
    }
  },

  // Delete user (admin only)
  deleteUser: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete(`/users/admin/${id}`);

      // Remove user from local state
      const { users } = get();
      set({
        users: users.filter((user) => user.id !== id),
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete user",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk delete users (admin only)
  bulkDeleteUsers: async (userIds: number[]) => {
    try {
      set({ loading: true, error: null });

      const response = await axiosInstance.delete("/users/admin/bulk", {
        data: { userIds },
      });

      // Remove deleted users from local state
      const { users } = get();
      set({
        users: users.filter((user) => !userIds.includes(user.id)),
        selectedUsers: [],
        loading: false,
      });

      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete users",
        loading: false,
      });
      throw error;
    }
  },

  // Get user by ID (admin only)
  getUserById: async (id: number): Promise<User | null> => {
    try {
      const response = await axiosInstance.get<User>(`/users/admin/${id}`);
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch user" });
      return null;
    }
  },

  // Pagination actions
  setPage: (page: number) => {
    const validPage = Math.max(1, Math.floor(page));
    set({ currentPage: validPage });
    get().fetchUsers();
  },

  setPageSize: (pageSize: number) => {
    const validPageSize = Math.max(1, Math.floor(pageSize));
    set({ pageSize: validPageSize, currentPage: 1 });
    get().fetchUsers();
  },

  // Selection management
  selectUser: (id: number) => {
    const { selectedUsers } = get();
    const isSelected = selectedUsers.includes(id);

    if (isSelected) {
      set({ selectedUsers: selectedUsers.filter((userId) => userId !== id) });
    } else {
      set({ selectedUsers: [...selectedUsers, id] });
    }
  },

  selectAllUsers: () => {
    const { users } = get();
    set({ selectedUsers: users.map((user) => user.id) });
  },

  clearSelection: () => {
    set({ selectedUsers: [] });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
