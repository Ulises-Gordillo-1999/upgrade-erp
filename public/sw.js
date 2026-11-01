// UPGRADE ERP - Service Worker para Soporte PWA & Notificaciones Web Push
const CACHE_NAME = "upgrade-erp-cache-v2";

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

// ==============================================================================
// 4. Recepción de Web Push Notifications (Celular & Escritorio)
// ==============================================================================
self.addEventListener("push", (event) => {
  let notificationData = {
    title: "UPGRADE ERP",
    body: "Nueva notificación operativa del sistema",
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    url: "/",
    tag: "upgrade-notification",
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      notificationData = { ...notificationData, ...parsed };
    } catch (e) {
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon || "/icons/icon-192.png",
    badge: notificationData.badge || "/icons/icon-192.png",
    tag: notificationData.tag || "upgrade-push",
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: notificationData.url || "/",
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: "open",
        title: "Abrir ERP",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions)
  );
});

// ==============================================================================
// 5. Interacción del Usuario con la Notificación Push (Clic)
// ==============================================================================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // Si ya hay una ventana abierta de la PWA, enfocarla y navegar a la ruta
        for (const client of windowClients) {
          if (client.url && "focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
        // Si no hay ventana abierta, abrir una nueva ventana o pestaña de la PWA
        if (self.clients.openWindow) {
          return self.clients.openWindow(targetUrl);
        }
      })
  );
});


