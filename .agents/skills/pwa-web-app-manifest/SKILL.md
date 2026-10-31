---
name: pwa-web-app-manifest
description: Estándar y arquitectura para transformar aplicaciones Next.js 15+ (App Router) en Progressive Web Apps (PWA) de grado de producción. Define la implementación de Web App Manifest nativo (`src/app/manifest.ts`), configuración de Service Worker (`public/sw.js`), componente de registro no invasivo (`PwaRegister.tsx`), instalación condicionada por rol/dispositivo, meta-tags de viewport (`viewportFit: cover`, `theme-color`), exclusiones en Middleware y acceso seguro WebAuthn/Passkeys para uso móvil o escritorio.
---

# Progressive Web App (PWA) & Web App Manifest Standard

Este estándar define la arquitectura, implementación y buenas prácticas para dotar a aplicaciones empresariales y operativas construidas con **Next.js 15+ (App Router)** de capacidades completas de **Progressive Web App (PWA)** instalable tanto en computadoras de escritorio (Windows / macOS / Linux) como en dispositivos móviles (Android / iOS).

---

## 🎯 1. Principios y Objetivos

1. **Independencia del Navegador**: El usuario puede instalar el sistema en su pantalla de inicio o escritorio, ejecutándose en modo *standalone* (sin barra de direcciones ni controles de navegación del navegador).
2. **Cero Fricción en Acciones Dinámicas**: Las Server Actions, mutaciones POST y endpoints autenticados **nunca** deben ser interceptados por un caché estricto offline que retenga datos desactualizados. La estrategia para datos debe ser **Network-First con fallback resiliente**.
3. **Instalación Selectiva y Ergonómica**: Los banners de instalación deben dispararse en el momento y dispositivo adecuado (por ejemplo, condicionados a una sesión autenticada o a un entorno específico), evitando molestar al usuario en pantallas de login o cuando la app ya corre instalada.
4. **Pantalla Completa Nativa**: Integración visual con barras de estado de iOS y Android mediante `viewportFit: 'cover'`, `theme-color` reactivo y fondos anti-parpadeo.

---

## 🏗️ 2. Arquitectura de Archivos en Next.js (App Router)

```
src/
├── app/
│   ├── manifest.ts          # Generador nativo tipado de Web App Manifest (Next.js MetadataRoute)
│   ├── layout.tsx           # Configuración de Viewport, theme-color y registro del componente PWA
│   └── globals.css          # Ajustes de safe-area-inset y scrollbars táctiles
├── components/
│   └── pwa/
│       └── PwaRegister.tsx  # Registro del Service Worker y banner de instalación adaptativo
public/
├── sw.js                    # Service Worker nativo (Network-First & Asset Caching)
└── icons/
    ├── icon-192.png         # Icono PWA para launchers móviles (192x192 px)
    ├── icon-512.png         # Icono PWA para splash screens (512x512 px)
    └── icon-maskable.png    # Icono adaptable con zona de seguridad para Android
```

---

## ⚙️ 3. Implementación Paso a Paso

### Paso 1: Generador de Web App Manifest (`src/app/manifest.ts`)
Next.js 15 cuenta con soporte nativo de tipo `MetadataRoute.Manifest` que compila automáticamente a `/manifest.webmanifest`:

```typescript
import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UPGRADE ERP | Soluciones IT",
    short_name: "UPGRADE ERP",
    description: "Plataforma integral de gestión de infraestructura IT, finanzas y soporte.",
    start_url: "/",
    display: "standalone",
    background_color: "#07090e",
    theme_color: "#07090e",
    orientation: "any",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
```

### Paso 2: Meta-tags y Viewport en `src/app/layout.tsx`
Configurar el viewport dinámico con soporte de safe-area para muescas de cámaras (iPhone / Android punch-hole):

```typescript
import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#07090e" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover", // Vital para que la PWA no tenga barras negras en iOS/Android
};

export const metadata: Metadata = {
  applicationName: "UPGRADE ERP",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "UPGRADE ERP",
  },
};
```

### Paso 3: Service Worker Resiliente (`public/sw.js`)
El Service Worker debe utilizar una estrategia **Network-First** para todas las solicitudes HTML, API y Server Actions, y **Cache-First** únicamente para iconos y fuentes estáticas:

```javascript
const CACHE_NAME = "app-pwa-v1.0.0";
const STATIC_ASSETS = [
  "/favicon.ico",
  "/icon.png",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

// 1. Instalación y Precaché de activos esenciales
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// 2. Activación y Limpieza de cachés anteriores
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// 3. Estrategia de Fetch: Network-First con fallback a caché
self.addEventListener("fetch", (event) => {
  // Ignorar peticiones no HTTP/HTTPS o Server Actions POST
  if (!event.request.url.startsWith("http") || event.request.method !== "GET") {
    return;
  }

  // Activos estáticos (iconos, imágenes estáticas): Caché primero
  if (STATIC_ASSETS.some((asset) => event.request.url.includes(asset))) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  // Navegación y datos: Red primero, fallback a caché
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
```

### Paso 4: Componente de Registro Adaptativo (`PwaRegister.tsx`)
Permite registrar el Service Worker y capturar el evento `beforeinstallprompt` con reglas de negocio:

```tsx
"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Registrar Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch((err) => console.warn("[PWA] Error SW:", err));
    }

    // 2. Capturar evento de instalación
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Si ya está instalado en standalone, no mostrar banner
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as any).standalone === true;
      if (isStandalone) return;

      // Filtrar por entorno si se desea (ej: solo PC o solo móvil)
      const ua = navigator.userAgent || "";
      const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
      const dismissed = sessionStorage.getItem("pwa_dismissed");

      if (!isMobile && !dismissed) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("pwa_dismissed", "true");
  };

  if (!showInstallBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5">
      <div className="p-4 rounded-2xl bg-white/95 dark:bg-zinc-900/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 p-1.5 flex items-center justify-center shrink-0">
            <img src="/icons/icon-192.png" alt="App" className="w-full h-full object-contain" />
          </div>
          <div className="min-w-0">
            <h5 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
              Instalar Aplicación en PC
            </h5>
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
              Acceso directo rápido y nativo sin barra de navegador
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Paso 5: Protección en Middleware (`src/middleware.ts`)
Asegurarse de que el Service Worker y el manifiesto nunca sean interceptados o redirigidos al login por el middleware de autenticación:

```typescript
// En src/middleware.ts:
if (
  pathname.startsWith("/_next") ||
  pathname === "/favicon.ico" ||
  pathname === "/sw.js" ||
  pathname === "/manifest.webmanifest" ||
  pathname === "/manifest.json" ||
  pathname.startsWith("/icons/")
) {
  return NextResponse.next();
}
```

---

## 🛡️ 4. Reglas Críticas & Guardrails

1. **HTTPS Obligatorio en Producción**: Las PWAs, el registro del Service Worker y el evento `beforeinstallprompt` requieren obligatoriamente un contexto seguro (`https://` o `localhost`).
2. **Evitar Cachear Mutaciones**: Nunca interceptar peticiones `POST`, `PUT` o `DELETE` en el Service Worker. Podría causar duplicación de facturas, transacciones o errores de idempotencia.
3. **Control de Versiones de Caché**: Cada vez que se actualice la estructura de assets o la app sufra cambios mayores, incrementar `CACHE_NAME` (ej: `app-pwa-v1.0.1`) para forzar la invalidación del caché viejo.
4. **Respetar la Elección del Usuario**: Almacenar en `sessionStorage` o `localStorage` el cierre del banner de instalación para no mostrarlo reiteradamente si el usuario no desea instalarla.
