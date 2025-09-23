self.addEventListener("install", (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open("static-v1");
    await cache.addAll(["/", "/offline.html"]);
  })());
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith((async () => {
    try {
      const res = await fetch(event.request);
      const cache = await caches.open("runtime-v1");
      cache.put(event.request, res.clone());
      return res;
    } catch {
      const cached = await caches.match(event.request);
      return cached || caches.match("/offline.html");
    }
  })());
});
