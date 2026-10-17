"use client";

import { useState, useMemo } from "react";
import { TransaccionFormModal } from "./TransaccionFormModal";
import { DeleteTransaccionButton } from "./DeleteTransaccionButton";
import {
  Search,
  X,
  RotateCcw,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  CreditCard,
  FolderGit2,
  FilterX,
  SlidersHorizontal,
} from "lucide-react";

interface TransaccionItem {
  id: string;
  tipo: "Ingreso" | "Egreso";
  categoria: string;
  monto: number;
  moneda: "ARS" | "USDT";
  metodo_pago: string;
  estado: "Pagado" | "Pendiente";
  descripcion?: string | null;
  fecha_transaccion?: string;
  created_at?: string;
  proyecto_id?: string | null;
  proyectos?: {
    clientes?: {
      nombre_razon_social?: string;
    } | null;
  } | null;
}

interface Props {
  transacciones: TransaccionItem[];
}

export function FinanzasTable({ transacciones }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todas");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("todos");
  const [monedaFiltro, setMonedaFiltro] = useState<string>("todas");

  const hasActiveFilters =
    searchTerm !== "" ||
    tipoFiltro !== "todos" ||
    categoriaFiltro !== "todas" ||
    estadoFiltro !== "todos" ||
    monedaFiltro !== "todas";

  const resetFilters = () => {
    setSearchTerm("");
    setTipoFiltro("todos");
    setCategoriaFiltro("todas");
    setEstadoFiltro("todos");
    setMonedaFiltro("todas");
  };

  const filteredTransacciones = useMemo(() => {
    return transacciones.filter((t) => {
      // 1. Filtro texto de búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const descripcion = (t.descripcion || "").toLowerCase();
        const cliente = (
          t.proyectos?.clientes?.nombre_razon_social || ""
        ).toLowerCase();
        const categoria = (t.categoria || "").toLowerCase();
        const montoStr = t.monto.toString();
        const metodo = (t.metodo_pago || "").toLowerCase();

        const matches =
          descripcion.includes(query) ||
          cliente.includes(query) ||
          categoria.includes(query) ||
          montoStr.includes(query) ||
          metodo.includes(query);

        if (!matches) return false;
      }

      // 2. Filtro Tipo
      if (tipoFiltro !== "todos" && t.tipo !== tipoFiltro) {
        return false;
      }

      // 3. Filtro Categoría
      if (categoriaFiltro !== "todas" && t.categoria !== categoriaFiltro) {
        return false;
      }

      // 4. Filtro Estado
      if (estadoFiltro !== "todos" && t.estado !== estadoFiltro) {
        return false;
      }

      // 5. Filtro Moneda
      if (monedaFiltro !== "todas" && t.moneda !== monedaFiltro) {
        return false;
      }

      return true;
    });
  }, [
    transacciones,
    searchTerm,
    tipoFiltro,
    categoriaFiltro,
    estadoFiltro,
    monedaFiltro,
  ]);

  return (
    <div className="space-y-4">
      {/* Barra de Búsqueda y Filtros */}
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-md shadow-sm space-y-3 transition-colors">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por concepto, cliente, categoría o monto..."
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
              <option value="Ingreso">Ingresos (+)</option>
              <option value="Egreso">Egresos (-)</option>
            </select>

            {/* Categoría */}
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todas">Todas las Categorías</option>
              <option value="Hardware">Hardware</option>
              <option value="Cloud">Cloud</option>
              <option value="Movilidad">Movilidad</option>
              <option value="Honorarios">Honorarios</option>
              <option value="Abono">Abono</option>
              <option value="Otros">Otros</option>
            </select>

            {/* Estado */}
            <select
              value={estadoFiltro}
              onChange={(e) => setEstadoFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              <option value="Pagado">Pagado</option>
              <option value="Pendiente">Pendiente</option>
            </select>

            {/* Moneda */}
            <select
              value={monedaFiltro}
              onChange={(e) => setMonedaFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todas">Monedas (ARS/USDT)</option>
              <option value="ARS">Solo ARS ($)</option>
              <option value="USDT">Solo USDT (₮)</option>
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
              {filteredTransacciones.length}
            </strong>{" "}
            de {transacciones.length} transacciones
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-semibold">
              <SlidersHorizontal className="w-3 h-3" />
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase bg-slate-50/90 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Concepto</th>
                <th className="px-6 py-4 font-semibold">Categoría</th>
                <th className="px-6 py-4 font-semibold">Fecha</th>
                <th className="px-6 py-4 font-semibold text-right">Monto</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800">
              {filteredTransacciones.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-slate-400 dark:text-zinc-500"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FilterX className="w-8 h-8 text-slate-300 dark:text-zinc-600 stroke-1" />
                      <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                        {hasActiveFilters
                          ? "No se encontraron movimientos con los filtros aplicados."
                          : "No hay transacciones registradas."}
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
                filteredTransacciones.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-zinc-100 flex items-center">
                          {t.tipo === "Ingreso" ? (
                            <ArrowUpRight className="w-4 h-4 mr-1 text-emerald-500 shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 mr-1 text-rose-500 shrink-0" />
                          )}
                          <span className="truncate max-w-sm">
                            {t.descripcion || `Movimiento de ${t.tipo}`}
                          </span>
                        </span>
                        {t.proyecto_id && (
                          <span className="text-xs text-cyan-600 dark:text-cyan-400 flex items-center mt-1 font-medium">
                            <FolderGit2 className="w-3 h-3 mr-1 shrink-0" />
                            {t.proyectos?.clientes?.nombre_razon_social ||
                              "Proyecto Eliminado"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700 font-medium">
                        {t.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-zinc-400 text-xs">
                      <div className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70 shrink-0" />
                        {new Date(t.fecha_transaccion!).toLocaleString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span
                          className={`font-bold font-mono ${
                            t.tipo === "Ingreso"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-rose-600 dark:text-rose-400"
                          }`}
                        >
                          {t.tipo === "Ingreso" ? "+" : "-"}
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: t.moneda,
                          }).format(t.monto)}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center mt-0.5">
                          <CreditCard className="w-3 h-3 mr-1" />
                          {t.metodo_pago}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                          t.estado === "Pagado"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                            : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                        }`}
                      >
                        {t.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end items-center gap-1">
                        <TransaccionFormModal
                          transaccionInicial={t as any}
                          isEdit={true}
                        />
                        <DeleteTransaccionButton
                          id={t.id}
                          descripcion={t.descripcion || `Movimiento de ${t.tipo}`}
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
