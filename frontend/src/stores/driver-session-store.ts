import { create } from "zustand";
import { driverApi } from "@/lib/driver/api";
import { driverSession, DriverSessionProfile } from "@/lib/driver/session";
import { disablePush } from "@/lib/driver/push";

export interface DriverProfile extends DriverSessionProfile {
  cin: string;
}

interface LoginResponse {
  access_token: string;
  driver: DriverSessionProfile;
}

interface DriverSessionStore {
  profile: DriverSessionProfile | null;
  /** False until the session has been read from storage (client only). */
  ready: boolean;

  hydrate: () => void;
  login: (phone: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<DriverProfile>;
}

export const useDriverSessionStore = create<DriverSessionStore>((set) => ({
  profile: null,
  ready: false,

  hydrate: () => {
    set({
      profile: driverSession.getToken() ? driverSession.getProfile() : null,
      ready: true,
    });
  },

  login: async (phone, pin) => {
    const { data } = await driverApi.post<LoginResponse>("/driver/auth/login", { phone, pin });
    driverSession.start(data.access_token, data.driver, phone);
    set({ profile: data.driver });
  },

  logout: async () => {
    // A shared phone must stop receiving the previous driver's notifications.
    await disablePush().catch(() => undefined);
    driverSession.end();
    set({ profile: null });
  },

  fetchProfile: async () => {
    const { data } = await driverApi.get<DriverProfile>("/driver/auth/me");
    return data;
  },
}));
