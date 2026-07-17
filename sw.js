const CACHE = 'gill-heart-clinic-v1';
const URLS = [
  '/gill-heart-clinic/',
  '/gill-heart-clinic/index.html',
  '/gill-heart-clinic/style.css',
  '/gill-heart-clinic/script.js',
  '/gill-heart-clinic/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(URLS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))
    ))
  );
});
