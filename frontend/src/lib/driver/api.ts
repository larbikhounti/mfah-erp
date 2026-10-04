import axios, { AxiosError } from "axios";
import { driverSession } from "./session";

export const DRIVER_LOGIN_PATH = "/driver/login";

/**
 * Axios instance for every driver-portal call — the driver counterpart of
 * the staff `axiosInstance` in lib/utils.ts. A 401 means the session was
 * revoked (PIN reset, access removed) or expired: back to the PIN screen.
 */
export const driverApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  // Uploads from a phone on a mobile network can be slow.
  timeout: 60000,
});

driverApi.interceptors.request.use((config) => {
  const token = driverSession.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

driverApi.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLogin = error.config?.url?.includes("/driver/auth/login");
    if (error.response?.status === 401 && !isLogin && typeof window !== "undefined") {
      driverSession.end();
      window.location.href = DRIVER_LOGIN_PATH;
    }
    return Promise.reject(error);
  },
);

/** The backend's error message, for toasts. */
export function apiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return "No connection. Check your network and try again.";
    const message = (error.response.data as { message?: string | string[] })?.message;
    if (Array.isArray(message)) return message[0];
    if (message) return message;
  }
  return fallback;
}
