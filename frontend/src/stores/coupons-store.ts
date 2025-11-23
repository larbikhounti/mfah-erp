import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface Coupon {
  id: number;
  code: string;
  discount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: {
    tickets: number;
  };
}

export interface CreateCouponPayload {
  code: string;
  discount: number;
  isActive?: boolean;
}

export interface UpdateCouponPayload {
  code?: string;
  discount?: number;
  isActive?: boolean;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  couponId?: number;
  showArchived?: boolean;
}

export interface CouponsResponse {
  data: Coupon[];
  total: number;
}

interface CouponsStore {
  coupons: Coupon[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedCoupons: number[];
  showArchived: boolean;

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Search state
  searchQuery: string;

  // Filter state
  activeFilter: boolean | undefined;

  // Actions
  fetchCoupons: (params?: FilterParams) => Promise<void>;
  createCoupon: (couponData: CreateCouponPayload) => Promise<void>;
  updateCoupon: (id: number, couponData: UpdateCouponPayload) => Promise<void>;
  deleteCoupon: (id: number) => Promise<void>;
  bulkDeleteCoupons: (couponIds: number[]) => Promise<void>;
  restoreCoupon: (id: number) => Promise<void>;
  bulkRestoreCoupons: (couponIds: number[]) => Promise<void>;
  getCouponById: (id: number) => Promise<Coupon | null>;
  getCouponByCode: (code: string) => Promise<Coupon | null>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Archive actions
  setShowArchived: (show: boolean) => void;

  // Search actions
  setSearch: (query: string) => void;

  // Filter actions
  setActiveFilter: (isActive: boolean | undefined) => void;

  // Selection actions
  selectCoupon: (id: number) => void;
  selectAllCoupons: () => void;
  clearSelection: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCouponsStore = create<CouponsStore>((set, get) => ({
  coupons: [],
  total: 0,
  loading: false,
  error: null,
  selectedCoupons: [],
  showArchived: false,

  // Pagination state
  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  // Search state
  searchQuery: "",

  // Filter state
  activeFilter: undefined,

  // Fetch coupons with filtering
  fetchCoupons: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize, searchQuery, activeFilter, showArchived } = get();
      const offset = Math.max(0, (currentPage - 1) * pageSize);

      // Always send default values to ensure integers
      const finalOffset = Math.max(0, Math.floor(params.offset ?? offset));
      const finalLimit = Math.max(1, Math.floor(params.limit ?? pageSize));

      // Use axios params instead of URLSearchParams for better type handling
      const apiParams: { offset: number; limit: number; search?: string; isActive?: boolean; couponId?: number; showArchived?: boolean } = {
        offset: finalOffset,
        limit: finalLimit,
        showArchived: params.showArchived ?? showArchived,
      };

      // Use search from params or store state
      const searchTerm = params.search ?? searchQuery;
      if (searchTerm && searchTerm.trim()) {
        apiParams.search = searchTerm.trim();
      }

      // Use isActive filter from params or store state
      const isActiveFilter = params.isActive ?? activeFilter;
      if (isActiveFilter !== undefined) {
        apiParams.isActive = isActiveFilter;
      }

      if (params.couponId && params.couponId > 0) {
        apiParams.couponId = Math.floor(params.couponId);
      }

      const response = await axiosInstance.get<CouponsResponse>('/coupons/admin/list/all', {
        params: apiParams
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        coupons: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch coupons",
        loading: false,
      });
    }
  },

  // Create a new coupon (admin only)
  createCoupon: async (couponData: CreateCouponPayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/coupons/admin/create", couponData);

      // Refresh the coupons list
      await get().fetchCoupons();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create coupon",
        loading: false,
      });
      throw error;
    }
  },

  // Update coupon (admin only)
  updateCoupon: async (id: number, couponData: UpdateCouponPayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.put(`/coupons/admin/${id}`, couponData);

      // Refresh the coupons list
      await get().fetchCoupons();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update coupon",
        loading: false,
      });
      throw error;
    }
  },

  // Delete coupon (admin only)
  deleteCoupon: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete(`/coupons/admin/${id}`);

      // Refresh the coupons list
      await get().fetchCoupons();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete coupon",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk delete coupons (admin only)
  bulkDeleteCoupons: async (couponIds: number[]) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete("/coupons/admin/bulk", {
        data: { couponIds },
      });

      // Clear selection and refresh
      set({ selectedCoupons: [] });
      await get().fetchCoupons();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete coupons",
        loading: false,
      });
      throw error;
    }
  },

  // Restore coupon (admin only)
  restoreCoupon: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.patch(`/coupons/admin/${id}/restore`);

      // Refresh the coupons list
      await get().fetchCoupons();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore coupon",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk restore coupons (admin only)
  bulkRestoreCoupons: async (couponIds: number[]) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/coupons/admin/bulk-restore", {
        couponIds: couponIds,
      });

      // Clear selection and refresh
      set({ selectedCoupons: [] });
      await get().fetchCoupons();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore coupons",
        loading: false,
      });
      throw error;
    }
  },

  // Get coupon by ID (admin only)
  getCouponById: async (id: number): Promise<Coupon | null> => {
    try {
      const response = await axiosInstance.get<Coupon>(`/coupons/admin/${id}`);
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch coupon" });
      return null;
    }
  },

  // Get coupon by code (public)
  getCouponByCode: async (code: string): Promise<Coupon | null> => {
    try {
      const response = await axiosInstance.get<Coupon>(`/coupons/code/${code}`);
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch coupon" });
      return null;
    }
  },

  // Pagination actions
  setPage: (page: number) => {
    const validPage = Math.max(1, Math.floor(page));
    set({ currentPage: validPage });
    get().fetchCoupons();
  },

  setPageSize: (pageSize: number) => {
    const validPageSize = Math.max(1, Math.floor(pageSize));
    set({ pageSize: validPageSize, currentPage: 1 });
    get().fetchCoupons();
  },

  // Archive actions
  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchCoupons({ showArchived: show });
  },

  // Search actions
  setSearch: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    // Fetch will be triggered by useEffect in component due to debouncing
  },

  // Filter actions
  setActiveFilter: (isActive: boolean | undefined) => {
    set({ activeFilter: isActive, currentPage: 1 });
    get().fetchCoupons();
  },

  // Selection management
  selectCoupon: (id: number) => {
    const { selectedCoupons } = get();
    const isSelected = selectedCoupons.includes(id);

    if (isSelected) {
      set({ selectedCoupons: selectedCoupons.filter((couponId) => couponId !== id) });
    } else {
      set({ selectedCoupons: [...selectedCoupons, id] });
    }
  },

  selectAllCoupons: () => {
    const { coupons } = get();
    set({ selectedCoupons: coupons.map((coupon) => coupon.id) });
  },

  clearSelection: () => {
    set({ selectedCoupons: [] });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
