import { create } from "zustand";
import { axiosInstance } from "@/lib/utils";

export type PermissionModule =
  | "TRUCKS"
  | "DRIVERS"
  | "CLIENTS"
  | "SUBCONTRACTORS"
  | "MISSIONS"
  | "CLIENT_INVOICES"
  | "SUBCONTRACTOR_BILLS"
  | "DASHBOARD"
  | "REPORTS";

export const ALL_PERMISSION_MODULES: PermissionModule[] = [
  "TRUCKS",
  "DRIVERS",
  "CLIENTS",
  "SUBCONTRACTORS",
  "MISSIONS",
  "CLIENT_INVOICES",
  "SUBCONTRACTOR_BILLS",
  "DASHBOARD",
  "REPORTS",
];

export interface Permission {
  id: number;
  roleId: number;
  module: PermissionModule;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

export interface PermissionEntry {
  module: PermissionModule;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

interface PermissionsStore {
  permissions: Permission[];
  loading: boolean;
  saving: boolean;
  error: string | null;

  fetchPermissions: (roleId: number) => Promise<void>;
  savePermissions: (roleId: number, entries: PermissionEntry[]) => Promise<void>;
  clearError: () => void;
}

export const usePermissionsStore = create<PermissionsStore>((set) => ({
  permissions: [],
  loading: false,
  saving: false,
  error: null,

  fetchPermissions: async (roleId: number) => {
    try {
      set({ loading: true, error: null });
      const response = await axiosInstance.get<Permission[]>(`/permissions/roles/${roleId}`);
      set({ permissions: response.data, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch permissions",
        loading: false,
      });
    }
  },

  savePermissions: async (roleId: number, entries: PermissionEntry[]) => {
    try {
      set({ saving: true, error: null });
      const response = await axiosInstance.put<Permission[]>(`/permissions/roles/${roleId}`, {
        permissions: entries,
      });
      set({ permissions: response.data, saving: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to save permissions",
        saving: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
