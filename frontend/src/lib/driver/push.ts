import { driverApi } from "./api";

/**
 * Web Push plumbing for the driver portal: service worker registration,
 * permission, and (un)subscribing this browser with the backend.
 */
const SERVICE_WORKER_URL = "/driver-sw.js";

export type PushState =
  | "unsupported" // old browser, or iPhone Safari not added to the home screen
  | "needs-install" // iPhone: must "Add to Home Screen" first
  | "denied" // the driver blocked notifications in the browser settings
  | "disabled" // server has no VAPID keys configured
  | "off"
  | "on";

export function isIos(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return Promise.resolve(null);
  }
  return navigator.serviceWorker.register(SERVICE_WORKER_URL).catch(() => null);
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

export async function getPushState(): Promise<PushState> {
  if (!pushSupported()) {
    return isIos() && !isStandalone() ? "needs-install" : "unsupported";
  }
  if (Notification.permission === "denied") return "denied";
  const subscription = await currentSubscription();
  return subscription ? "on" : "off";
}

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  const output = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

/** Must be called from a tap — browsers only show the prompt after a user gesture. */
export async function enablePush(): Promise<PushState> {
  if (!pushSupported()) return getPushState();

  const { data } = await driverApi.get<{ publicKey: string | null }>("/driver/push/public-key");
  if (!data.publicKey) return "disabled";

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";

  const registration = await navigator.serviceWorker.ready;
  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(data.publicKey),
    }));

  await driverApi.post("/driver/push/subscriptions", subscription.toJSON());
  return "on";
}

export async function disablePush(): Promise<PushState> {
  if (!pushSupported()) return getPushState();
  const subscription = await currentSubscription();
  if (subscription) {
    await driverApi
      .delete("/driver/push/subscriptions", { data: { endpoint: subscription.endpoint } })
      .catch(() => undefined);
    await subscription.unsubscribe();
  }
  return "off";
}
