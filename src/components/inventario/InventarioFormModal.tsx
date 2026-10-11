"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Loader2,
  Pencil,
  Package,
  Barcode,
  Layers,
  DollarSign,
  Boxes,
  ShieldAlert,
  Info,
} from "lucide-react";
import { createItemInventario, updateItemInventario } from "@/app/actions/inventario";
import { TipoItem, Inventario } from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  itemInicial?: Inventario;
  isEdit?: boolean;
}

export function InventarioFormModal({ itemInicial, isEdit = false }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipoItem, setTipoItem] = useState<string>(itemInicial?.tipo || "Fijo");

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = () => {
    setTipoItem(itemInicial?.tipo || "Fijo");
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const tipo = formData.get("tipo") as TipoItem;
      const payload = {
        nombre: formData.get("nombre") as string,
        sku: (formData.get("sku") as string) || undefined,
        tipo: tipo,
        precio_unitario: parseFloat(formData.get("precio_unitario") as string) || 0,
        stock_actual:
          tipo === "Servicio"
            ? 0
            : parseInt(formData.get("stock_actual") as string) || 0,
        stock_minimo:
          tipo === "Servicio"
            ? 0
            : parseInt(formData.get("stock_minimo") as string) || 0,
      };

      if (isEdit && itemInicial) {
        await updateItemInventario(itemInicial.id, payload);
      } else {
        await createItemInventario(payload);
      }

      closeModal();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar el ítem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isEdit ? (
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-cyan-950/40"
        >
          <Plus className="w-4 h-4" />
          Nuevo Ítem
        </button>
      ) : (
        <button
          onClick={openModal}
          className="p-1.5 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
          title="Editar ítem"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {isEdit ? "Editar Ítem del Catálogo" : "Registrar Nuevo Ítem"}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Administra equipos de red, consumibles o servicios técnicos.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-zinc-500" />
                  Nombre del Ítem o Servicio *
                </label>
                <input
                  type="text"
                  name="nombre"
                  defaultValue={itemInicial?.nombre}
                  required
                  placeholder="Ej: Router MikroTik hEX S / Cable UTP Cat6 / Instalación"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5 text-zinc-500" />
                    SKU / Código Interno
                  </label>
                  <input
                    type="text"
                    name="sku"
                    defaultValue={itemInicial?.sku || ""}
                    placeholder="Ej: RT-MIK-HEX"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-zinc-500" />
                    Tipo de Ítem *
                  </label>
                  <select
                    name="tipo"
                    value={tipoItem}
                    onChange={(e) => setTipoItem(e.target.value)}
                    required
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  >
                    <option value="Fijo">Fijo (Ej: Routers, Switches, Antenas)</option>
                    <option value="Consumible">Consumible (Ej: Cable UTP, Fichas RJ45)</option>
                    <option value="Servicio">Servicio (Ej: Mano de Obra, Mantenimiento)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-zinc-500" />
                  Precio Unitario ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="precio_unitario"
                    defaultValue={itemInicial?.precio_unitario}
                    required
                    placeholder="0.00"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              {tipoItem !== "Servicio" ? (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-zinc-500" />
                        Stock Actual
                      </label>
                      <input
                        type="number"
                        name="stock_actual"
                        defaultValue={itemInicial?.stock_actual ?? 0}
                        min="0"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
                        Stock Mínimo (Alerta)
                      </label>
                      <input
                        type="number"
                        name="stock_minimo"
                        defaultValue={itemInicial?.stock_minimo ?? 0}
                        min="0"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  {tipoItem === "Consumible" && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-xs">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Ítem Consumible:</strong> La cantidad exacta se ajusta
                        al finalizar la obra (ej. metros reales de cable UTP) sin trabar el
                        presupuesto inicial.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300/90 text-xs">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    Los <strong>Servicios</strong> no requieren control de inventario físico ni stock mínimo.
                  </span>
                </div>
              )}

              {/* Botones */}
              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-lg shadow-cyan-950/40 transition-all"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEdit ? "Guardar Cambios" : "Guardar Ítem"}
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
