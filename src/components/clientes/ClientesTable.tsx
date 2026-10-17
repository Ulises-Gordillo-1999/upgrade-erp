"use client";

import { useState, useMemo } from "react";
import { ClienteFormModal } from "./ClienteFormModal";
import { DeleteClienteButton } from "./DeleteClienteButton";
import {
  Search,
  X,
  RotateCcw,
  Building2,
  Phone,
  ReceiptText,
  MapPin,
  FilterX,
  SlidersHorizontal,
} from "lucide-react";

interface ClienteItem {
  id: string;
  nombre_razon_social: string;
  telefono?: string | null;
  cuit_cuil?: string | null;
  condicion_iva?: string | null;
  direccion?: string | null;
  created_at?: string;
}

interface Props {
  clientes: ClienteItem[];
}

export function ClientesTable({ clientes }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [condicionIvaFiltro, setCondicionIvaFiltro] = useState<string>("todas");

  const hasActiveFilters =
    searchTerm !== "" || condicionIvaFiltro !== "todas";

  const resetFilters = () => {
    setSearchTerm("");
    setCondicionIvaFiltro("todas");
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      // 1. Filtro texto de búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const nombre = (c.nombre_razon_social || "").toLowerCase();
        const cuit = (c.cuit_cuil || "").toLowerCase();
        const telefono = (c.telefono || "").toLowerCase();
        const direccion = (c.direccion || "").toLowerCase();

        const matches =
          nombre.includes(query) ||
          cuit.includes(query) ||
          telefono.includes(query) ||
          direccion.includes(query);

        if (!matches) return false;
      }

      // 2. Filtro Condición IVA
      if (condicionIvaFiltro !== "todas") {
        if (condicionIvaFiltro === "No definido") {
          if (c.condicion_iva && c.condicion_iva.trim() !== "") return false;
        } else if (c.condicion_iva !== condicionIvaFiltro) {
          return false;
        }
      }

      return true;
    });
  }, [clientes, searchTerm, condicionIvaFiltro]);

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda y Filtros */}
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-md shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, CUIT/CUIL, teléfono o dirección..."
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
            <select
              value={condicionIvaFiltro}
              onChange={(e) => setCondicionIvaFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todas">Todas las Condiciones IVA</option>
              <option value="Responsable Inscripto">Responsable Inscripto</option>
              <option value="Monotributo">Monotributo</option>
              <option value="Consumidor Final">Consumidor Final</option>
              <option value="Exento">Exento</option>
              <option value="No definido">Sin definir</option>
            </select>

            {/* Botón Reset */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-500 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Resumen de Resultados / Filtros Activos */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
          <span>
            Mostrando{" "}
            <strong className="text-slate-800 dark:text-zinc-200">
              {filteredClientes.length}
            </strong>{" "}
            de {clientes.length} clientes
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-semibold">
              <SlidersHorizontal className="w-3 h-3" />
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {/* Tabla de Clientes */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase bg-slate-50/90 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold">Fiscal</th>
                <th className="px-6 py-4 font-semibold">Dirección</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-slate-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FilterX className="w-8 h-8 text-slate-300 dark:text-zinc-600 stroke-1" />
                      <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                        {hasActiveFilters
                          ? "No se encontraron clientes con los filtros aplicados."
                          : "No hay clientes registrados."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-4 font-medium"
                        >
                          Limpiar filtros de búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-zinc-800 flex items-center justify-center mr-3 shrink-0">
                          <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-zinc-100">
                          {cliente.nombre_razon_social}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-2 opacity-70 shrink-0" />
                        {cliente.telefono || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                      <div className="flex flex-col space-y-1">
                        <span className="flex items-center text-xs">
                          <ReceiptText className="w-3.5 h-3.5 mr-1.5 opacity-70 shrink-0" />
                          {cliente.condicion_iva || "No definido"}
                        </span>
                        {cliente.cuit_cuil && (
                          <span className="text-xs opacity-80 ml-5 font-mono">
                            CUIT: {cliente.cuit_cuil}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                      <div className="flex items-start">
                        <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 opacity-70 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {cliente.direccion || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1">
                        <ClienteFormModal
                          clienteInicial={cliente as any}
                          isEdit={true}
                        />
                        <DeleteClienteButton
                          id={cliente.id}
                          nombreCliente={cliente.nombre_razon_social}
                        />
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
