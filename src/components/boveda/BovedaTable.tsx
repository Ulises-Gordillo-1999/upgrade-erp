"use client";

import { useState, useMemo } from "react";
import { MaskedValue } from "./MaskedValue";
import { BovedaImageModal } from "./BovedaImageModal";
import {
  Search,
  X,
  RotateCcw,
  ShieldAlert,
  FolderGit2,
  Calendar,
  Key,
  Network,
  MonitorSmartphone,
  Router,
  FilterX,
  SlidersHorizontal,
} from "lucide-react";
import { TipoDatoBoveda } from "@/types/database";

interface BovedaItem {
  id: string;
  proyecto_id?: string | null;
  tipo_dato: TipoDatoBoveda;
  descripcion: string;
  valor_encriptado?: string | null;
  valor_desencriptado?: string | null;
  archivo_url?: string | null;
  created_at?: string;
  proyectos?: {
    clientes?: {
      nombre_razon_social?: string;
    } | null;
  } | null;
}

interface Props {
  bovedaItems: BovedaItem[];
}

const getTipoDatoIcon = (tipo: TipoDatoBoveda) => {
  switch (tipo) {
    case "Password":
      return <Key className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
    case "IP_Publica":
      return <Network className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
    case "AnyDesk_ID":
      return <MonitorSmartphone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
    case "Config_Router":
      return <Router className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
    default:
      return <ShieldAlert className="w-4 h-4 text-slate-400 dark:text-zinc-400" />;
  }
};

export function BovedaTable({ bovedaItems }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoDatoFiltro, setTipoDatoFiltro] = useState<string>("todos");
  const [adjuntoFiltro, setAdjuntoFiltro] = useState<string>("todos");

  const hasActiveFilters =
    searchTerm !== "" || tipoDatoFiltro !== "todos" || adjuntoFiltro !== "todos";

  const resetFilters = () => {
    setSearchTerm("");
    setTipoDatoFiltro("todos");
    setAdjuntoFiltro("todos");
  };

  const filteredItems = useMemo(() => {
    return bovedaItems.filter((item) => {
      // 1. Filtro texto de búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const cliente = (
          item.proyectos?.clientes?.nombre_razon_social || ""
        ).toLowerCase();
        const desc = (item.descripcion || "").toLowerCase();
        const id = (item.proyecto_id || "").toLowerCase();

        const matches =
          cliente.includes(query) || desc.includes(query) || id.includes(query);

        if (!matches) return false;
      }

      // 2. Filtro Tipo de Dato
      if (tipoDatoFiltro !== "todos" && item.tipo_dato !== tipoDatoFiltro) {
        return false;
      }

      // 3. Filtro Adjunto
      if (adjuntoFiltro !== "todos") {
        const hasAttachment = Boolean(item.archivo_url && item.archivo_url.trim() !== "");
        if (adjuntoFiltro === "con_adjunto" && !hasAttachment) {
          return false;
        }
        if (adjuntoFiltro === "sin_adjunto" && hasAttachment) {
          return false;
        }
      }

      return true;
    });
  }, [bovedaItems, searchTerm, tipoDatoFiltro, adjuntoFiltro]);

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
              placeholder="Buscar por cliente o descripción del registro..."
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
            {/* Tipo de Dato */}
            <select
              value={tipoDatoFiltro}
              onChange={(e) => setTipoDatoFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="Password">Contraseña / Password</option>
              <option value="IP_Publica">IP Pública</option>
              <option value="AnyDesk_ID">AnyDesk ID</option>
              <option value="Config_Router">Configuración Router</option>
              <option value="Otro">Otro</option>
            </select>

            {/* Adjunto */}
            <select
              value={adjuntoFiltro}
              onChange={(e) => setAdjuntoFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todos">Adjuntos (Todos)</option>
              <option value="con_adjunto">Con comprobante / imagen</option>
              <option value="sin_adjunto">Solo texto encriptado</option>
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
              {filteredItems.length}
            </strong>{" "}
            de {bovedaItems.length} registros
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
              <SlidersHorizontal className="w-3 h-3" />
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {/* 1. Vista Móvil: Tarjetas de Bóveda (< md) */}
      <div className="md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center text-slate-400 dark:text-zinc-500">
            <FilterX className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              {hasActiveFilters
                ? "No se encontraron registros con los filtros aplicados."
                : "No hay registros en la bóveda de seguridad."}
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
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm space-y-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 font-medium">
                      {getTipoDatoIcon(item.tipo_dato as TipoDatoBoveda)}
                      {item.tipo_dato.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                      {new Date(item.created_at!).toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                    {item.proyectos?.clientes?.nombre_razon_social || "Desconocido"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                    {item.descripcion}
                  </p>
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-medium block">
                  Credencial / Clave Resguardada
                </span>
                <MaskedValue value={item.valor_desencriptado || ""} />
                {item.archivo_url && (
                  <div className="pt-1">
                    <BovedaImageModal path={item.archivo_url} />
                  </div>
                )}
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
                <th className="px-6 py-4 font-medium">Tipo de Dato</th>
                <th className="px-6 py-4 font-medium">Descripción</th>
                <th className="px-6 py-4 font-medium">Valor Desencriptado</th>
                <th className="px-6 py-4 font-medium text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-slate-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FilterX className="w-8 h-8 text-slate-400 dark:text-zinc-600 stroke-1" />
                      <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                        {hasActiveFilters
                          ? "No se encontraron registros con los filtros aplicados."
                          : "No hay registros en la bóveda de seguridad."}
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
                filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FolderGit2 className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400 shrink-0" />
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-900 dark:text-zinc-100">
                            {item.proyectos?.clientes?.nombre_razon_social ||
                              "Desconocido"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-zinc-500 font-mono">
                            ID: {item.proyecto_id?.split("-")[0]}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-700 dark:text-zinc-300">
                        <div className="mr-2 p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-md">
                          {getTipoDatoIcon(item.tipo_dato as TipoDatoBoveda)}
                        </div>
                        <span className="text-xs font-medium">
                          {item.tipo_dato.replace(/_/g, " ")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-zinc-300 font-medium">
                      {item.descripcion}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <MaskedValue value={item.valor_desencriptado || ""} />
                        {item.archivo_url && (
                          <BovedaImageModal path={item.archivo_url} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-500 text-xs text-right">
                      <div className="flex items-center justify-end">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                        {new Date(item.created_at!).toLocaleDateString("es-AR")}
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
