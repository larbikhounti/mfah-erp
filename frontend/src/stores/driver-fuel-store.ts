import { create } from "zustand";
import { driverApi } from "@/lib/driver/api";
import { compressImage } from "@/lib/driver/image-compression";
import type { DriverFile, FuelTotals } from "./driver-missions-store";

export type FuelCurrency = "EUR" | "MAD";

export interface DriverFuelEntry {
  id: number;
  missionId: number;
  missionReference: string;
  litres: string;
  unitPrice: string;
  currency: FuelCurrency;
  totalAmount: string;
  odometerKm: number;
  createdAt: string;
  receipt: DriverFile | null;
}

export interface AddFuelEntryPayload {
  litres: number;
  unitPrice: number;
  currency: FuelCurrency;
  odometerKm: number;
  receipt?: File | null;
}

interface DriverFuelStore {
  entries: DriverFuelEntry[];
  totals: FuelTotals;
  total: number;
  loading: boolean;

  /** All the driver's entries, or one mission's when `missionId` is given. */
  fetchEntries: (missionId?: number) => Promise<void>;
  addEntry: (missionId: number, payload: AddFuelEntryPayload) => Promise<void>;
  deleteEntry: (entryId: number, missionId?: number) => Promise<void>;
}

export const useDriverFuelStore = create<DriverFuelStore>((set, get) => ({
  entries: [],
  totals: {},
  total: 0,
  loading: false,

  fetchEntries: async (missionId) => {
    set({ loading: true });
    try {
      const { data } = await driverApi.get<{ data: DriverFuelEntry[]; total: number; totals: FuelTotals }>(
        "/driver/fuel-entries",
        { params: { missionId, limit: 100 } },
      );
      set({ entries: data.data, totals: data.totals, total: data.total });
    } finally {
      set({ loading: false });
    }
  },

  addEntry: async (missionId, { receipt, ...fields }) => {
    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => formData.append(key, String(value)));
    if (receipt) formData.append("receipt", await compressImage(receipt));

    await driverApi.post(`/driver/missions/${missionId}/fuel-entries`, formData);
    await get().fetchEntries(missionId);
  },

  deleteEntry: async (entryId, missionId) => {
    await driverApi.delete(`/driver/fuel-entries/${entryId}`);
    await get().fetchEntries(missionId);
  },
}));
