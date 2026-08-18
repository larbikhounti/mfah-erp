import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export interface Client {
  id: number;
  companyName: string;
  address: string | null;
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  ice: string;
  bankName: string | null;
  bankRib: string | null;
  bankIban: string | null;
  bankSwift: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateClientPayload {
  companyName: string;
  address?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  ice: string;
  bankName?: string;
  bankRib?: string;
  bankIban?: string;
  bankSwift?: string;
}

export interface UpdateClientPayload extends Partial<CreateClientPayload> {}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  showArchived?: boolean;
}

export interface ClientsResponse {
  data: Client[];
  total: number;
}

interface ClientsStore {
  clients: Client[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedClients: number[];
  showArchived: boolean;

  currentPage: number;
  pageSize: number;
  totalPages: number;

  fetchClients: (params?: FilterParams) => Promise<void>;
  createClient: (data: CreateClientPayload) => Promise<void>;
  updateClient: (id: number, data: UpdateClientPayload) => Promise<void>;
  deleteClient: (id: number) => Promise<void>;
  bulkDeleteClients: (clientIds: number[]) => Promise<void>;
  restoreClient: (id: number) => Promise<void>;
  bulkRestoreClients: (clientIds: number[]) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setShowArchived: (show: boolean) => void;

  selectClient: (id: number) => void;
  selectAllClients: () => void;
  clearSelection: () => void;

  clearError: () => void;
}

export const useClientsStore = create<ClientsStore>((set, get) => ({
  clients: [],
  total: 0,
  loading: false,
  error: null,
  selectedClients: [],
  showArchived: false,

  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  fetchClients: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize, showArchived } = get();
      const offset = Math.max(0, (currentPage - 1) * pageSize);

      const apiParams: any = {
        offset: Math.max(0, Math.floor(params.offset ?? offset)),
        limit: Math.max(1, Math.floor(params.limit ?? pageSize)),
        showArchived: params.showArchived ?? showArchived,
      };

      if (params.search && params.search.trim()) {
        apiParams.search = params.search.trim();
      }

      const response = await axiosInstance.get<ClientsResponse>("/clients", {
        params: apiParams,
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        clients: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch clients",
        loading: false,
      });
    }
  },

  createClient: async (data: CreateClientPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/clients/admin/create", data);
      await get().fetchClients();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create client",
        loading: false,
      });
      throw error;
    }
  },

  updateClient: async (id: number, data: UpdateClientPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/clients/admin/${id}`, data);
      await get().fetchClients();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update client",
        loading: false,
      });
      throw error;
    }
  },

  deleteClient: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete(`/clients/admin/${id}`);
      await get().fetchClients();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete client",
        loading: false,
      });
      throw error;
    }
  },

  bulkDeleteClients: async (clientIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete("/clients/admin/bulk", { data: { clientIds } });
      set({ selectedClients: [] });
      await get().fetchClients();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete clients",
        loading: false,
      });
      throw error;
    }
  },

  restoreClient: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/clients/admin/${id}/restore`);
      await get().fetchClients();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore client",
        loading: false,
      });
      throw error;
    }
  },

  bulkRestoreClients: async (clientIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/clients/admin/bulk-restore", { clientIds });
      set({ selectedClients: [] });
      await get().fetchClients();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore clients",
        loading: false,
      });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ currentPage: Math.max(1, Math.floor(page)) });
    get().fetchClients();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, Math.floor(pageSize)), currentPage: 1 });
    get().fetchClients();
  },

  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchClients({ showArchived: show });
  },

  selectClient: (id: number) => {
    const { selectedClients } = get();
    set({
      selectedClients: selectedClients.includes(id)
        ? selectedClients.filter((clientId) => clientId !== id)
        : [...selectedClients, id],
    });
  },

  selectAllClients: () => {
    const { clients } = get();
    set({ selectedClients: clients.map((client) => client.id) });
  },

  clearSelection: () => set({ selectedClients: [] }),

  clearError: () => set({ error: null }),
}));
