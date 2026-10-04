/*
 * Driver portal service worker. Its only job is Web Push: show the
 * notification the backend sends (see backend src/notifications) and open
 * the right screen when it's tapped. No fetch handler / offline caching.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  let message = { title: "MFAH Flow", body: "", url: "/driver" };
  try {
    message = { ...message, ...event.data.json() };
  } catch (e) {
    if (event.data) message.body = event.data.text();
  }

  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      tag: message.tag,
      renotify: Boolean(message.tag),
      icon: "/driver-icon-192.png",
      badge: "/driver-icon-192.png",
      data: { url: message.url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || "/driver", self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const existing = windows.find((w) => w.url.startsWith(self.location.origin));
      if (existing) {
        existing.navigate(url);
        return existing.focus();
      }
      return self.clients.openWindow(url);
    }),
  );
});
