"use client";

import { useState, useMemo } from "react";
import { InventarioFormModal } from "./InventarioFormModal";
import { DeleteInventarioButton } from "./DeleteInventarioButton";
import {
  Search,
  X,
  RotateCcw,
  Hash,
  CircleDollarSign,
  AlertTriangle,
  FilterX,
  SlidersHorizontal,
} from "lucide-react";
import { TipoItem } from "@/types/database";

interface InventarioItem {
  id: string;
  sku?: string | null;
  nombre: string;
  tipo: TipoItem;
  precio_unitario: number;
  stock_actual?: number | null;
  stock_minimo?: number | null;
  created_at?: string;
}

interface Props {
  inventario: InventarioItem[];
}

const getBadgeStyles = (tipo: TipoItem) => {
  switch (tipo) {
    case "Fijo":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "Consumible":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "Servicio":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20";
  }
};

export function InventarioTable({ inventario }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [stockFiltro, setStockFiltro] = useState<string>("todos");

  const hasActiveFilters =
    searchTerm !== "" || tipoFiltro !== "todos" || stockFiltro !== "todos";

  const resetFilters = () => {
    setSearchTerm("");
    setTipoFiltro("todos");
    setStockFiltro("todos");
  };

  const filteredInventario = useMemo(() => {
    return inventario.filter((item) => {
      // 1. Filtro texto de búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const nombre = (item.nombre || "").toLowerCase();
        const sku = (item.sku || "").toLowerCase();

        const matches = nombre.includes(query) || sku.includes(query);
        if (!matches) return false;
      }

      // 2. Filtro Tipo
      if (tipoFiltro !== "todos" && item.tipo !== tipoFiltro) {
        return false;
      }

      // 3. Filtro Stock
      if (stockFiltro !== "todos") {
        const isService = item.tipo === "Servicio";
        const actual = item.stock_actual ?? 0;
        const minimo = item.stock_minimo ?? 0;
        const isCritical = !isService && actual <= minimo;

        if (stockFiltro === "critico" && !isCritical) {
          return false;
        }
        if (stockFiltro === "disponible" && (isService || actual <= minimo)) {
          return false;
        }
        if (stockFiltro === "servicio" && !isService) {
          return false;
        }
      }

      return true;
    });
  }, [inventario, searchTerm, tipoFiltro, stockFiltro]);

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda y Filtros */}
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm backdrop-blur-md space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre de ítem o código SKU..."
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
            {/* Tipo */}
            <select
              value={tipoFiltro}
              onChange={(e) => setTipoFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todos">Todos los Tipos</option>
              <option value="Fijo">Fijo (Equipos)</option>
              <option value="Consumible">Consumible (Insumos)</option>
              <option value="Servicio">Servicio (Mano de obra)</option>
            </select>

            {/* Estado de Stock */}
            <select
              value={stockFiltro}
              onChange={(e) => setStockFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todos">Todos los Stocks</option>
              <option value="critico">⚠️ Stock Crítico / Bajo</option>
              <option value="disponible">✓ Con Stock Disponible</option>
              <option value="servicio">Servicios (Sin stock físico)</option>
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
              {filteredInventario.length}
            </strong>{" "}
            de {inventario.length} ítems
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
              <SlidersHorizontal className="w-3 h-3" />
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {/* Tabla de Inventario */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm dark:shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Ítem</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Precio Unitario</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
              {filteredInventario.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center text-slate-400 dark:text-zinc-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FilterX className="w-8 h-8 text-slate-400 dark:text-zinc-600 stroke-1" />
                      <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                        {hasActiveFilters
                          ? "No se encontraron ítems con los filtros aplicados."
                          : "El inventario está vacío."}
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
                filteredInventario.map((item) => {
                  const isLowStock =
                    item.tipo !== "Servicio" &&
                    (item.stock_actual ?? 0) <= (item.stock_minimo ?? 0);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1.5">
                          <span className="font-medium text-slate-900 dark:text-zinc-100">
                            {item.nombre}
                          </span>
                          <div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${getBadgeStyles(
                                item.tipo
                              )}`}
                            >
                              {item.tipo}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-zinc-400">
                        <div className="flex items-center">
                          <Hash className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                          <span className="font-mono text-xs">
                            {item.sku || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-zinc-300 font-medium">
                        <div className="flex items-center">
                          <CircleDollarSign className="w-4 h-4 mr-1.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(item.precio_unitario)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.tipo === "Servicio" ? (
                          <span className="text-slate-400 dark:text-zinc-500 text-sm">N/A</span>
                        ) : (
                          <div className="flex items-center">
                            <span
                              className={`font-medium ${
                                isLowStock ? "text-amber-600 dark:text-amber-400 font-bold" : "text-slate-700 dark:text-zinc-300"
                              }`}
                            >
                              {item.stock_actual || 0}
                            </span>
                            {isLowStock && (
                              <span
                                title={`Stock bajo: mínimo ${item.stock_minimo || 0}`}
                                className="flex items-center"
                              >
                                <AlertTriangle className="w-4 h-4 ml-2 text-amber-600 dark:text-amber-400" />
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-1">
                          <InventarioFormModal
                            itemInicial={item as any}
                            isEdit={true}
                          />
                          <DeleteInventarioButton
                            id={item.id}
                            nombreItem={item.nombre}
                          />
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
