"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Image as ImageIcon, X, Loader2 } from "lucide-react";
import { getFileUrl } from "@/app/actions/boveda";
// eslint-disable-next-line @next/next/no-img-element

export function BovedaImageModal({ path }: { path: string }) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = async () => {
    setIsOpen(true);
    if (!imageUrl) {
      setLoading(true);
      try {
        const url = await getFileUrl(path);
        setImageUrl(url);
      } catch (error) {
        console.error(error);
        alert("No se pudo cargar la imagen segura.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="min-h-[40px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-300 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all border border-slate-200 dark:border-zinc-700 w-fit active:scale-95"
      >
        <ImageIcon className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
        <span>Ver Adjunto / QR</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h2 className="text-base font-bold flex items-center text-slate-900 dark:text-zinc-100 gap-2">
                <ImageIcon className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                <span>Visor de Archivo Seguro / QR</span>
              </h2>
              <button
                onClick={handleClose}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
                type="button"
                title="Cerrar visor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center min-h-[240px] bg-slate-50 dark:bg-zinc-950 rounded-2xl border border-slate-200 dark:border-zinc-800/80 p-3 relative overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center text-slate-500 dark:text-zinc-500 py-8">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-rose-500" />
                  <span className="text-xs font-medium">Desencriptando y cargando imagen segura...</span>
                </div>
              ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Documento Seguro"
                  className="max-w-full max-h-[68dvh] object-contain rounded-xl shadow-md"
                />
              ) : (
                <span className="text-slate-400 dark:text-zinc-500 text-xs">Error al cargar la imagen</span>
              )}
            </div>

            <p className="text-[11px] text-center text-slate-500 dark:text-zinc-500">
              Archivo encriptado y protegido por sesión autenticada en el servidor.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
