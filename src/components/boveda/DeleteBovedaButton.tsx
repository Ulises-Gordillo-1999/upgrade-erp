"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, Loader2, X, KeyRound } from "lucide-react";
import { deleteBovedaRecord } from "@/app/actions/boveda";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  descripcion?: string;
}

export function DeleteBovedaButton({ id, descripcion = "esta credencial" }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleOpen = () => {
    setErrorMsg(null);
    setIsOpen(true);
  };

  const handleClose = () => {
    if (loading) return;
    setIsOpen(false);
    setErrorMsg(null);
  };

  const handleDelete = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      await deleteBovedaRecord(id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al eliminar el secreto de la bóveda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors"
        title="Eliminar credencial de la bóveda"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    ¿Eliminar secreto de la bóveda?
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5 truncate max-w-[280px]">
                    Descripción: <span className="text-zinc-200 font-semibold">{descripcion}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded-lg hover:bg-zinc-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensaje descriptivo */}
            <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs text-zinc-300 space-y-2 leading-relaxed">
              <p>
                Esta acción eliminará de forma irreversible el dato cifrado o comprobante adjunto almacenado en la Bóveda Segura.
              </p>
              <div className="flex items-center gap-2 text-rose-400 font-medium pt-0.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>Esta acción no se puede deshacer.</span>
              </div>
            </div>

            {/* Mensaje de error si falla */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar Definitivamente</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
