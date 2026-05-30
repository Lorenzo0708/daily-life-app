self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', function(event) {
  // Lascia passare immediatamente qualsiasi richiesta verso la rete reale (Firebase inclusa)
  event.respondWith(fetch(event.request));
});