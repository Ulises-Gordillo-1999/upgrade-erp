"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { DeleteProyectoButton } from "./DeleteProyectoButton";
import { CompartirWhatsAppModal } from "./CompartirWhatsAppModal";
import {
  Search,
  X,
  RotateCcw,
  FolderGit2,
  Calendar,
  FileText,
  FilterX,
  Activity,
  Clock,
  CheckCircle2,
  Receipt,
  Check,
  TrendingUp,
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
      return {
        badge: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
        avatar: "from-zinc-600 to-slate-700 text-white",
        label: "Borrador (Bot)",
      };
    case "Pendiente_Aprobacion_Cliente":
      return {
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
        avatar: "from-amber-600 to-orange-600 text-white",
        label: "Pendiente Aprobación",
      };
    case "Aprobado":
      return {
        badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25",
        avatar: "from-emerald-600 to-teal-600 text-white",
        label: "Aprobado",
      };
    case "En_Ejecucion":
      return {
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
        avatar: "from-blue-600 to-cyan-600 text-white",
        label: "En Ejecución",
      };
    case "Finalizado":
      return {
        badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
        avatar: "from-purple-600 to-indigo-600 text-white",
        label: "Finalizado",
      };
    case "Cancelado":
      return {
        badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25",
        avatar: "from-rose-600 to-red-700 text-white",
        label: "Cancelado",
      };
    default:
      return {
        badge: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
        avatar: "from-zinc-600 to-slate-700 text-white",
        label: estado,
      };
  }
};

export function ProyectosTable({ proyectos, isSuperAdmin }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRapido, setFiltroRapido] = useState<string>("todos");

  // Telemetría para métricas ejecutivas
  const stats = useMemo(() => {
    const total = proyectos.length;
    const enEjecucion = proyectos.filter(
      (p) => p.estado === "En_Ejecucion"
    ).length;
    const pendientes = proyectos.filter(
      (p) =>
        p.estado === "Pendiente_Aprobacion_Cliente" ||
        p.estado === "Borrador_Bot"
    ).length;
    const liquidados = proyectos.filter(
      (p) => p.estado === "Finalizado" || p.stock_descontado
    ).length;
    const volumenTotal = proyectos.reduce((acc, p) => {
      const val =
        p.total_final && p.total_final > 0
          ? p.total_final
          : p.total_estimado || 0;
      return acc + val;
    }, 0);

    return { total, enEjecucion, pendientes, liquidados, volumenTotal };
  }, [proyectos]);

  const hasActiveFilters = searchTerm !== "" || filtroRapido !== "todos";

  const resetFilters = () => {
    setSearchTerm("");
    setFiltroRapido("todos");
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

      // 2. Filtro rápido de pills
      if (filtroRapido === "En_Ejecucion") {
        if (p.estado !== "En_Ejecucion") return false;
      } else if (filtroRapido === "pendientes") {
        if (
          p.estado !== "Pendiente_Aprobacion_Cliente" &&
          p.estado !== "Borrador_Bot"
        )
          return false;
      } else if (filtroRapido === "liquidados") {
        if (p.estado !== "Finalizado" && !p.stock_descontado) return false;
      } else if (filtroRapido === "Aprobado") {
        if (p.estado !== "Aprobado") return false;
      } else if (filtroRapido === "Borrador_Bot") {
        if (p.estado !== "Borrador_Bot") return false;
      }

      return true;
    });
  }, [proyectos, searchTerm, filtroRapido]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. MÉTRICAS EJECUTIVAS / TELEMETRÍA DE OBRAS (Mobile-First Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Total Proyectos
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.total}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              registrados
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              En Ejecución
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {stats.enEjecucion}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              obras en curso
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Pendientes
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {stats.pendientes}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              por aprobar
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Obras Liquidadas
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.liquidados}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              finalizadas
            </span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE BÚSQUEDA Y FILTROS RÁPIDOS TÁCTILES */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm backdrop-blur-md space-y-3 transition-colors">
        {/* Input de Búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, notas técnicas o ID..."
            className="w-full min-h-[46px] bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Píldoras / Tabs Deslizables Horizontales (Mobile Carousel) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          <button
            type="button"
            onClick={() => setFiltroRapido("todos")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "todos"
                ? "bg-cyan-600 text-white shadow-sm shadow-cyan-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Todos ({proyectos.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("En_Ejecucion")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "En_Ejecucion"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse shrink-0" />
            En Ejecución ({stats.enEjecucion})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("pendientes")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "pendientes"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Pendientes ({stats.pendientes})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("Aprobado")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              filtroRapido === "Aprobado"
                ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Aprobados
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("liquidados")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "liquidados"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Liquidados ({stats.liquidados})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("Borrador_Bot")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              filtroRapido === "Borrador_Bot"
                ? "bg-zinc-700 text-white shadow-sm"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Borrador Bot
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all shrink-0 flex items-center gap-1"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Resumen de Resultados */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
          <span>
            Mostrando{" "}
            <strong className="text-slate-900 dark:text-zinc-100 font-bold">
              {filteredProyectos.length}
            </strong>{" "}
            de {proyectos.length} proyectos
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
              Filtro activo
            </span>
          )}
        </div>
      </div>

      {/* 3. VISTA MÓVIL: Tarjetas Táctiles de Proyectos (< md) */}
      <div className="md:hidden space-y-3">
        {filteredProyectos.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center text-slate-400 dark:text-zinc-500">
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
                className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          filteredProyectos.map((proyecto) => {
            const isLiquidado = Boolean(
              proyecto.stock_descontado || proyecto.estado === "Finalizado"
            );
            const badgeMeta = getEstadoBadge(proyecto.estado as EstadoProyecto);
            const montoFinal =
              proyecto.total_final && proyecto.total_final > 0
                ? proyecto.total_final
                : proyecto.total_estimado || 0;

            return (
              <div
                key={proyecto.id}
                className={`rounded-2xl border bg-white dark:bg-zinc-900/70 p-4 shadow-sm space-y-3.5 transition-all ${
                  isLiquidado
                    ? "border-emerald-500/30 dark:border-emerald-500/20"
                    : proyecto.estado === "En_Ejecucion"
                    ? "border-blue-500/40 dark:border-blue-500/30"
                    : "border-slate-200/90 dark:border-zinc-800/90"
                }`}
              >
                {/* Cabecera: Avatar, Cliente, Estado y Acciones */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${badgeMeta.avatar} flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <FolderGit2 className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate leading-snug">
                        {proyecto.clientes?.nombre_razon_social ||
                          "Cliente Desconocido"}
                      </h4>

                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeMeta.badge}`}
                        >
                          {badgeMeta.label}
                        </span>

                        {isLiquidado && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                            <Check className="w-3 h-3" />
                            Liquidado
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                          {new Date(proyecto.created_at!).toLocaleDateString("es-AR")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de WhatsApp y Eliminar */}
                  <div className="flex items-center gap-1 shrink-0">
                    <CompartirWhatsAppModal
                      proyecto={proyecto}
                      variant="icon"
                    />
                    {isSuperAdmin && (
                      <DeleteProyectoButton
                        id={proyecto.id}
                        nombreCliente={
                          proyecto.clientes?.nombre_razon_social || "Proyecto"
                        }
                        isLiquidado={isLiquidado}
                        variant="icon"
                      />
                    )}
                  </div>
                </div>

                {/* Notas Técnicas si existen */}
                {proyecto.notas_tecnicas && (
                  <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed bg-slate-50 dark:bg-zinc-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-zinc-800/60">
                    {proyecto.notas_tecnicas}
                  </p>
                )}

                {/* Sub-tarjeta de importes y totales */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">
                      {isLiquidado
                        ? "Total Final Liquidado"
                        : "Presupuesto Estimado"}
                    </span>
                    <span className="font-mono text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(montoFinal)}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                    ID: {proyecto.id.slice(0, 8)}
                  </span>
                </div>

                {/* Botón de Acción Touch Target Completo (>= 44px) */}
                <Link
                  href={`/proyectos/${proyecto.id}`}
                  className="min-h-[44px] w-full flex items-center justify-center gap-2 text-xs font-bold rounded-xl border border-cyan-500/25 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 active:scale-[0.98] transition-all shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Gestionar Obra & Cierre en Terreno</span>
                </Link>
              </div>
            );
          })
        )}
      </div>

      {/* 4. VISTA DESKTOP & TABLET: Tabla Completa de Alta Densidad (>= md) */}
      <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase bg-slate-50/90 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="px-6 py-4">Proyecto / Cliente</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Presupuesto</th>
                <th className="px-6 py-4">Fecha</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredProyectos.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-14 text-center text-slate-400 dark:text-zinc-500"
                  >
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
                          className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-4 font-semibold"
                        >
                          Limpiar filtros de búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProyectos.map((proyecto) => {
                  const isLiquidado = Boolean(
                    proyecto.stock_descontado || proyecto.estado === "Finalizado"
                  );
                  const badgeMeta = getEstadoBadge(
                    proyecto.estado as EstadoProyecto
                  );
                  const montoFinal =
                    proyecto.total_final && proyecto.total_final > 0
                      ? proyecto.total_final
                      : proyecto.total_estimado || 0;

                  return (
                    <tr
                      key={proyecto.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div
                            className={`h-9 w-9 rounded-xl bg-gradient-to-br ${badgeMeta.avatar} flex items-center justify-center mr-3 shrink-0 shadow-sm`}
                          >
                            <FolderGit2 className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-zinc-100">
                              {proyecto.clientes?.nombre_razon_social ||
                                "Desconocido"}
                            </span>
                            <span className="text-xs text-slate-500 dark:text-zinc-500 truncate max-w-[240px] mt-0.5">
                              {proyecto.notas_tecnicas || "Sin notas"}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${badgeMeta.badge}`}
                          >
                            {badgeMeta.label}
                          </span>
                          {isLiquidado && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                              <Check className="w-2.5 h-2.5" />
                              Liquidado
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-zinc-100">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        }).format(montoFinal)}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500 dark:text-zinc-400">
                        {new Date(proyecto.created_at!).toLocaleDateString("es-AR")}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <CompartirWhatsAppModal
                            proyecto={proyecto}
                            variant="icon"
                          />
                          <Link
                            href={`/proyectos/${proyecto.id}`}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg transition-colors border border-slate-200 dark:border-zinc-700"
                          >
                            Gestionar
                          </Link>
                          {isSuperAdmin && (
                            <DeleteProyectoButton
                              id={proyecto.id}
                              nombreCliente={
                                proyecto.clientes?.nombre_razon_social ||
                                "este proyecto"
                              }
                              isLiquidado={isLiquidado}
                              variant="icon"
                            />
                          )}
                        </div>
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
