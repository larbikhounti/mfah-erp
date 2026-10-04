/**
 * Driver-portal session, stored under its own localStorage keys so a driver
 * session and a staff session (same browser, e.g. ops testing) never clash.
 */
const TOKEN_KEY = "driver_access_token";
const DRIVER_KEY = "driver_profile";
// Kept after logout on purpose: return visits only ask for the PIN.
const REMEMBERED_KEY = "driver_remembered";

export interface DriverSessionProfile {
  id: number;
  fullName: string;
  phone: string;
}

/** Who last signed in on this phone, as typed at login. */
export interface RememberedDriver {
  phone: string;
  fullName: string;
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Private mode / storage disabled: the session just won't persist.
  }
}

function readJson<T>(key: string): T | null {
  const raw = read(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export const driverSession = {
  getToken: () => read(TOKEN_KEY),

  getProfile: () => readJson<DriverSessionProfile>(DRIVER_KEY),

  /** `loginPhone` is the number as the driver typed it, reused next time. */
  start(token: string, profile: DriverSessionProfile, loginPhone: string) {
    write(TOKEN_KEY, token);
    write(DRIVER_KEY, JSON.stringify(profile));
    write(REMEMBERED_KEY, JSON.stringify({ phone: loginPhone, fullName: profile.fullName }));
  },

  end() {
    write(TOKEN_KEY, null);
    write(DRIVER_KEY, null);
  },

  getRemembered: () => readJson<RememberedDriver>(REMEMBERED_KEY),
  forget: () => write(REMEMBERED_KEY, null),
};
