// Safe Service Worker — Does NOTHING, just unregisters old harmful versions
self.addEventListener('install', (e) => {
  // Immediately take control and unregister any old destructive SW
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // Unregister this service worker - we don't need it
    self.registration.unregister()
    .then(() => {
      // Clear old caches that might have been created by previous SW
      return caches.keys().then((keys) => {
        if (keys.length > 0) {
          return Promise.all(keys.map((k) => caches.delete(k)));
        }
      });
    })
  );
  // DON'T claim clients - let the page render normally
});
