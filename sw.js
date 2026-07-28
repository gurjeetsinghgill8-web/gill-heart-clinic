// Cache version - bump this number every time you update the site
// This forces ALL visitors' browsers to clear old cache automatically
const CACHE = 'gill-heart-clinic-v10';

const URLS = [
  '/gill-heart-clinic/',
  '/gill-heart-clinic/index.html',
  '/gill-heart-clinic/manifest.json'
];

// Install: cache only essential files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(URLS))
  );
  // Take control immediately - don't wait for old SW to die
  self.skipWaiting();
});

// Activate: delete ALL old caches immediately
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim()) // Take control of all open pages
  );
});

// Fetch: NETWORK FIRST strategy - always try fresh from server
// Only fall back to cache if network is unavailable (offline)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Got fresh response - update cache and return it
        const clone = response.clone();
        caches.open(CACHE).then((cache) => cache.put(e.request, clone));
        return response;
      })
      .catch(() => {
        // Network failed - serve from cache (offline fallback)
        return caches.match(e.request);
      })
  );
});
