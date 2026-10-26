"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Receipt, X, Download, ExternalLink, FileText, Image as ImageIcon } from "lucide-react";

interface Props {
  url: string;
  descripcion?: string;
  triggerButton?: React.ReactNode;
}

export function ComprobanteViewerModal({ url, descripcion = "Comprobante de movimiento", triggerButton }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isPdf = url.toLowerCase().endsWith(".pdf");

  return (
    <>
      {triggerButton ? (
        <div onClick={() => setIsOpen(true)} className="inline-block cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all"
          title="Ver comprobante adjunto"
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Comprobante</span>
        </button>
      )}

      {isOpen &&
        mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="relative w-full max-w-3xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-950/60 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    {isPdf ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Comprobante Adjunto
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400 truncate max-w-sm sm:max-w-md">
                      {descripcion}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Abrir en pestaña nueva"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <a
                    href={url}
                    download
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                    title="Descargar archivo"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Contenido Visualizador */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-slate-100/50 dark:bg-zinc-950/60 min-h-[300px]">
                {isPdf ? (
                  <iframe
                    src={url}
                    title="Vista previa del comprobante"
                    className="w-full h-[65vh] rounded-xl border border-slate-200 dark:border-zinc-800 bg-white"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={descripcion}
                    className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-md border border-slate-200 dark:border-zinc-800"
                  />
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-950/60 text-xs text-slate-500 dark:text-zinc-400 shrink-0">
                <span>Formato: {isPdf ? "Documento PDF" : "Imagen Optimizada WebP"}</span>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
