import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface ActivityLogLatest {
  raw: string;
  count: number;
}

interface ActivityLogStore {
  raw: string;
  totalCount: number;
  loading: boolean;
  clearing: boolean;
  downloading: boolean;
  error: string | null;
  forbidden: boolean;
  limit: number;
  setLimit: (limit: number) => void;
  fetchLatest: () => Promise<void>;
  clearLog: () => Promise<void>;
  downloadLog: () => Promise<void>;
}

export const useActivityLogStore = create<ActivityLogStore>((set, get) => ({
  raw: "",
  totalCount: 0,
  loading: false,
  clearing: false,
  downloading: false,
  error: null,
  forbidden: false,
  limit: 100,

  setLimit: (limit) => set({ limit }),

  fetchLatest: async () => {
    try {
      set({ loading: true, error: null, forbidden: false });
      const response = await axiosInstance.get<ActivityLogLatest>(
        "/activity-logs/admin/latest",
        { params: { limit: get().limit } }
      );
      set({ raw: response.data.raw, totalCount: response.data.count });
    } catch (error: any) {
      if (error.response?.status === 403) {
        set({ forbidden: true });
      } else {
        set({ error: error.response?.data?.message || "Failed to load activity log" });
      }
    } finally {
      set({ loading: false });
    }
  },

  clearLog: async () => {
    try {
      set({ clearing: true });
      await axiosInstance.delete("/activity-logs/admin/clear");
      await get().fetchLatest();
    } finally {
      set({ clearing: false });
    }
  },

  downloadLog: async () => {
    try {
      set({ downloading: true });
      const response = await axiosInstance.get("/activity-logs/admin/download", {
        responseType: "blob",
        timeout: 60000,
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = "activity-log.txt";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      set({ downloading: false });
    }
  },
}));
