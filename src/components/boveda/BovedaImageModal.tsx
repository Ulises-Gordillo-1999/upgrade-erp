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
        className="mt-4 flex items-center px-3 py-1.5 text-xs font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 hover:text-white rounded-xl transition-all border border-zinc-700 w-fit"
      >
        <ImageIcon className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
        Ver Imagen Segura
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h2 className="text-base font-semibold flex items-center text-zinc-200 gap-2">
                <ImageIcon className="w-4 h-4 text-rose-400" />
                Visor de Archivo Seguro
              </h2>
              <button
                onClick={handleClose}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-center min-h-[220px] bg-zinc-950 rounded-xl border border-zinc-800/80 p-3 relative overflow-hidden">
              {loading ? (
                <div className="flex flex-col items-center text-zinc-500 py-8">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 text-rose-500" />
                  <span className="text-xs">Desencriptando y cargando imagen...</span>
                </div>
              ) : imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={imageUrl}
                  alt="Documento Seguro"
                  className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-md"
                />
              ) : (
                <span className="text-zinc-500 text-xs">Error al cargar la imagen</span>
              )}
            </div>

            <p className="text-[11px] text-center text-zinc-500">
              Esta imagen está protegida por sesión autenticada en el servidor.
            </p>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
