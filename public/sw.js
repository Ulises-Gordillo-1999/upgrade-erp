// UPGRADE ERP - Service Worker para Soporte PWA & Instalabilidad Móvil
const CACHE_NAME = "upgrade-erp-cache-v1";

const PRECACHE_ASSETS = [
  "/favicon.ico",
  "/icon.png",
  "/apple-icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First para datos dinámicos y Cache-First para iconos estáticos de marca
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // No interceptar métodos que no sean GET ni Server Actions de Next.js
  if (event.request.method !== "GET" || event.request.headers.get("next-action")) {
    return;
  }

  // Rutas estáticas de iconos e imágenes de marca: Cache-First
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/icon.png" ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/apple-icon.png"
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Todo lo demás: Pasar directo a la red (Network-First) para asegurar frescura de datos en tiempo real
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
