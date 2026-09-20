import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

interface InvoiceTemplateState {
  uploading: boolean;
  downloadTemplate: () => Promise<Blob>;
  uploadTemplate: (file: File) => Promise<void>;
}

export const useInvoiceTemplateStore = create<InvoiceTemplateState>((set) => ({
  uploading: false,

  downloadTemplate: async () => {
    const response = await axiosInstance.get("/invoice-template", { responseType: "blob" });
    return response.data as Blob;
  },

  uploadTemplate: async (file: File) => {
    set({ uploading: true });
    try {
      const formData = new FormData();
      formData.append("file", file);
      // The conversion pipeline itself can take several seconds even for
      // the small generate-pdf case — an upload/validation round trip
      // gets the same longer timeout rather than the 10s CRUD default.
      await axiosInstance.post("/invoice-template", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
    } finally {
      set({ uploading: false });
    }
  },
}));
