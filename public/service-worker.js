const OFFLINE_CACHE = "trudev-offline-v1";
const OFFLINE_PAGE = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(Promise.all([
    caches.open(OFFLINE_CACHE).then((cache) => cache.add(OFFLINE_PAGE)),
    self.skipWaiting(),
  ]));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then((keys) => Promise.all(
        keys.filter((key) => key.startsWith("trudev-offline-") && key !== OFFLINE_CACHE)
          .map((key) => caches.delete(key)),
      )),
    ]),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || request.mode !== "navigate") return;

  event.respondWith(
    fetch(request).catch(async () => {
      const offlinePage = await caches.match(OFFLINE_PAGE);
      return offlinePage || Response.error();
    }),
  );
});
