import { create } from "zustand";
import { driverApi } from "@/lib/driver/api";
import { compressImage } from "@/lib/driver/image-compression";

export type DriverMissionStatus = "PLANNED" | "IN_PROGRESS" | "PENDING_REVIEW" | "FINISHED" | "CANCELLED";
export type MissionBucket = "active" | "upcoming" | "completed";
export type ClosureFileCategory = "CMR" | "ODOMETER_PHOTO";

export interface DriverFile {
  id: number;
  category: "CMR" | "ODOMETER_PHOTO" | "FUEL_RECEIPT" | null;
  label: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedAt: string;
}

export interface DriverMission {
  id: number;
  reference: string;
  status: DriverMissionStatus;
  transportType: "EXPORT" | "IMPORT";
  loadingLocation: string;
  deliveryLocation: string;
  missionDate: string;
  expectedDeliveryDate: string | null;
  goods: string | null;
  weightKg: number | null;
  clientReference: string | null;
  truck: { id: number; plateNumber: string } | null;
  loadingConfirmedAt: string | null;
  completedAt: string | null;
  completionComment: string | null;
}

export type FuelTotals = Partial<Record<"EUR" | "MAD", { amount: string; litres: string; entries: number }>>;

export interface DriverMissionDetail extends DriverMission {
  closureFiles: DriverFile[];
  fuelTotals: FuelTotals;
  fuelEntryCount: number;
}

export interface DriverMissionsOverview {
  counts: Record<MissionBucket, number>;
  active: DriverMission[];
  upcoming: DriverMission[];
  recentCompleted: DriverMission[];
}

interface DriverMissionsStore {
  overview: DriverMissionsOverview | null;
  missions: DriverMission[];
  total: number;
  mission: DriverMissionDetail | null;
  loading: boolean;

  fetchOverview: () => Promise<void>;
  fetchMissions: (bucket?: MissionBucket) => Promise<void>;
  fetchMission: (id: number) => Promise<void>;
  confirmLoading: (id: number) => Promise<void>;
  uploadClosureFile: (id: number, category: ClosureFileCategory, file: File) => Promise<void>;
  deleteClosureFile: (id: number, fileId: number) => Promise<void>;
  completeMission: (id: number, comment?: string) => Promise<void>;
}

export const useDriverMissionsStore = create<DriverMissionsStore>((set, get) => ({
  overview: null,
  missions: [],
  total: 0,
  mission: null,
  loading: false,

  fetchOverview: async () => {
    set({ loading: true });
    try {
      const { data } = await driverApi.get<DriverMissionsOverview>("/driver/missions/overview");
      set({ overview: data });
    } finally {
      set({ loading: false });
    }
  },

  fetchMissions: async (bucket) => {
    set({ loading: true });
    try {
      const { data } = await driverApi.get<{ data: DriverMission[]; total: number }>("/driver/missions", {
        params: { bucket, limit: 100 },
      });
      set({ missions: data.data, total: data.total });
    } finally {
      set({ loading: false });
    }
  },

  fetchMission: async (id) => {
    // Don't flash a different mission's data while loading another one.
    if (get().mission?.id !== id) set({ mission: null });
    set({ loading: true });
    try {
      const { data } = await driverApi.get<DriverMissionDetail>(`/driver/missions/${id}`);
      set({ mission: data });
    } finally {
      set({ loading: false });
    }
  },

  confirmLoading: async (id) => {
    const { data } = await driverApi.patch<DriverMissionDetail>(`/driver/missions/${id}/confirm-loading`);
    set({ mission: data });
  },

  uploadClosureFile: async (id, category, file) => {
    const formData = new FormData();
    formData.append("category", category);
    formData.append("file", await compressImage(file));
    await driverApi.post(`/driver/missions/${id}/closure-files`, formData);
    await get().fetchMission(id);
  },

  deleteClosureFile: async (id, fileId) => {
    await driverApi.delete(`/driver/missions/${id}/closure-files/${fileId}`);
    await get().fetchMission(id);
  },

  completeMission: async (id, comment) => {
    const { data } = await driverApi.post<DriverMissionDetail>(`/driver/missions/${id}/complete`, {
      comment: comment?.trim() || undefined,
    });
    set({ mission: data });
  },
}));
