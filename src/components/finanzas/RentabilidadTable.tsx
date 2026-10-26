"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { RentabilidadProyecto } from "@/types/database";
import {
  Search,
  X,
  ExternalLink,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  AlertTriangle,
  FolderGit2,
  SlidersHorizontal,
  FileText,
} from "lucide-react";
import { exportarRentabilidadPDF } from "@/utils/finanzasPdfExport";

interface Props {
  proyectos: RentabilidadProyecto[];
}

export function RentabilidadTable({ proyectos }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [margenFiltro, setMargenFiltro] = useState<string>("todos");

  const filteredProyectos = useMemo(() => {
    return proyectos.filter((p) => {
      // 1. Búsqueda por cliente o estado
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const cliente = p.clienteNombre.toLowerCase();
        const estado = p.estado.toLowerCase();
        if (!cliente.includes(query) && !estado.includes(query)) {
          return false;
        }
      }

      // 2. Filtro por estado
      if (estadoFiltro !== "todos" && p.estado !== estadoFiltro) {
        return false;
      }

      // 3. Filtro por margen
      if (margenFiltro === "positivo" && p.netoARS <= 0 && p.netoUSDT <= 0) {
        return false;
      }
      if (margenFiltro === "negativo" && (p.netoARS >= 0 && p.netoUSDT >= 0)) {
        return false;
      }
      if (margenFiltro === "sin_movimientos" && p.totalMovimientos > 0) {
        return false;
      }

      return true;
    });
  }, [proyectos, searchTerm, estadoFiltro, margenFiltro]);

  // Totales consolidados de la lista filtrada
  const totales = useMemo(() => {
    let ingresosARS = 0;
    let egresosARS = 0;
    let ingresosUSDT = 0;
    let egresosUSDT = 0;

    filteredProyectos.forEach((p) => {
      ingresosARS += p.ingresosARS;
      egresosARS += p.egresosARS;
      ingresosUSDT += p.ingresosUSDT;
      egresosUSDT += p.egresosUSDT;
    });

    const netoARS = ingresosARS - egresosARS;
    const netoUSDT = ingresosUSDT - egresosUSDT;
    const margenGlobalARS = ingresosARS > 0 ? (netoARS / ingresosARS) * 100 : 0;

    return {
      ingresosARS,
      egresosARS,
      netoARS,
      ingresosUSDT,
      egresosUSDT,
      netoUSDT,
      margenGlobalARS: Number(margenGlobalARS.toFixed(1)),
    };
  }, [filteredProyectos]);

  const hasActiveFilters =
    searchTerm !== "" || estadoFiltro !== "todos" || margenFiltro !== "todos";

  const resetFilters = () => {
    setSearchTerm("");
    setEstadoFiltro("todos");
    setMargenFiltro("todos");
  };

  const handleExportPdf = () => {
    exportarRentabilidadPDF({
      proyectos: filteredProyectos,
      totales,
    });
  };

  const formatCurrency = (val: number, moneda: "ARS" | "USDT" = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda,
    }).format(val);
  };

  return (
    <div className="space-y-4">
      {/* KPIs de Rentabilidad Consolidada */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Total Facturado</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totales.ingresosARS, "ARS")}
          </div>
          {totales.ingresosUSDT > 0 && (
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
              + {formatCurrency(totales.ingresosUSDT, "USDT")}
            </div>
          )}
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            En {filteredProyectos.length} proyectos
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Costos Imputados</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(totales.egresosARS, "ARS")}
          </div>
          {totales.egresosUSDT > 0 && (
            <div className="text-xs font-medium text-rose-600 dark:text-rose-400 font-mono">
              - {formatCurrency(totales.egresosUSDT, "USDT")}
            </div>
          )}
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Gastos y compras vinculadas
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Ganancia Neta</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-lg font-bold ${
              totales.netoARS >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(totales.netoARS, "ARS")}
          </div>
          {totales.netoUSDT !== 0 && (
            <div
              className={`text-xs font-medium font-mono ${
                totales.netoUSDT >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {totales.netoUSDT >= 0 ? "+" : ""}
              {formatCurrency(totales.netoUSDT, "USDT")}
            </div>
          )}
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Margen neto consolidado
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Rentabilidad Promedio</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Briefcase className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-lg font-bold ${
              totales.margenGlobalARS >= 30
                ? "text-emerald-600 dark:text-emerald-400"
                : totales.margenGlobalARS > 0
                ? "text-cyan-600 dark:text-cyan-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {totales.margenGlobalARS}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full transition-all duration-500 ${
                totales.margenGlobalARS >= 30
                  ? "bg-emerald-500"
                  : totales.margenGlobalARS > 0
                  ? "bg-cyan-500"
                  : "bg-rose-500"
              }`}
              style={{
                width: `${Math.min(Math.max(totales.margenGlobalARS, 0), 100)}%`,
              }}
            />
          </div>
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Retorno sobre ingresos
          </span>
        </div>
      </div>

      {/* Barra de Filtros y Botón Exportar */}
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-md shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente o razón social..."
              className="w-full bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-0.5 rounded transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Menú de Filtros */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Estado del Proyecto */}
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-zinc-900 dark:[&>option]:text-zinc-100 [color-scheme:light] dark:[color-scheme:dark]"
            >
              <option value="todos">Todos los Estados</option>
              <option value="En_Ejecucion">En Ejecución</option>
              <option value="Finalizado">Finalizados</option>
              <option value="Aprobado">Aprobados</option>
              <option value="Pendiente_Aprobacion_Cliente">Pendientes Cliente</option>
              <option value="Borrador_Bot">Borradores Bot</option>
              <option value="Cancelado">Cancelados</option>
            </select>

            {/* Margen */}
            <select
              value={margenFiltro}
              onChange={(e) => setMargenFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer [&>option]:bg-white [&>option]:text-slate-900 dark:[&>option]:bg-zinc-900 dark:[&>option]:text-zinc-100 [color-scheme:light] dark:[color-scheme:dark]"
            >
              <option value="todos">Todos los Márgenes</option>
              <option value="positivo">Ganancia Neta (+)</option>
              <option value="negativo">Déficit / Sobrecosto (-)</option>
              <option value="sin_movimientos">Sin Movimientos</option>
            </select>

            {/* Reset */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-500 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                title="Limpiar filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}

            {/* Botón Exportar PDF Oficial */}
            <button
              type="button"
              onClick={handleExportPdf}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 rounded-xl transition-all shadow-sm shadow-cyan-950/20 active:scale-95 border border-cyan-400/20"
              title="Generar y descargar Reporte Oficial en PDF (Diseño Corporativo)"
            >
              <FileText className="w-4 h-4" />
              <span>Exportar PDF</span>
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
          <span>
            Mostrando{" "}
            <strong className="text-slate-800 dark:text-zinc-200">
              {filteredProyectos.length}
            </strong>{" "}
            de {proyectos.length} proyectos analizados
          </span>
          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-semibold">
              <SlidersHorizontal className="w-3 h-3" />
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {/* Tabla de Rentabilidad */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-md shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/75 dark:bg-zinc-950/50 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">Cliente / Proyecto</th>
                <th className="px-4 py-3.5">Estado</th>
                <th className="px-4 py-3.5 text-right">Presupuestado</th>
                <th className="px-4 py-3.5 text-right">Ingresos</th>
                <th className="px-4 py-3.5 text-right">Costos</th>
                <th className="px-4 py-3.5 text-right">Ganancia Neta</th>
                <th className="px-5 py-3.5">Margen</th>
                <th className="px-4 py-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
              {filteredProyectos.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500"
                  >
                    <FolderGit2 className="w-9 h-9 mx-auto mb-2 text-slate-300 dark:text-zinc-600 stroke-1" />
                    <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                      No se encontraron proyectos con los filtros aplicados.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredProyectos.map((p) => {
                  const hasProfitableARS = p.netoARS >= 0;
                  const hasIncome = p.ingresosARS > 0;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Cliente */}
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900 dark:text-zinc-100 text-sm">
                          {p.clienteNombre}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 mt-0.5 flex items-center gap-1.5">
                          <span>{p.totalMovimientos} movimientos registrados</span>
                          {p.stockDescontado && (
                            <span className="text-cyan-600 dark:text-cyan-400">
                              • Obra liquidada
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="px-4 py-4">
                        <span
                          className={`text-[11px] px-2.5 py-1 rounded-full font-medium inline-block ${
                            p.estado === "Finalizado"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : p.estado === "En_Ejecucion"
                              ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                              : p.estado === "Aprobado"
                              ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20"
                              : p.estado === "Cancelado"
                              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
                              : "bg-zinc-500/10 text-zinc-700 dark:text-zinc-400 border border-zinc-500/20"
                          }`}
                        >
                          {p.estado.replace(/_/g, " ")}
                        </span>
                      </td>

                      {/* Presupuestado */}
                      <td className="px-4 py-4 text-right font-mono font-medium text-slate-700 dark:text-zinc-300">
                        {formatCurrency(p.totalFinal || p.totalEstimado, "ARS")}
                      </td>

                      {/* Ingresos Recaudados */}
                      <td className="px-4 py-4 text-right">
                        <div className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(p.ingresosARS, "ARS")}
                        </div>
                        {p.ingresosUSDT > 0 && (
                          <div className="text-[10px] text-emerald-500 font-mono">
                            {formatCurrency(p.ingresosUSDT, "USDT")}
                          </div>
                        )}
                      </td>

                      {/* Costos Imputados */}
                      <td className="px-4 py-4 text-right">
                        <div className="font-mono font-semibold text-rose-600 dark:text-rose-400">
                          {formatCurrency(p.egresosARS, "ARS")}
                        </div>
                        {p.egresosUSDT > 0 && (
                          <div className="text-[10px] text-rose-500 font-mono">
                            {formatCurrency(p.egresosUSDT, "USDT")}
                          </div>
                        )}
                      </td>

                      {/* Ganancia Neta */}
                      <td className="px-4 py-4 text-right">
                        <div
                          className={`font-mono font-bold text-sm ${
                            hasProfitableARS
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {hasProfitableARS ? "+" : ""}
                          {formatCurrency(p.netoARS, "ARS")}
                        </div>
                        {p.netoUSDT !== 0 && (
                          <div
                            className={`text-[10px] font-mono ${
                              p.netoUSDT >= 0 ? "text-emerald-500" : "text-rose-500"
                            }`}
                          >
                            {p.netoUSDT >= 0 ? "+" : ""}
                            {formatCurrency(p.netoUSDT, "USDT")}
                          </div>
                        )}
                      </td>

                      {/* Margen de Rentabilidad */}
                      <td className="px-5 py-4 min-w-[140px]">
                        {hasIncome ? (
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] font-semibold">
                              <span
                                className={
                                  p.margenARS >= 30
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : p.margenARS > 0
                                    ? "text-cyan-600 dark:text-cyan-400"
                                    : "text-rose-600 dark:text-rose-400"
                                }
                              >
                                {p.margenARS}%
                              </span>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                                {p.margenARS >= 30
                                  ? "Excelente"
                                  : p.margenARS > 0
                                  ? "Normal"
                                  : "Sobrecosto"}
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all duration-300 ${
                                  p.margenARS >= 30
                                    ? "bg-emerald-500"
                                    : p.margenARS > 0
                                    ? "bg-cyan-500"
                                    : "bg-rose-500"
                                }`}
                                style={{
                                  width: `${Math.min(Math.max(p.margenARS, 0), 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : p.egresosARS > 0 ? (
                          <div className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Gastos sin cobro</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-500 text-[11px]">
                            Sin movimientos
                          </span>
                        )}
                      </td>

                      {/* Acción */}
                      <td className="px-4 py-4 text-center">
                        <Link
                          href={`/proyectos/${p.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:text-cyan-600 dark:hover:text-cyan-400 hover:border-cyan-500/40 text-[11px] font-medium transition-all shadow-sm"
                          title="Ver detalle de obra del proyecto"
                        >
                          <span>Obra</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
