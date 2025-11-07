import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  _count?: {
    ticketComments: number;
  };
}

export interface CreateCommentPayload {
  content: string;
}

export interface UpdateCommentPayload {
  content?: string;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export interface CommentsResponse {
  data: Comment[];
  total: number;
}

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

interface CommentsStore {
  comments: Comment[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedComments: number[];

  // Pagination state
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Search state
  searchQuery: string;

  // Date range state
  dateRange: DateRange;

  // Actions
  fetchComments: (params?: FilterParams) => Promise<void>;
  createComment: (commentData: CreateCommentPayload) => Promise<void>;
  updateComment: (id: number, commentData: UpdateCommentPayload) => Promise<void>;
  deleteComment: (id: number) => Promise<void>;
  bulkDeleteComments: (commentIds: number[]) => Promise<void>;
  getCommentById: (id: number) => Promise<Comment | null>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;

  // Search actions
  setSearch: (query: string) => void;

  // Date range actions
  setDateRange: (dateRange: DateRange) => void;
  clearDateRange: () => void;

  // Selection actions
  selectComment: (id: number) => void;
  selectAllComments: () => void;
  clearSelection: () => void;

  // Utility actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCommentsStore = create<CommentsStore>((set, get) => ({
  comments: [],
  total: 0,
  loading: false,
  error: null,
  selectedComments: [],

  // Pagination state
  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  // Search state
  searchQuery: "",

  // Date range state
  dateRange: {},

  // Fetch comments with filtering
  fetchComments: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize, searchQuery, dateRange } = get();
      const offset = Math.max(0, (currentPage - 1) * pageSize);

      // Always send default values to ensure integers
      const finalOffset = Math.max(0, Math.floor(params.offset ?? offset));
      const finalLimit = Math.max(1, Math.floor(params.limit ?? pageSize));

      // Use axios params instead of URLSearchParams for better type handling
      const apiParams: {
        offset: number;
        limit: number;
        search?: string;
        startDate?: string;
        endDate?: string;
      } = {
        offset: finalOffset,
        limit: finalLimit,
      };

      // Use search from params or store state
      const searchTerm = params.search ?? searchQuery;
      if (searchTerm && searchTerm.trim()) {
        apiParams.search = searchTerm.trim();
      }

      // Use date range from params or store state
      const startDate = params.startDate ?? dateRange.startDate;
      const endDate = params.endDate ?? dateRange.endDate;

      if (startDate) {
        apiParams.startDate = startDate;
      }
      if (endDate) {
        apiParams.endDate = endDate;
      }

      const response = await axiosInstance.get<CommentsResponse>('/comments/admin/list/all', {
        params: apiParams
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        comments: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch comments",
        loading: false,
      });
    }
  },

  // Create a new comment (admin only)
  createComment: async (commentData: CreateCommentPayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.post("/comments/admin/create", commentData);

      // Refresh the comments list
      await get().fetchComments();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create comment",
        loading: false,
      });
      throw error;
    }
  },

  // Update comment (admin only)
  updateComment: async (id: number, commentData: UpdateCommentPayload) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.put(`/comments/admin/${id}`, commentData);

      // Refresh the comments list
      await get().fetchComments();

      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update comment",
        loading: false,
      });
      throw error;
    }
  },

  // Delete comment (admin only)
  deleteComment: async (id: number) => {
    try {
      set({ loading: true, error: null });

      await axiosInstance.delete(`/comments/admin/${id}`);

      // Remove comment from local state
      const { comments } = get();
      set({
        comments: comments.filter((comment) => comment.id !== id),
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete comment",
        loading: false,
      });
      throw error;
    }
  },

  // Bulk delete comments (admin only)
  bulkDeleteComments: async (commentIds: number[]) => {
    try {
      set({ loading: true, error: null });

      const response = await axiosInstance.delete("/comments/admin/bulk", {
        data: { commentIds },
      });

      // Remove deleted comments from local state
      const { comments } = get();
      set({
        comments: comments.filter((comment) => !commentIds.includes(comment.id)),
        selectedComments: [],
        loading: false,
      });

      return response.data;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete comments",
        loading: false,
      });
      throw error;
    }
  },

  // Get comment by ID (admin only)
  getCommentById: async (id: number): Promise<Comment | null> => {
    try {
      const response = await axiosInstance.get<Comment>(`/comments/admin/${id}`);
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || "Failed to fetch comment" });
      return null;
    }
  },

  // Pagination actions
  setPage: (page: number) => {
    const validPage = Math.max(1, Math.floor(page));
    set({ currentPage: validPage });
    get().fetchComments();
  },

  setPageSize: (pageSize: number) => {
    const validPageSize = Math.max(1, Math.floor(pageSize));
    set({ pageSize: validPageSize, currentPage: 1 });
    get().fetchComments();
  },

  // Search actions
  setSearch: (query: string) => {
    set({ searchQuery: query, currentPage: 1 });
    // Fetch will be triggered by useEffect in component due to debouncing
  },

  // Date range actions
  setDateRange: (dateRange: DateRange) => {
    set({ dateRange, currentPage: 1 });
    // Fetch will be triggered by useEffect in component due to debouncing
  },

  clearDateRange: () => {
    set({ dateRange: {}, currentPage: 1 });
    get().fetchComments();
  },

  // Selection management
  selectComment: (id: number) => {
    const { selectedComments } = get();
    const isSelected = selectedComments.includes(id);

    if (isSelected) {
      set({ selectedComments: selectedComments.filter((commentId) => commentId !== id) });
    } else {
      set({ selectedComments: [...selectedComments, id] });
    }
  },

  selectAllComments: () => {
    const { comments } = get();
    set({ selectedComments: comments.map((comment) => comment.id) });
  },

  clearSelection: () => {
    set({ selectedComments: [] });
  },

  // Utility actions
  setLoading: (loading: boolean) => set({ loading }),
  setError: (error: string | null) => set({ error }),
  clearError: () => set({ error: null }),
}));
