"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Download,
  Share,
  PlusSquare,
  MoreVertical,
  CheckCircle2,
  X,
  Smartphone,
  Laptop,
  Sparkles,
} from "lucide-react";

interface PwaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstallDirect: () => void;
  isStandalone: boolean;
}

export function PwaInstallModal({
  isOpen,
  onClose,
  deferredPrompt,
  onInstallDirect,
  isStandalone,
}: PwaInstallModalProps) {
  const [mounted, setMounted] = useState(false);
  const [osType, setOsType] = useState<"ios" | "android" | "desktop">("desktop");

  useEffect(() => {
    setMounted(true);
    const ua = navigator.userAgent || "";
    if (/iphone|ipad|ipod/i.test(ua)) {
      setOsType("ios");
    } else if (/android/i.test(ua)) {
      setOsType("android");
    } else {
      setOsType("desktop");
    }
  }, []);

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pt-[calc(1rem+env(safe-area-inset-top,0px))] pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-[#0c101b] border border-cyan-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl shadow-cyan-950/40 text-slate-900 dark:text-zinc-100 relative overflow-hidden"
      >
        {/* Resplandor decorativo */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header con botón cerrar */}
        <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 p-2 flex items-center justify-center shrink-0 shadow-inner">
              <Image
                src="/icons/icon-192.png"
                alt="UPGRADE App"
                width={40}
                height={40}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-2">
                Instalar UPGRADE ERP
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-mono">
                  PWA
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Experiencia de aplicación nativa a pantalla completa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Caso 1: Ya está instalada y ejecutándose en modo standalone */}
        {isStandalone ? (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 flex items-start gap-3 my-4">
            <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">¡UPGRADE ERP ya está instalada!</p>
              <p className="text-slate-600 dark:text-zinc-300">
                Actualmente estás usando la aplicación en modo nativo independiente. Ya tienes acceso directo en tu dispositivo.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 relative z-10 text-xs">
            {/* Si hay deferredPrompt disponible en Android o PC, permitir 1-clic */}
            {deferredPrompt && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent border border-cyan-500/30 space-y-3">
                <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-semibold">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  <span>Instalación Automática Lista</span>
                </div>
                <p className="text-slate-600 dark:text-zinc-300">
                  Tu navegador permite instalar la aplicación directamente con un solo toque:
                </p>
                <button
                  type="button"
                  onClick={onInstallDirect}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Download className="w-4 h-4" />
                  <span>Instalar Ahora en este Dispositivo</span>
                </button>
              </div>
            )}

            {/* Pestañas o Guía paso a paso según el Sistema Operativo */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setOsType("android")}
                  className={`flex-1 py-1.5 px-2 rounded-md font-medium text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    osType === "android"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Android (Chrome)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOsType("ios")}
                  className={`flex-1 py-1.5 px-2 rounded-md font-medium text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    osType === "ios"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>iPhone (Safari)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOsType("desktop")}
                  className={`flex-1 py-1.5 px-2 rounded-md font-medium text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    osType === "desktop"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>PC / Mac</span>
                </button>
              </div>

              {/* Guía Android */}
              {osType === "android" && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">
                    Pasos en Google Chrome (Android):
                  </p>
                  <ol className="space-y-2 list-none">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Toca los <strong>tres puntos (⋮)</strong> en la esquina superior derecha del navegador Chrome.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span>
                        Selecciona la opción <strong>&quot;Instalar aplicación&quot;</strong> o <strong>&quot;Agregar a la pantalla principal&quot;</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span>
                        Confirma tocando <strong>&quot;Instalar&quot;</strong>. El icono de UPGRADE aparecerá en la pantalla de inicio de tu celular.
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Guía iPhone iOS */}
              {osType === "ios" && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">
                    Pasos en Safari (iPhone / iPad):
                  </p>
                  <ol className="space-y-2 list-none">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span className="flex items-center gap-1 flex-wrap">
                        Abre este enlace en <strong>Safari</strong> y toca el botón <strong>Compartir</strong>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                          <Share className="w-3 h-3" />
                        </span>
                        en la barra inferior.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span className="flex items-center gap-1 flex-wrap">
                        Desliza hacia abajo en las opciones y toca <strong>&quot;Agregar a pantalla de inicio&quot;</strong>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                          <PlusSquare className="w-3 h-3" />
                        </span>.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        3
                      </span>
                      <span>
                        Toca <strong>&quot;Agregar&quot;</strong> arriba a la derecha. ¡Listo! Se abrirá como app nativa sin barra de navegación.
                      </span>
                    </li>
                  </ol>
                </div>
              )}

              {/* Guía Desktop PC */}
              {osType === "desktop" && (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 space-y-2.5">
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">
                    Pasos en Chrome / Edge / Brave (PC y Mac):
                  </p>
                  <ol className="space-y-2 list-none">
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        1
                      </span>
                      <span>
                        Mira en la barra de direcciones arriba: verás el ícono de <strong>Instalar aplicación</strong> o computadora con flecha.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        2
                      </span>
                      <span>
                        Haz clic en el ícono y luego en <strong>&quot;Instalar&quot;</strong> para crear el acceso directo en tu Escritorio y barra de tareas.
                      </span>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Beneficios de la PWA */}
            <div className="pt-2 border-t border-slate-200 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400 flex items-center justify-around gap-2">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                Sin barra de URL
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                Alertas Web Push
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" />
                Carga ultra rápida
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

