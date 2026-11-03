"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Download, X, Smartphone } from "lucide-react";
import { PwaInstallModal } from "./PwaInstallModal";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // 1. Registro del Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("[PWA] Service Worker registrado con éxito:", reg.scope);
        })
        .catch((err) => {
          console.warn("[PWA] Error al registrar Service Worker:", err);
        });
    }

    // 2. Comprobar si ya está en modo standalone
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as any).standalone === true;
    setIsStandalone(standaloneMode);

    if (standaloneMode) return;

    // 3. Captura del evento beforeinstallprompt para instalación nativa
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Solo mostrar banner si el usuario no lo cerró en esta sesión
      const dismissed = sessionStorage.getItem("upgrade_pwa_dismissed");
      if (!dismissed) {
        setShowInstallBanner(true);
      }
    };

    // 4. Listener para abrir la instalación desde el Sidebar o cualquier botón
    const handleTriggerInstall = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(({ outcome }: { outcome: string }) => {
          if (outcome === "accepted") {
            setShowInstallBanner(false);
            setDeferredPrompt(null);
          }
        });
      } else {
        // En iOS Safari o navegadores sin prompt automático, abrir modal con instrucciones
        setShowModal(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("upgrade:trigger-pwa-install", handleTriggerInstall);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("upgrade:trigger-pwa-install", handleTriggerInstall);
    };
  }, [deferredPrompt]);

  const handleInstallClick = useCallback(async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  }, [deferredPrompt]);

  const handleDismiss = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem("upgrade_pwa_dismissed", "true");
  };

  return (
    <>
      {/* Banner flotante sutil en parte inferior si no está instalada */}
      {showInstallBanner && !isStandalone && (
        <aside
          aria-label="Aviso de instalación de aplicación"
          className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom,0px))] left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 dark:bg-[#0c101b]/95 border border-cyan-500/30 backdrop-blur-xl shadow-2xl shadow-cyan-950/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 p-1.5 flex items-center justify-center shrink-0">
                <Image
                  src="/icons/icon-192.png"
                  alt="UPGRADE App"
                  width={32}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-slate-900 dark:text-zinc-100 truncate">
                  Instalar UPGRADE ERP
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                  Acceso directo a pantalla completa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Instalar</span>
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                aria-label="Cerrar aviso"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Modal interactivo con pasos paso a paso para iOS, Android y PC */}
      <PwaInstallModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        deferredPrompt={deferredPrompt}
        onInstallDirect={() => {
          if (deferredPrompt) {
            deferredPrompt.prompt();
            setShowModal(false);
          }
        }}
        isStandalone={isStandalone}
      />
    </>
  );
}
