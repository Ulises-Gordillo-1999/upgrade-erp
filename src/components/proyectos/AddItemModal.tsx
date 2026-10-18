"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Loader2,
  PackagePlus,
  Boxes,
  Info,
} from "lucide-react";
import { addItemToProyecto } from "@/app/actions/proyectos";
import { Inventario } from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  proyectoId: string;
  inventarioDisponible: Inventario[];
}

export function AddItemModal({ proyectoId, inventarioDisponible }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setSelectedItemId("");
    setIsOpen(false);
  };

  const selectedItemData = inventarioDisponible.find(
    (i) => i.id === selectedItemId
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const inventario_id = formData.get("inventario_id") as string;
      const cantidad_estimada = parseFloat(
        formData.get("cantidad_estimada") as string
      );

      await addItemToProyecto({
        proyecto_id: proyectoId,
        inventario_id,
        cantidad_estimada,
      });

      closeModal();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al agregar el material o servicio.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl transition-all text-xs font-medium border border-slate-200 dark:border-zinc-700/80 shadow-sm"
      >
        <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
        Agregar Material / Servicio
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 animate-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Agregar Ítem al Presupuesto
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Selecciona un producto o servicio de tu catálogo activo.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <Boxes className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Buscar en Catálogo *
                </label>
                <select
                  name="inventario_id"
                  required
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                >
                  <option value="" disabled>
                    Selecciona un material o servicio...
                  </option>
                  {inventarioDisponible.map((item) => (
                    <option
                      key={item.id}
                      value={item.id}
                      disabled={
                        (item.stock_actual || 0) <= 0 && item.tipo !== "Servicio"
                      }
                    >
                      {item.nombre} — ${item.precio_unitario} [
                      {item.tipo}]
                      {item.tipo !== "Servicio"
                        ? ` (Stock: ${item.stock_actual})`
                        : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Cantidad Estimada *
                </label>
                <input
                  type="number"
                  inputMode="decimal"
                  name="cantidad_estimada"
                  required
                  min="0.1"
                  step="0.1"
                  defaultValue="1"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              {selectedItemData?.tipo === "Consumible" && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300/90 text-xs">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                  <span>
                    <strong>Ítem Consumible:</strong> La cantidad exacta se
                    definirá al cerrar la obra (ej: metros reales de cable UTP) y
                    el precio final se recalculará automáticamente.
                  </span>
                </div>
              )}

              {/* Botones */}
              <div className="pt-3 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedItemId}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40 transition-all"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Agregar al Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
