// Service Worker para forzado de seguridad y cache seguro en Fundación ULEP
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Asegurar que ninguna petición viaje sobre HTTP no seguro
  if (
    event.request.url.startsWith('http://') &&
    !event.request.url.includes('localhost') &&
    !event.request.url.includes('127.0.0.1')
  ) {
    const secureUrl = event.request.url.replace(/^http:\/\//i, 'https://');
    event.respondWith(Response.redirect(secureUrl, 301));
  }
});
