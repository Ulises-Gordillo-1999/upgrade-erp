"use client";

import { useState } from "react";
import { FinanzasTable } from "./FinanzasTable";
import { RentabilidadTable } from "./RentabilidadTable";
import { FinanzasGraficaEvolucion } from "./FinanzasGraficaEvolucion";
import { TransaccionFormModal } from "./TransaccionFormModal";
import { GestionarCategoriasFinanzasModal } from "./GestionarCategoriasFinanzasModal";
import { RentabilidadProyecto, CategoriaFinanzas } from "@/types/database";
import { DollarSign, Briefcase, Receipt, PieChart, BarChart3, Tags, Plus } from "lucide-react";

interface Props {
  transacciones: any[];
  rentabilidad: RentabilidadProyecto[];
  categorias?: CategoriaFinanzas[];
}

export function FinanzasDashboard({
  transacciones,
  rentabilidad,
  categorias = [],
}: Props) {
  const [activeTab, setActiveTab] = useState<"movimientos" | "evolucion" | "rentabilidad">("movimientos");

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Superior y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center transition-colors">
            <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 sm:mr-3 text-emerald-500 shrink-0" />
            Finanzas y Flujo de Caja
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Control de ingresos, egresos, rentabilidad por proyecto y balance multidivisa (ARS / USDT).
          </p>
        </div>

        {/* Botones de Acción Móviles Balanceados 50/50 con Touch Target >= 44px */}
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center w-full sm:w-auto">
          <GestionarCategoriasFinanzasModal
            categorias={categorias}
            triggerButton={
              <button
                type="button"
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/80 active:scale-[0.98] transition-all shadow-sm"
              >
                <Tags className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span className="truncate">Categorías</span>
              </button>
            }
          />
          <TransaccionFormModal
            categorias={categorias}
            triggerButton={
              <button
                type="button"
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white rounded-xl transition-all text-xs sm:text-sm font-semibold shadow-md shadow-emerald-950/20"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span className="truncate">Transacción</span>
              </button>
            }
          />
        </div>
      </div>

      {/* Pestañas de Navegación Deslizables en Móvil con Scroll Horizontal */}
      <div className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0 py-1">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm w-max sm:w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("movimientos")}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 active:scale-95 ${
              activeTab === "movimientos"
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/20"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            <Receipt className="w-4 h-4 shrink-0" />
            <span>Flujo de Movimientos</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === "movimientos"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400"
              }`}
            >
              {transacciones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("evolucion")}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 active:scale-95 ${
              activeTab === "evolucion"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/20"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            <BarChart3 className="w-4 h-4 shrink-0" />
            <span>Evolución Mensual</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("rentabilidad")}
            className={`min-h-[44px] flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all shrink-0 active:scale-95 ${
              activeTab === "rentabilidad"
                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/20"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
            }`}
          >
            <PieChart className="w-4 h-4 shrink-0" />
            <span>Rentabilidad por Proyecto</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === "rentabilidad"
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-400"
              }`}
            >
              {rentabilidad.length}
            </span>
          </button>
        </div>
      </div>

      {/* Contenido de la Pestaña Activa */}
      {activeTab === "movimientos" ? (
        <FinanzasTable transacciones={transacciones} categorias={categorias} />
      ) : activeTab === "evolucion" ? (
        <FinanzasGraficaEvolucion transacciones={transacciones} />
      ) : (
        <RentabilidadTable proyectos={rentabilidad} />
      )}
    </div>
  );
}
