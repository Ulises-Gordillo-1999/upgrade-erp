"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Trash2, AlertTriangle, Loader2, X, ShoppingBag } from "lucide-react";
import { removeItemFromProyecto } from "@/app/actions/proyectos";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  proyecto_id: string;
  nombreItem?: string;
}

export function DeleteItemButton({ id, proyecto_id, nombreItem = "este ítem" }: Props) {
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
      await removeItemFromProyecto(id, proyecto_id);
      setIsOpen(false);
      router.refresh();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al quitar el ítem del presupuesto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-zinc-500 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-colors ml-2"
        title="Quitar ítem del presupuesto"
        type="button"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header del Modal */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                    ¿Quitar ítem del presupuesto?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate max-w-[280px]">
                    Ítem: <span className="text-slate-800 dark:text-zinc-200 font-semibold">{nombreItem}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mensaje descriptivo */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800/80 text-xs text-slate-700 dark:text-zinc-300 space-y-2 leading-relaxed">
              <p>
                Este material o servicio se desvinculará de la cotización y se recalculará el total estimado del proyecto.
              </p>
            </div>

            {/* Error si falla */}
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-950/20 dark:shadow-rose-950/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Quitando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Quitar Ítem</span>
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
