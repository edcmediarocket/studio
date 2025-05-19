
// public/sw.js
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  // Future: self.skipWaiting();
  // Future: Cache app shell assets
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  // Future: event.waitUntil(clients.claim());
  // Future: Clean up old caches
});

self.addEventListener('fetch', (event) => {
  // console.log('Service Worker: Fetching ', event.request.url);
  // For a basic PWA, we can let the browser handle fetch by default.
  // More advanced strategies (cache-first, network-first) can be added later.
  // event.respondWith(fetch(event.request));
});
