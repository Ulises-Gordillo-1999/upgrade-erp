"use client";

import { useState, useMemo } from "react";
import { TransaccionFormModal } from "./TransaccionFormModal";
import { DeleteTransaccionButton } from "./DeleteTransaccionButton";
import { exportToExcelCsv } from "@/utils/exportCsv";
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
  FileSpreadsheet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  CalendarDays,
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

  // Filtros de fecha / período
  const [periodoFiltro, setPeriodoFiltro] = useState<string>("este_mes");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  const hasActiveFilters =
    searchTerm !== "" ||
    tipoFiltro !== "todos" ||
    categoriaFiltro !== "todas" ||
    estadoFiltro !== "todos" ||
    monedaFiltro !== "todas" ||
    periodoFiltro !== "todos" ||
    fechaDesde !== "" ||
    fechaHasta !== "";

  const resetFilters = () => {
    setSearchTerm("");
    setTipoFiltro("todos");
    setCategoriaFiltro("todas");
    setEstadoFiltro("todos");
    setMonedaFiltro("todas");
    setPeriodoFiltro("todos");
    setFechaDesde("");
    setFechaHasta("");
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

      // 6. Filtro Fecha / Período
      if (t.fecha_transaccion && periodoFiltro !== "todos") {
        const fechaTx = new Date(t.fecha_transaccion);
        const now = new Date();

        if (periodoFiltro === "este_mes") {
          const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
          const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
          if (fechaTx < start || fechaTx > end) return false;
        } else if (periodoFiltro === "mes_anterior") {
          const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0);
          const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
          if (fechaTx < start || fechaTx > end) return false;
        } else if (periodoFiltro === "ultimos_30") {
          const limit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (fechaTx < limit) return false;
        } else if (periodoFiltro === "ultimos_90") {
          const limit = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          if (fechaTx < limit) return false;
        } else if (periodoFiltro === "este_ano") {
          const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
          const end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
          if (fechaTx < start || fechaTx > end) return false;
        } else if (periodoFiltro === "personalizado") {
          if (fechaDesde) {
            const start = new Date(`${fechaDesde}T00:00:00`);
            if (fechaTx < start) return false;
          }
          if (fechaHasta) {
            const end = new Date(`${fechaHasta}T23:59:59`);
            if (fechaTx > end) return false;
          }
        }
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
    periodoFiltro,
    fechaDesde,
    fechaHasta,
  ]);

  // KPIs calculados reactivamente según los filtros activos
  const kpis = useMemo(() => {
    let ingresosARS = 0;
    let egresosARS = 0;
    let ingresosUSDT = 0;
    let egresosUSDT = 0;
    let pendientesARS = 0;
    let pendientesUSDT = 0;
    let cantIngresos = 0;
    let cantEgresos = 0;

    filteredTransacciones.forEach((t) => {
      const monto = Number(t.monto) || 0;
      if (t.moneda === "ARS") {
        if (t.tipo === "Ingreso") {
          ingresosARS += monto;
          cantIngresos++;
          if (t.estado === "Pendiente") pendientesARS += monto;
        } else {
          egresosARS += monto;
          cantEgresos++;
        }
      } else if (t.moneda === "USDT") {
        if (t.tipo === "Ingreso") {
          ingresosUSDT += monto;
          cantIngresos++;
          if (t.estado === "Pendiente") pendientesUSDT += monto;
        } else {
          egresosUSDT += monto;
          cantEgresos++;
        }
      }
    });

    return {
      ingresosARS,
      egresosARS,
      netoARS: ingresosARS - egresosARS,
      ingresosUSDT,
      egresosUSDT,
      netoUSDT: ingresosUSDT - egresosUSDT,
      pendientesARS,
      pendientesUSDT,
      cantIngresos,
      cantEgresos,
    };
  }, [filteredTransacciones]);

  const formatCurrency = (val: number, moneda: "ARS" | "USDT" = "ARS") => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda,
    }).format(val);
  };

  const handleExportCsv = () => {
    exportToExcelCsv({
      filename: `flujo_caja_${periodoFiltro}_${new Date().toISOString().slice(0, 10)}`,
      columns: [
        {
          header: "Fecha",
          accessor: (t) =>
            t.fecha_transaccion
              ? new Date(t.fecha_transaccion).toLocaleString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "",
        },
        { header: "Tipo", accessor: (t) => t.tipo },
        {
          header: "Concepto / Descripción",
          accessor: (t) => t.descripcion || `Movimiento de ${t.tipo}`,
        },
        { header: "Categoría", accessor: (t) => t.categoria },
        {
          header: "Cliente / Proyecto",
          accessor: (t) =>
            t.proyectos?.clientes?.nombre_razon_social || "Sin proyecto asociado",
        },
        { header: "Monto", accessor: (t) => t.monto },
        { header: "Moneda", accessor: (t) => t.moneda },
        { header: "Método de Pago", accessor: (t) => t.metodo_pago },
        { header: "Estado", accessor: (t) => t.estado },
      ],
      data: filteredTransacciones,
    });
  };

  return (
    <div className="space-y-4">
      {/* 1. Tarjetas de KPIs Dinámicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Total Ingresos</span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(kpis.ingresosARS, "ARS")}
          </div>
          {kpis.ingresosUSDT > 0 && (
            <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 font-mono">
              + {formatCurrency(kpis.ingresosUSDT, "USDT")}
            </div>
          )}
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            {kpis.cantIngresos} cobros registrados
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Total Egresos</span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white">
            {formatCurrency(kpis.egresosARS, "ARS")}
          </div>
          {kpis.egresosUSDT > 0 && (
            <div className="text-xs font-medium text-rose-600 dark:text-rose-400 font-mono">
              - {formatCurrency(kpis.egresosUSDT, "USDT")}
            </div>
          )}
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            {kpis.cantEgresos} egresos imputados
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Balance Neto</span>
            <span className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div
            className={`text-lg font-bold ${
              kpis.netoARS >= 0
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {kpis.netoARS >= 0 ? "+" : ""}
            {formatCurrency(kpis.netoARS, "ARS")}
          </div>
          {kpis.netoUSDT !== 0 && (
            <div
              className={`text-xs font-medium font-mono ${
                kpis.netoUSDT >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {kpis.netoUSDT >= 0 ? "+" : ""}
              {formatCurrency(kpis.netoUSDT, "USDT")}
            </div>
          )}
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Flujo de fondos del período
          </span>
        </div>

        <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400">
            <span className="font-medium">Pendiente de Cobro</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(kpis.pendientesARS, "ARS")}
          </div>
          {kpis.pendientesUSDT > 0 && (
            <div className="text-xs font-medium text-amber-500 font-mono">
              + {formatCurrency(kpis.pendientesUSDT, "USDT")}
            </div>
          )}
          <span className="text-[11px] text-slate-400 dark:text-zinc-500">
            Movimientos pendientes
          </span>
        </div>
      </div>

      {/* 2. Barra de Búsqueda, Períodos y Filtros */}
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
            {/* Filtro por Período */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1">
              <CalendarDays className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <select
                value={periodoFiltro}
                onChange={(e) => setPeriodoFiltro(e.target.value)}
                className="bg-transparent text-xs text-slate-700 dark:text-zinc-300 focus:outline-none cursor-pointer py-1"
              >
                <option value="este_mes">Este Mes</option>
                <option value="mes_anterior">Mes Anterior</option>
                <option value="ultimos_30">Últimos 30 días</option>
                <option value="ultimos_90">Últimos 90 días</option>
                <option value="este_ano">Este Año</option>
                <option value="todos">Todo el Histórico</option>
                <option value="personalizado">Personalizado...</option>
              </select>
            </div>

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

            {/* Botón Exportar a Excel */}
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all shadow-sm"
              title="Descargar movimientos filtrados a formato Excel (CSV con UTF-8 BOM)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span>Exportar Excel</span>
            </button>
          </div>
        </div>

        {/* Selector de Rango Personalizado (si se elige Personalizado) */}
        {periodoFiltro === "personalizado" && (
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-zinc-800/60 animate-in fade-in duration-200">
            <span className="text-xs font-medium text-slate-600 dark:text-zinc-300 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-500" />
              Rango de Fechas:
            </span>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400 dark:text-zinc-500">Desde:</label>
              <input
                type="date"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-400 dark:text-zinc-500">Hasta:</label>
              <input
                type="date"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
                className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-2.5 py-1 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            {(fechaDesde || fechaHasta) && (
              <button
                type="button"
                onClick={() => {
                  setFechaDesde("");
                  setFechaHasta("");
                }}
                className="text-[11px] text-rose-500 hover:underline"
              >
                Limpiar fechas
              </button>
            )}
          </div>
        )}

        {/* Resumen de Resultados / Filtros Activos */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
          <span>
            Mostrando{" "}
            <strong className="text-slate-800 dark:text-zinc-200">
              {filteredTransacciones.length}
            </strong>{" "}
            de {transacciones.length} transacciones registradas
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-semibold">
              <SlidersHorizontal className="w-3 h-3" />
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {/* 3. Vista Móvil: Tarjetas Financieras (< md) */}
      <div className="md:hidden space-y-3">
        {filteredTransacciones.length === 0 ? (
          <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center text-slate-400 dark:text-zinc-500">
            <FilterX className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600 stroke-1" />
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              {hasActiveFilters
                ? "No se encontraron movimientos con los filtros aplicados."
                : "No hay transacciones registradas."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          filteredTransacciones.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm space-y-3 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 font-medium">
                      {t.categoria}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${
                        t.estado === "Pagado"
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                      }`}
                    >
                      {t.estado}
                    </span>
                  </div>
                  <h4 className="font-semibold text-slate-900 dark:text-zinc-100 text-sm flex items-center gap-1">
                    {t.tipo === "Ingreso" ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <span className="truncate">
                      {t.descripcion || `Movimiento de ${t.tipo}`}
                    </span>
                  </h4>
                  {t.proyecto_id && (
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 flex items-center mt-0.5 font-medium">
                      <FolderGit2 className="w-3 h-3 mr-1 shrink-0" />
                      {t.proyectos?.clientes?.nombre_razon_social ||
                        "Proyecto Eliminado"}
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-sm font-bold font-mono ${
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
                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 flex items-center justify-end mt-0.5">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {t.metodo_pago}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800 text-[11px] text-slate-500 dark:text-zinc-400">
                <div className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 opacity-70" />
                  {new Date(t.fecha_transaccion!).toLocaleString("es-AR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>

                <div className="flex items-center gap-1">
                  <TransaccionFormModal transaccionInicial={t as any} isEdit={true} />
                  <DeleteTransaccionButton
                    id={t.id}
                    descripcion={t.descripcion || `Movimiento de ${t.tipo}`}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. Vista Desktop: Tabla Tradicional (>= md) */}
      <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-md shadow-sm overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/75 dark:bg-zinc-950/50 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                <th className="px-6 py-3.5">Concepto</th>
                <th className="px-6 py-3.5">Categoría</th>
                <th className="px-6 py-3.5">Fecha</th>
                <th className="px-6 py-3.5 text-right">Monto</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
              {filteredTransacciones.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500"
                  >
                    <FilterX className="w-9 h-9 mx-auto mb-2 text-slate-300 dark:text-zinc-600 stroke-1" />
                    <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                      {hasActiveFilters
                        ? "No se encontraron movimientos con los filtros aplicados."
                        : "No hay transacciones registradas."}
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium inline-block"
                      >
                        Limpiar todos los filtros
                      </button>
                    )}
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
