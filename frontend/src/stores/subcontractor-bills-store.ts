import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";
export type Currency = "MAD" | "EUR";

export interface SubcontractorBill {
  id: number;
  missionId: number;
  subcontractorId: number;
  billNumber: string;
  amount: string;
  amountPaid: string;
  currency: Currency;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateSubcontractorBillPayload {
  missionId: number;
  issueDate: string;
  dueDate?: string;
}

export interface UpdateSubcontractorBillPayload {
  issueDate?: string;
  dueDate?: string;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  currency?: Currency;
  subcontractorId?: number;
  showArchived?: boolean;
}

export interface SubcontractorBillsResponse {
  data: SubcontractorBill[];
  total: number;
}

interface SubcontractorBillsStore {
  bills: SubcontractorBill[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedBills: number[];
  showArchived: boolean;
  filterSubcontractorId: number | null;

  currentPage: number;
  pageSize: number;
  totalPages: number;

  fetchBills: (params?: FilterParams) => Promise<void>;
  createBill: (data: CreateSubcontractorBillPayload) => Promise<void>;
  updateBill: (id: number, data: UpdateSubcontractorBillPayload) => Promise<void>;
  recordPayment: (id: number, amountPaid: number) => Promise<void>;
  deleteBill: (id: number) => Promise<void>;
  bulkDeleteBills: (billIds: number[]) => Promise<void>;
  restoreBill: (id: number) => Promise<void>;
  bulkRestoreBills: (billIds: number[]) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setShowArchived: (show: boolean) => void;
  setFilterSubcontractorId: (subcontractorId: number | null) => void;

  selectBill: (id: number) => void;
  selectAllBills: () => void;
  clearSelection: () => void;

  clearError: () => void;
}

export const useSubcontractorBillsStore = create<SubcontractorBillsStore>((set, get) => ({
  bills: [],
  total: 0,
  loading: false,
  error: null,
  selectedBills: [],
  showArchived: false,
  filterSubcontractorId: null,

  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  fetchBills: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize, showArchived, filterSubcontractorId } = get();
      const offset = Math.max(0, (currentPage - 1) * pageSize);

      const apiParams: any = {
        offset: Math.max(0, Math.floor(params.offset ?? offset)),
        limit: Math.max(1, Math.floor(params.limit ?? pageSize)),
        showArchived: params.showArchived ?? showArchived,
      };

      if (params.search && params.search.trim()) apiParams.search = params.search.trim();
      if (params.status) apiParams.status = params.status;
      if (params.currency) apiParams.currency = params.currency;
      const subcontractorId = params.subcontractorId ?? filterSubcontractorId;
      if (subcontractorId) apiParams.subcontractorId = subcontractorId;

      const response = await axiosInstance.get<SubcontractorBillsResponse>("/subcontractor-bills", {
        params: apiParams,
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        bills: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch subcontractor bills",
        loading: false,
      });
    }
  },

  createBill: async (data: CreateSubcontractorBillPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/subcontractor-bills/admin/create", data);
      await get().fetchBills();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create subcontractor bill",
        loading: false,
      });
      throw error;
    }
  },

  updateBill: async (id: number, data: UpdateSubcontractorBillPayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/subcontractor-bills/admin/${id}`, data);
      await get().fetchBills();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update subcontractor bill",
        loading: false,
      });
      throw error;
    }
  },

  recordPayment: async (id: number, amountPaid: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/subcontractor-bills/admin/${id}/payment`, { amountPaid });
      await get().fetchBills();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to record payment",
        loading: false,
      });
      throw error;
    }
  },

  deleteBill: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete(`/subcontractor-bills/admin/${id}`);
      await get().fetchBills();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete subcontractor bill",
        loading: false,
      });
      throw error;
    }
  },

  bulkDeleteBills: async (billIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete("/subcontractor-bills/admin/bulk", { data: { subcontractorBillIds: billIds } });
      set({ selectedBills: [] });
      await get().fetchBills();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete subcontractor bills",
        loading: false,
      });
      throw error;
    }
  },

  restoreBill: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/subcontractor-bills/admin/${id}/restore`);
      await get().fetchBills();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore subcontractor bill",
        loading: false,
      });
      throw error;
    }
  },

  bulkRestoreBills: async (billIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/subcontractor-bills/admin/bulk-restore", { subcontractorBillIds: billIds });
      set({ selectedBills: [] });
      await get().fetchBills();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore subcontractor bills",
        loading: false,
      });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ currentPage: Math.max(1, Math.floor(page)) });
    get().fetchBills();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, Math.floor(pageSize)), currentPage: 1 });
    get().fetchBills();
  },

  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchBills({ showArchived: show });
  },

  setFilterSubcontractorId: (subcontractorId: number | null) => {
    set({ filterSubcontractorId: subcontractorId, currentPage: 1 });
    get().fetchBills({ subcontractorId: subcontractorId ?? undefined });
  },

  selectBill: (id: number) => {
    const { selectedBills } = get();
    set({
      selectedBills: selectedBills.includes(id)
        ? selectedBills.filter((billId) => billId !== id)
        : [...selectedBills, id],
    });
  },

  selectAllBills: () => {
    const { bills } = get();
    set({ selectedBills: bills.map((b) => b.id) });
  },

  clearSelection: () => set({ selectedBills: [] }),

  clearError: () => set({ error: null }),
}));
