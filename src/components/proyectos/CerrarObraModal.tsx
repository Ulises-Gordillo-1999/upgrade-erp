"use client";

import { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Loader2,
  Wrench,
  AlertTriangle,
  Boxes,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Receipt,
  Sparkles,
} from "lucide-react";
import { cerrarProyectoConLiquidacion } from "@/app/actions/proyectos";
import { ItemProyecto, MetodoPago, Moneda, EstadoPago } from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  proyectoId: string;
  clienteNombre: string;
  items: (ItemProyecto & { inventario?: any })[];
  isFinalizado: boolean;
  totalEstimado: number;
  totalFinal: number;
}

export function CerrarObraModal({
  proyectoId,
  clienteNombre,
  items,
  isFinalizado,
  totalEstimado,
  totalFinal,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estado para los valores editables de cantidad real de cada ítem
  const [cantidades, setCantidades] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    items.forEach((item) => {
      initial[item.id] =
        item.cantidad_real !== null && item.cantidad_real !== undefined
          ? item.cantidad_real
          : item.cantidad_estimada || 0;
    });
    return initial;
  });

  // Opciones de finanzas
  const [registrarFinanzas, setRegistrarFinanzas] = useState(true);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Transferencia");
  const [moneda, setMoneda] = useState<Moneda>("ARS");
  const [estadoPago, setEstadoPago] = useState<EstadoPago>("Pagado");

  const openModal = () => {
    // Sincronizar cantidades al abrir
    const updated: Record<string, number> = {};
    items.forEach((item) => {
      updated[item.id] =
        item.cantidad_real !== null && item.cantidad_real !== undefined
          ? item.cantidad_real
          : item.cantidad_estimada || 0;
    });
    setCantidades(updated);
    setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);

  const handleCantidadChange = (itemId: string, value: string) => {
    const val = parseFloat(value);
    setCantidades((prev) => ({
      ...prev,
      [itemId]: isNaN(val) || val < 0 ? 0 : val,
    }));
  };

  // Cálculo en vivo de totales y diferencias
  const { totalLiquidado, deltaTotal, hayConsumibles } = useMemo(() => {
    let sumReal = 0;
    let tieneConsumibles = false;

    items.forEach((item) => {
      const precio = item.precio_congelado || 0;
      const cantReal = cantidades[item.id] ?? (item.cantidad_estimada || 0);
      sumReal += precio * cantReal;

      if (item.inventario?.tipo === "Consumible") {
        tieneConsumibles = true;
      }
    });

    return {
      totalLiquidado: sumReal,
      deltaTotal: sumReal - totalEstimado,
      hayConsumibles: tieneConsumibles,
    };
  }, [items, cantidades, totalEstimado]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const itemsAjustados = items.map((item) => ({
        item_id: item.id,
        cantidad_real: cantidades[item.id] ?? (item.cantidad_estimada || 0),
      }));

      await cerrarProyectoConLiquidacion({
        proyecto_id: proyectoId,
        items_ajustados: itemsAjustados,
        registrar_transaccion: registrarFinanzas,
        transaccion_metodo_pago: metodoPago,
        transaccion_moneda: moneda,
        transaccion_estado: estadoPago,
      });

      closeModal();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al liquidar la obra.");
    } finally {
      setLoading(false);
    }
  }

  const formatMoneda = (val: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(val);

  return (
    <>
      {!isFinalizado ? (
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/40 text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <CheckCircle2 className="w-4 h-4" />
          Cierre de Obra / Liquidar
        </button>
      ) : (
        <button
          onClick={openModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-medium transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Obra Liquidada (Ver / Reajustar)
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 animate-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    Liquidación de Obra
                    <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      Problema del Cable
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Cliente: <strong className="text-slate-800 dark:text-zinc-200">{clienteNombre}</strong>.
                    Define las cantidades reales utilizadas para cerrar el costo y descontar stock.
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

            {/* Banner explicativo del Problema del Cable */}
            {hayConsumibles && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300/90 text-xs flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 dark:text-amber-200 mb-0.5 font-semibold">
                    Ajuste dinámico de Consumibles (Cables, Fichas, Insumos):
                  </strong>
                  Los metros de cable presupuestados fueron estimados. Introduce los metros o unidades reales consumidos a continuación. El stock físico se descontará con exactitud y el total final se recalculará automáticamente con el precio unitario congelado.
                </div>
              </div>
            )}

            {/* Tabla de ítems a liquidar */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-950/70 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 bg-slate-100/90 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Material / Servicio</th>
                        <th className="px-4 py-3 font-semibold text-center">Tipo</th>
                        <th className="px-4 py-3 font-semibold text-center">Cant. Estimada</th>
                        <th className="px-4 py-3 font-semibold text-center">
                          Cant. Real (Obra) *
                        </th>
                        <th className="px-4 py-3 font-semibold text-right">Precio Cong.</th>
                        <th className="px-4 py-3 font-semibold text-right">Subtotal Real</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/60 dark:divide-zinc-800/60">
                      {items.map((item) => {
                        const cantEstimada = item.cantidad_estimada || 0;
                        const cantReal = cantidades[item.id] ?? cantEstimada;
                        const delta = cantReal - cantEstimada;
                        const precio = item.precio_congelado || 0;
                        const subtotalReal = precio * cantReal;
                        const esConsumible = item.inventario?.tipo === "Consumible";
                        const esServicio = item.inventario?.tipo === "Servicio";

                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${
                              esConsumible
                                ? "bg-amber-500/[0.04] dark:bg-amber-500/[0.02] hover:bg-amber-500/[0.08] dark:hover:bg-amber-500/[0.05]"
                                : "hover:bg-slate-100/50 dark:hover:bg-zinc-900/50"
                            }`}
                          >
                            <td className="px-4 py-3">
                              <span className="font-medium text-slate-800 dark:text-zinc-200 block">
                                {item.inventario?.nombre || "Ítem"}
                              </span>
                              {item.inventario?.sku && (
                                <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                                  {item.inventario.sku}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                                  esConsumible
                                    ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                                    : esServicio
                                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20"
                                    : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                                }`}
                              >
                                {item.inventario?.tipo || "Fijo"}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center text-slate-500 dark:text-zinc-400 font-medium">
                              {cantEstimada}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.1"
                                  min="0"
                                  value={cantReal}
                                  onChange={(e) =>
                                    handleCantidadChange(item.id, e.target.value)
                                  }
                                  className={`w-24 text-center bg-white dark:bg-zinc-900 border rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none transition-all ${
                                    esConsumible
                                      ? "border-amber-500/40 text-amber-800 dark:text-amber-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                                      : "border-slate-300 dark:border-zinc-700 text-slate-900 dark:text-zinc-100 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                  }`}
                                />
                                {delta !== 0 && (
                                  <span
                                    className={`text-[10px] font-medium flex items-center gap-0.5 ${
                                      delta > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                    }`}
                                  >
                                    {delta > 0 ? "+" : ""}
                                    {delta.toFixed(1)} u/m
                                  </span>
                                )}
                              </div>
                            </td>

                            <td className="px-4 py-3 text-right text-slate-500 dark:text-zinc-400">
                              {formatMoneda(precio)}
                            </td>

                            <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-zinc-100">
                              {formatMoneda(subtotalReal)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Resumen Comparativo de Costos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800">
                <div className="space-y-1">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider block">
                    Presupuesto Inicial
                  </span>
                  <span className="text-base font-bold text-slate-700 dark:text-zinc-400">
                    {formatMoneda(totalEstimado)}
                  </span>
                </div>

                <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-slate-200 dark:border-zinc-800/80 py-2 sm:py-0 sm:px-4">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider block">
                    Liquidación Final
                  </span>
                  <span className="text-base font-extrabold text-cyan-600 dark:text-cyan-400">
                    {formatMoneda(totalLiquidado)}
                  </span>
                </div>

                <div className="space-y-1 sm:pl-2">
                  <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-500 uppercase tracking-wider block">
                    Variación
                  </span>
                  <div className="flex items-center gap-1.5">
                    {deltaTotal > 0 ? (
                      <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : deltaTotal < 0 ? (
                      <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    ) : (
                      <span className="text-xs text-slate-400 dark:text-zinc-500 font-semibold">=</span>
                    )}
                    <span
                      className={`text-sm font-bold ${
                        deltaTotal > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : deltaTotal < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-500 dark:text-zinc-400"
                      }`}
                    >
                      {deltaTotal > 0 ? "+" : ""}
                      {formatMoneda(deltaTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Integración con Finanzas y Cobranza */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 space-y-3">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={registrarFinanzas}
                    onChange={(e) => setRegistrarFinanzas(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-white dark:focus:ring-offset-zinc-950"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Registrar automáticamente movimiento de cobro en Finanzas
                  </span>
                </label>

                {registrarFinanzas && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 pl-6 animate-in fade-in duration-150">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400">
                        Método de Pago
                      </label>
                      <select
                        value={metodoPago}
                        onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Transferencia">Transferencia</option>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Tarjeta Virtual/Crypto">Crypto / USDT</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400">
                        Moneda
                      </label>
                      <select
                        value={moneda}
                        onChange={(e) => setMoneda(e.target.value as Moneda)}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ARS">Pesos (ARS)</option>
                        <option value="USDT">Crypto (USDT)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-semibold text-slate-500 dark:text-zinc-400">
                        Estado del Cobro
                      </label>
                      <select
                        value={estadoPago}
                        onChange={(e) => setEstadoPago(e.target.value as EstadoPago)}
                        className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-200 focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Pagado">Cobrado / Pagado</option>
                        <option value="Pendiente">Pendiente de Cobro</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
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
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/40 transition-all"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar Liquidación y Descontar Stock
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
