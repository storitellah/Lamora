/* Lamora service worker — offline-first, cache-everything, no network analytics.
   Only same-origin app files are ever cached. Nothing is sent anywhere. */
const CACHE = 'lamora-v2';

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './script.js',
  './manifest.json',
  './favicon.svg',
  './favicon.png',
  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './audio/sounds.js',
  './lessons/numeracy.js',
  './lessons/literacy.js',
  './games/brain.js',
  './games/chess.js',
  './games/nature.js',
  './games/world.js',
  './games/draw.js',
  './colouring/colouring.js',
  './stickers/stickers.js',
  './professions/professions.js',
  './stories/stories.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Cache-first for everything we own; network fallback refreshes the cache.
   Cross-origin requests are never made by the app, and are never cached. */
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});

/* Let the page ask whether a new version is ready. */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
