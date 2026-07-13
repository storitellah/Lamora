/* Lamora service worker — offline-first caching.
   Everything the app needs is precached on install, so Lamora works fully
   offline after the first visit. No analytics, no external requests. */

const CACHE = "lamora-v1";

const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./manifest.json",
  "./audio/audio.js",
  "./lessons/numeracy.js",
  "./lessons/literacy.js",
  "./lessons/nature.js",
  "./lessons/world.js",
  "./games/brain.js",
  "./games/memory.js",
  "./games/chess.js",
  "./games/drawing.js",
  "./colouring/colouring.js",
  "./stickers/stickers.js",
  "./stories/stories.js",
  "./professions/professions.js",
  "./assets/favicon.svg",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable-512.png",
  "./assets/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

/* Cache-first: serve from cache, fall back to network (and cache the
   response for next time). Only same-origin GET requests are handled. */
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;
      return fetch(req).then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
        }
        return res;
      }).catch(() =>
        /* Offline navigation fallback */
        req.mode === "navigate" ? caches.match("./index.html") : undefined
      );
    })
  );
});
