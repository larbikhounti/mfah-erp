import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export type InvoiceStatus = "UNPAID" | "PARTIALLY_PAID" | "PAID";
export type Currency = "MAD" | "EUR";

export interface ClientInvoice {
  id: number;
  missionId: number;
  clientId: number;
  invoiceNumber: string;
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

export interface CreateClientInvoicePayload {
  missionId: number;
  issueDate: string;
  dueDate?: string;
}

export interface UpdateClientInvoicePayload {
  issueDate?: string;
  dueDate?: string;
}

export interface FilterParams {
  offset?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  currency?: Currency;
  clientId?: number;
  showArchived?: boolean;
}

export interface ClientInvoicesResponse {
  data: ClientInvoice[];
  total: number;
}

// Suggested defaults for the "Generate Invoice" dialog, computed server-side
// from the invoice/mission/client/truck. Fields with no source of truth in
// our schema (remorque, cmr, commande, tmsa, immobilisation,
// double_equipage, gazoil, client_city) aren't included here — the dialog
// starts those blank/off.
export interface InvoicePdfPrefill {
  client_name: string;
  client_ice: string;
  invoice_number: string;
  invoice_date: string;
  loading_date: string;
  delivery_date: string;
  matricule: string;
  operation: string;
  designation: string;
  quantity: string;
  unit_price: string;
  line_total: string;
  total_ht: string;
  tva: string;
  total_ttc: string;
  amount_in_words: string;
  hasTruck: boolean;
  currency: Currency;
}

// One entry per fillable field on the invoice PDF template — matches the
// backend's GenerateInvoicePdfDto/the template's own AcroForm field names.
export interface InvoicePdfFields {
  client_name?: string;
  client_city?: string;
  client_ice?: string;
  invoice_number?: string;
  invoice_date?: string;
  loading_date?: string;
  delivery_date?: string;
  matricule?: string;
  remorque?: string;
  operation?: string;
  cmr?: string;
  commande?: string;
  tmsa?: string;
  immobilisation?: string;
  double_equipage?: string;
  gazoil?: string;
  extras_total?: string;
  designation?: string;
  quantity?: string;
  unit_price?: string;
  line_total?: string;
  tva?: string;
  total_ht?: string;
  amount_in_words?: string;
  total_ttc?: string;
}

interface ClientInvoicesStore {
  invoices: ClientInvoice[];
  total: number;
  loading: boolean;
  error: string | null;
  selectedInvoices: number[];
  showArchived: boolean;
  filterClientId: number | null;

  currentPage: number;
  pageSize: number;
  totalPages: number;

  fetchInvoices: (params?: FilterParams) => Promise<void>;
  createInvoice: (data: CreateClientInvoicePayload) => Promise<void>;
  updateInvoice: (id: number, data: UpdateClientInvoicePayload) => Promise<void>;
  recordPayment: (id: number, amountPaid: number) => Promise<void>;
  getPdfPrefill: (id: number) => Promise<InvoicePdfPrefill>;
  generateInvoicePdf: (id: number, fields: InvoicePdfFields) => Promise<Blob>;
  deleteInvoice: (id: number) => Promise<void>;
  bulkDeleteInvoices: (invoiceIds: number[]) => Promise<void>;
  restoreInvoice: (id: number) => Promise<void>;
  bulkRestoreInvoices: (invoiceIds: number[]) => Promise<void>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setShowArchived: (show: boolean) => void;
  setFilterClientId: (clientId: number | null) => void;

  selectInvoice: (id: number) => void;
  selectAllInvoices: () => void;
  clearSelection: () => void;

  clearError: () => void;
}

export const useClientInvoicesStore = create<ClientInvoicesStore>((set, get) => ({
  invoices: [],
  total: 0,
  loading: false,
  error: null,
  selectedInvoices: [],
  showArchived: false,
  filterClientId: null,

  currentPage: 1,
  pageSize: 25,
  totalPages: 0,

  fetchInvoices: async (params: FilterParams = {}) => {
    try {
      set({ loading: true, error: null });

      const { currentPage, pageSize, showArchived, filterClientId } = get();
      const offset = Math.max(0, (currentPage - 1) * pageSize);

      const apiParams: any = {
        offset: Math.max(0, Math.floor(params.offset ?? offset)),
        limit: Math.max(1, Math.floor(params.limit ?? pageSize)),
        showArchived: params.showArchived ?? showArchived,
      };

      if (params.search && params.search.trim()) apiParams.search = params.search.trim();
      if (params.status) apiParams.status = params.status;
      if (params.currency) apiParams.currency = params.currency;
      const clientId = params.clientId ?? filterClientId;
      if (clientId) apiParams.clientId = clientId;

      const response = await axiosInstance.get<ClientInvoicesResponse>("/client-invoices", {
        params: apiParams,
      });

      const totalPages = Math.ceil(response.data.total / pageSize);

      set({
        invoices: response.data.data,
        total: response.data.total,
        totalPages,
        loading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch client invoices",
        loading: false,
      });
    }
  },

  createInvoice: async (data: CreateClientInvoicePayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/client-invoices/admin/create", data);
      await get().fetchInvoices();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to create client invoice",
        loading: false,
      });
      throw error;
    }
  },

  updateInvoice: async (id: number, data: UpdateClientInvoicePayload) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.put(`/client-invoices/admin/${id}`, data);
      await get().fetchInvoices();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to update client invoice",
        loading: false,
      });
      throw error;
    }
  },

  recordPayment: async (id: number, amountPaid: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/client-invoices/admin/${id}/payment`, { amountPaid });
      await get().fetchInvoices();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to record payment",
        loading: false,
      });
      throw error;
    }
  },

  getPdfPrefill: async (id: number) => {
    const response = await axiosInstance.get<InvoicePdfPrefill>(`/client-invoices/admin/${id}/pdf-prefill`);
    return response.data;
  },

  generateInvoicePdf: async (id: number, fields: InvoicePdfFields) => {
    const response = await axiosInstance.post(`/client-invoices/admin/${id}/generate-pdf`, fields, {
      responseType: "blob",
    });
    return response.data as Blob;
  },

  deleteInvoice: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete(`/client-invoices/admin/${id}`);
      await get().fetchInvoices();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete client invoice",
        loading: false,
      });
      throw error;
    }
  },

  bulkDeleteInvoices: async (invoiceIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.delete("/client-invoices/admin/bulk", { data: { clientInvoiceIds: invoiceIds } });
      set({ selectedInvoices: [] });
      await get().fetchInvoices();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to delete client invoices",
        loading: false,
      });
      throw error;
    }
  },

  restoreInvoice: async (id: number) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.patch(`/client-invoices/admin/${id}/restore`);
      await get().fetchInvoices();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore client invoice",
        loading: false,
      });
      throw error;
    }
  },

  bulkRestoreInvoices: async (invoiceIds: number[]) => {
    try {
      set({ loading: true, error: null });
      await axiosInstance.post("/client-invoices/admin/bulk-restore", { clientInvoiceIds: invoiceIds });
      set({ selectedInvoices: [] });
      await get().fetchInvoices();
      set({ loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to restore client invoices",
        loading: false,
      });
      throw error;
    }
  },

  setPage: (page: number) => {
    set({ currentPage: Math.max(1, Math.floor(page)) });
    get().fetchInvoices();
  },

  setPageSize: (pageSize: number) => {
    set({ pageSize: Math.max(1, Math.floor(pageSize)), currentPage: 1 });
    get().fetchInvoices();
  },

  setShowArchived: (show: boolean) => {
    set({ showArchived: show, currentPage: 1 });
    get().fetchInvoices({ showArchived: show });
  },

  setFilterClientId: (clientId: number | null) => {
    set({ filterClientId: clientId, currentPage: 1 });
    get().fetchInvoices({ clientId: clientId ?? undefined });
  },

  selectInvoice: (id: number) => {
    const { selectedInvoices } = get();
    set({
      selectedInvoices: selectedInvoices.includes(id)
        ? selectedInvoices.filter((invoiceId) => invoiceId !== id)
        : [...selectedInvoices, id],
    });
  },

  selectAllInvoices: () => {
    const { invoices } = get();
    set({ selectedInvoices: invoices.map((i) => i.id) });
  },

  clearSelection: () => set({ selectedInvoices: [] }),

  clearError: () => set({ error: null }),
}));
