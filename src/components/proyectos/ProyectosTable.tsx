"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DeleteProyectoButton } from "./DeleteProyectoButton";
import {
  Search,
  X,
  RotateCcw,
  FolderGit2,
  Calendar,
  FileText,
  FilterX,
  SlidersHorizontal,
} from "lucide-react";
import { EstadoProyecto } from "@/types/database";

interface ProyectoItem {
  id: string;
  cliente_id: string;
  estado: EstadoProyecto;
  notas_tecnicas?: string | null;
  total_estimado?: number | null;
  total_final?: number | null;
  stock_descontado: boolean;
  created_at?: string;
  clientes?: {
    nombre_razon_social?: string;
  } | null;
}

interface Props {
  proyectos: ProyectoItem[];
  isSuperAdmin: boolean;
}

const getEstadoBadge = (estado: EstadoProyecto) => {
  switch (estado) {
    case "Borrador_Bot":
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
    case "Pendiente_Aprobacion_Cliente":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "Aprobado":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "En_Ejecucion":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "Finalizado":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "Cancelado":
      return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
  }
};

export function ProyectosTable({ proyectos, isSuperAdmin }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [liquidacionFiltro, setLiquidacionFiltro] = useState<string>("todos");

  const hasActiveFilters =
    searchTerm !== "" || estadoFiltro !== "todos" || liquidacionFiltro !== "todos";

  const resetFilters = () => {
    setSearchTerm("");
    setEstadoFiltro("todos");
    setLiquidacionFiltro("todos");
  };

  const filteredProyectos = useMemo(() => {
    return proyectos.filter((p) => {
      // 1. Filtro texto de búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const cliente = (p.clientes?.nombre_razon_social || "").toLowerCase();
        const notas = (p.notas_tecnicas || "").toLowerCase();
        const id = p.id.toLowerCase();

        const matches =
          cliente.includes(query) ||
          notas.includes(query) ||
          id.includes(query);

        if (!matches) return false;
      }

      // 2. Filtro Estado
      if (estadoFiltro !== "todos" && p.estado !== estadoFiltro) {
        return false;
      }

      // 3. Filtro Liquidación
      if (liquidacionFiltro !== "todos") {
        const isLiquidado = Boolean(p.stock_descontado || p.estado === "Finalizado");
        if (liquidacionFiltro === "liquidado" && !isLiquidado) {
          return false;
        }
        if (liquidacionFiltro === "pendiente_liquidacion" && isLiquidado) {
          return false;
        }
      }

      return true;
    });
  }, [proyectos, searchTerm, estadoFiltro, liquidacionFiltro]);

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda y Filtros */}
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm backdrop-blur-md space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente o notas técnicas..."
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

          {/* Menú de Filtros Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Estado */}
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Borrador_Bot">Borrador Bot</option>
              <option value="Pendiente_Aprobacion_Cliente">Pendiente Aprobación</option>
              <option value="Aprobado">Aprobado</option>
              <option value="En_Ejecucion">En Ejecución</option>
              <option value="Finalizado">Finalizado</option>
              <option value="Cancelado">Cancelado</option>
            </select>

            {/* Liquidación */}
            <select
              value={liquidacionFiltro}
              onChange={(e) => setLiquidacionFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todos">Liquidación (Todos)</option>
              <option value="liquidado">Liquidados (Cierre realizado)</option>
              <option value="pendiente_liquidacion">Pendientes de cierre</option>
            </select>

            {/* Botón Reset */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Resumen de Resultados / Filtros Activos */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200/60 dark:border-zinc-800/60">
          <span>
            Mostrando{" "}
            <strong className="text-slate-800 dark:text-zinc-200">
              {filteredProyectos.length}
            </strong>{" "}
            de {proyectos.length} proyectos
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
              <SlidersHorizontal className="w-3 h-3" />
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {/* 1. Vista Móvil: Tarjetas de Proyectos (< md) */}
      <div className="md:hidden space-y-3">
        {filteredProyectos.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center text-slate-400 dark:text-zinc-500">
            <FilterX className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              {hasActiveFilters
                ? "No se encontraron proyectos con los filtros aplicados."
                : "No hay proyectos registrados."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          filteredProyectos.map((proyecto) => (
            <div
              key={proyecto.id}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm space-y-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${getEstadoBadge(
                        proyecto.estado as EstadoProyecto
                      )}`}
                    >
                      {proyecto.estado?.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                      {new Date(proyecto.created_at!).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {proyecto.clientes?.nombre_razon_social || "Desconocido"}
                  </h4>
                  {proyecto.notas_tecnicas && (
                    <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                      {proyecto.notas_tecnicas}
                    </p>
                  )}
                </div>

                {isSuperAdmin && (
                  <div className="shrink-0">
                    <DeleteProyectoButton
                      id={proyecto.id}
                      nombreCliente={
                        proyecto.clientes?.nombre_razon_social || "Proyecto"
                      }
                      isLiquidado={Boolean(
                        proyecto.stock_descontado ||
                          proyecto.estado === "Finalizado"
                      )}
                      variant="icon"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-medium block">
                    Total
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-zinc-200">
                    {new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(proyecto.total_final && proyecto.total_final !== 0 ? proyecto.total_final : (proyecto.total_estimado || 0))}
                  </span>
                </div>

                <Link
                  href={`/proyectos/${proyecto.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 rounded-xl transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ver Detalle</span>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 2. Vista Desktop & Tablet: Tabla Completa (>= md) */}
      <div className="hidden md:block rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Proyecto / Cliente</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Presupuesto</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredProyectos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-slate-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FilterX className="w-8 h-8 text-slate-400 dark:text-zinc-600 stroke-1" />
                      <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                        {hasActiveFilters
                          ? "No se encontraron proyectos con los filtros aplicados."
                          : "No hay proyectos registrados."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-4"
                        >
                          Limpiar filtros de búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProyectos.map((proyecto) => (
                  <tr
                    key={proyecto.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mr-3 shrink-0">
                          <FolderGit2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-zinc-100">
                            {proyecto.clientes?.nombre_razon_social || "Desconocido"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-zinc-500 truncate max-w-[240px] mt-0.5">
                            {proyecto.notas_tecnicas || "Sin notas"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getEstadoBadge(
                          proyecto.estado as EstadoProyecto
                        )}`}
                      >
                        {proyecto.estado?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-800 dark:text-zinc-200">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(proyecto.total_estimado || 0)}
                        </span>
                        {proyecto.total_final !== proyecto.total_estimado &&
                          proyecto.total_final !== 0 && (
                            <span className="text-xs text-cyan-600 dark:text-cyan-500/80 font-medium">
                              Final:{" "}
                              {new Intl.NumberFormat("es-AR", {
                                style: "currency",
                                currency: "ARS",
                              }).format(proyecto.total_final!)}
                            </span>
                          )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">
                      <div className="flex items-center text-xs">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70 shrink-0" />
                        {new Date(proyecto.created_at!).toLocaleDateString("es-AR")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/proyectos/${proyecto.id}`}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-md transition-colors border border-slate-200 dark:border-zinc-700"
                        >
                          <FileText className="w-3 h-3 mr-1.5" />
                          Ver Detalle
                        </Link>
                        {isSuperAdmin && (
                          <DeleteProyectoButton
                            id={proyecto.id}
                            nombreCliente={
                              proyecto.clientes?.nombre_razon_social || "Proyecto"
                            }
                            isLiquidado={Boolean(
                              proyecto.stock_descontado ||
                                proyecto.estado === "Finalizado"
                            )}
                            variant="icon"
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
