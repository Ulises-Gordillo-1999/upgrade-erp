"use client";

import { useState } from "react";
import { FinanzasTable } from "./FinanzasTable";
import { RentabilidadTable } from "./RentabilidadTable";
import { FinanzasGraficaEvolucion } from "./FinanzasGraficaEvolucion";
import { TransaccionFormModal } from "./TransaccionFormModal";
import { GestionarCategoriasFinanzasModal } from "./GestionarCategoriasFinanzasModal";
import { RentabilidadProyecto, CategoriaFinanzas } from "@/types/database";
import { DollarSign, Briefcase, Receipt, PieChart, BarChart3 } from "lucide-react";

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Header Superior */}
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

        <div className="flex items-center gap-2">
          <GestionarCategoriasFinanzasModal categorias={categorias} />
          <TransaccionFormModal categorias={categorias} />
        </div>
      </div>

      {/* Pestañas de Navegación de Finanzas */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md shadow-sm w-fit flex-wrap">
        <button
          type="button"
          onClick={() => setActiveTab("movimientos")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "movimientos"
              ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/20"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <Receipt className="w-4 h-4" />
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
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "evolucion"
              ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-950/20"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Evolución Mensual</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rentabilidad")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === "rentabilidad"
              ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950/20"
              : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60"
          }`}
        >
          <PieChart className="w-4 h-4" />
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
