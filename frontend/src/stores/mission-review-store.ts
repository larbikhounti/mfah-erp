import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

/** What the driver reported through the driver portal, for ops to review. */

export interface MissionFile {
  id: number;
  category: "CMR" | "ODOMETER_PHOTO" | "FUEL_RECEIPT" | null;
  label: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedAt: string;
}

export interface FuelEntry {
  id: number;
  missionId: number;
  driverId: number;
  truckId: number | null;
  litres: string;
  unitPrice: string;
  currency: "MAD" | "EUR";
  totalAmount: string;
  odometerKm: number;
  createdAt: string;
  receipt: MissionFile | null;
}

export type FuelTotals = Partial<Record<"MAD" | "EUR", { amount: string; litres: string; entries: number }>>;

interface MissionReviewStore {
  missionId: number | null;
  fuelEntries: FuelEntry[];
  fuelTotals: FuelTotals;
  files: MissionFile[];
  loading: boolean;

  fetchReport: (missionId: number) => Promise<void>;
}

export const useMissionReviewStore = create<MissionReviewStore>((set) => ({
  missionId: null,
  fuelEntries: [],
  fuelTotals: {},
  files: [],
  loading: false,

  fetchReport: async (missionId) => {
    set({ missionId, loading: true, fuelEntries: [], fuelTotals: {}, files: [] });
    try {
      const [fuel, files] = await Promise.all([
        axiosInstance.get<{ data: FuelEntry[]; totals: FuelTotals }>("/fuel-entries", {
          params: { missionId, limit: 200 },
        }),
        axiosInstance.get<MissionFile[]>(`/missions/${missionId}/attachments`),
      ]);
      set({ fuelEntries: fuel.data.data, fuelTotals: fuel.data.totals, files: files.data });
    } finally {
      set({ loading: false });
    }
  },
}));
