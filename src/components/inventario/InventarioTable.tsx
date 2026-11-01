"use client";

import { useState, useMemo } from "react";
import { InventarioFormModal } from "./InventarioFormModal";
import { DeleteInventarioButton } from "./DeleteInventarioButton";
import { ajustarStockInventario } from "@/app/actions/inventario";
import {
  Search,
  X,
  RotateCcw,
  AlertTriangle,
  FilterX,
  SlidersHorizontal,
  FolderTree,
  Cpu,
  Boxes,
  Wrench,
  Copy,
  Check,
  Plus,
  Minus,
  Loader2,
  PackageCheck,
  CheckCircle2,
  Layers,
  ArrowUpDown,
} from "lucide-react";
import { TipoItem, CategoriaInventario } from "@/types/database";

interface InventarioItem {
  id: string;
  sku?: string | null;
  nombre: string;
  tipo: TipoItem;
  categoria?: string | null;
  precio_unitario: number;
  stock_actual?: number | null;
  stock_minimo?: number | null;
  created_at?: string;
}

interface Props {
  inventario: InventarioItem[];
  categorias?: CategoriaInventario[];
}

const getBadgeStyles = (tipo: TipoItem) => {
  switch (tipo) {
    case "Fijo":
      return {
        badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25",
        avatar: "from-blue-600 to-cyan-600 text-white",
        icon: Cpu,
        label: "Equipo Fijo",
      };
    case "Consumible":
      return {
        badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25",
        avatar: "from-amber-600 to-orange-600 text-white",
        icon: Boxes,
        label: "Consumible",
      };
    case "Servicio":
      return {
        badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25",
        avatar: "from-purple-600 to-indigo-600 text-white",
        icon: Wrench,
        label: "Servicio / M.O.",
      };
    default:
      return {
        badge: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20",
        avatar: "from-zinc-600 to-slate-700 text-white",
        icon: Layers,
        label: tipo,
      };
  }
};

export function InventarioTable({ inventario, categorias = [] }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRapido, setFiltroRapido] = useState<string>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");
  const [copiedSkuId, setCopiedSkuId] = useState<string | null>(null);

  // Estado optimista para ajuste rápido de stock
  const [stockOverrides, setStockOverrides] = useState<Record<string, number>>({});
  const [updatingStockId, setUpdatingStockId] = useState<string | null>(null);

  // Lista de categorías únicas
  const categoriasDisponibles = useMemo(() => {
    const setCats = new Set<string>();
    categorias.forEach((c) => setCats.add(c.nombre));
    inventario.forEach((i) => {
      if (i.categoria) setCats.add(i.categoria);
    });
    return Array.from(setCats).sort();
  }, [categorias, inventario]);

  // Estadísticas para las métricas del header
  const stats = useMemo(() => {
    const total = inventario.length;
    const criticos = inventario.filter((i) => {
      if (i.tipo === "Servicio") return false;
      const actual = stockOverrides[i.id] ?? i.stock_actual ?? 0;
      const minimo = i.stock_minimo ?? 0;
      return actual <= minimo;
    }).length;
    const fisicos = inventario.filter(
      (i) => i.tipo === "Fijo" || i.tipo === "Consumible"
    ).length;
    const servicios = inventario.filter((i) => i.tipo === "Servicio").length;

    return { total, criticos, fisicos, servicios };
  }, [inventario, stockOverrides]);

  const hasActiveFilters =
    searchTerm !== "" || filtroRapido !== "todos" || categoriaFiltro !== "todos";

  const resetFilters = () => {
    setSearchTerm("");
    setFiltroRapido("todos");
    setCategoriaFiltro("todos");
  };

  const handleCopySku = async (sku: string, id: string) => {
    try {
      await navigator.clipboard.writeText(sku);
      setCopiedSkuId(id);
      setTimeout(() => setCopiedSkuId(null), 2000);
    } catch (err) {
      console.error("Error al copiar SKU:", err);
    }
  };

  const handleAjustarStock = async (id: string, delta: number, currentStock: number) => {
    if (updatingStockId) return;

    const targetStock = Math.max(0, currentStock + delta);
    setUpdatingStockId(id);

    // Optimista
    setStockOverrides((prev) => ({ ...prev, [id]: targetStock }));

    try {
      await ajustarStockInventario(id, delta);
    } catch (err) {
      console.error("Error al ajustar stock:", err);
      // Revertir
      setStockOverrides((prev) => ({ ...prev, [id]: currentStock }));
      alert("No se pudo actualizar el stock en el servidor.");
    } finally {
      setUpdatingStockId(null);
    }
  };

  const filteredInventario = useMemo(() => {
    return inventario.filter((item) => {
      const actualStock = stockOverrides[item.id] ?? item.stock_actual ?? 0;
      const minimoStock = item.stock_minimo ?? 0;
      const isCritical = item.tipo !== "Servicio" && actualStock <= minimoStock;

      // 1. Filtro texto de búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const nombre = (item.nombre || "").toLowerCase();
        const sku = (item.sku || "").toLowerCase();
        const categoria = (item.categoria || "").toLowerCase();

        const matches =
          nombre.includes(query) || sku.includes(query) || categoria.includes(query);
        if (!matches) return false;
      }

      // 2. Filtro rápido de pills
      if (filtroRapido === "critico") {
        if (!isCritical) return false;
      } else if (filtroRapido === "Fijo") {
        if (item.tipo !== "Fijo") return false;
      } else if (filtroRapido === "Consumible") {
        if (item.tipo !== "Consumible") return false;
      } else if (filtroRapido === "Servicio") {
        if (item.tipo !== "Servicio") return false;
      }

      // 3. Filtro Categoría
      if (categoriaFiltro !== "todos") {
        if (categoriaFiltro === "sin_categoria") {
          if (item.categoria && item.categoria.trim() !== "") return false;
        } else if (item.categoria !== categoriaFiltro) {
          return false;
        }
      }

      return true;
    });
  }, [inventario, searchTerm, filtroRapido, categoriaFiltro, stockOverrides]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. MÉTRICAS EJECUTIVAS / TELEMETRÍA DE STOCK (Mobile-First Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Total Catálogo
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <PackageCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.total}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              ítems activos
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Stock Crítico / Bajo
            </span>
            <div
              className={`p-2 rounded-xl ${
                stats.criticos > 0
                  ? "bg-amber-500/15 text-amber-500"
                  : "bg-emerald-500/10 text-emerald-500"
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight ${
                stats.criticos > 0
                  ? "text-amber-500"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {stats.criticos}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              {stats.criticos === 1 ? "ítem a reponer" : "ítems a reponer"}
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Equipos & Insumos
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.fisicos}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              físicos controlados
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Servicios & Abonos
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.servicios}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              mano de obra
            </span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE BÚSQUEDA Y FILTROS RÁPIDOS TÁCTILES */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm backdrop-blur-md space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre, SKU o categoría..."
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

          {/* Selector de Categoría */}
          <div className="w-full sm:w-auto">
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value)}
              className="w-full sm:w-auto min-h-[46px] bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer max-w-full sm:max-w-[220px] truncate [color-scheme:light] dark:[color-scheme:dark]"
            >
              <option value="todos">Todas las Categorías</option>
              {categoriasDisponibles.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="sin_categoria">Sin categoría</option>
            </select>
          </div>
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
            Todos ({inventario.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("critico")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "critico"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            {stats.criticos > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            )}
            ⚠️ Stock Crítico ({stats.criticos})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("Fijo")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "Fijo"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Equipos Fijos
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("Consumible")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "Consumible"
                ? "bg-orange-600 text-white shadow-sm shadow-orange-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            Consumibles
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("Servicio")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "Servicio"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Servicios
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
              {filteredInventario.length}
            </strong>{" "}
            de {inventario.length} ítems
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
              Filtro activo
            </span>
          )}
        </div>
      </div>

      {/* 3. VISTA MÓVIL: Tarjetas Táctiles Adaptativas (< md) */}
      <div className="md:hidden space-y-3">
        {filteredInventario.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center text-slate-400 dark:text-zinc-500">
            <FilterX className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              {hasActiveFilters
                ? "No se encontraron ítems con los filtros aplicados."
                : "El inventario está vacío."}
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
          filteredInventario.map((item) => {
            const badgeMeta = getBadgeStyles(item.tipo);
            const Icon = badgeMeta.icon;
            const isService = item.tipo === "Servicio";
            const currentStock = stockOverrides[item.id] ?? item.stock_actual ?? 0;
            const minStock = item.stock_minimo ?? 0;
            const isCritical = !isService && currentStock <= minStock;
            const isZero = !isService && currentStock === 0;
            const isUpdating = updatingStockId === item.id;
            const isSkuCopied = copiedSkuId === item.id;

            // Porcentaje para la barra de stock
            const maxCap = Math.max(1, minStock * 2);
            const stockPct = Math.min(100, Math.round((currentStock / maxCap) * 100));

            return (
              <div
                key={item.id}
                className={`rounded-2xl border bg-white dark:bg-zinc-900/70 p-4 shadow-sm space-y-3.5 transition-all ${
                  isZero
                    ? "border-rose-500/40 dark:border-rose-500/30"
                    : isCritical
                    ? "border-amber-500/40 dark:border-amber-500/30"
                    : "border-slate-200/90 dark:border-zinc-800/90"
                }`}
              >
                {/* Cabecera: Icono, Nombre, SKU y Acciones */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${badgeMeta.avatar} flex items-center justify-center shrink-0 shadow-sm`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate leading-snug">
                        {item.nombre}
                      </h4>

                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeMeta.badge}`}
                        >
                          {badgeMeta.label}
                        </span>

                        {item.categoria && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 truncate max-w-[150px]">
                            <FolderTree className="w-2.5 h-2.5 shrink-0" />
                            <span className="truncate">{item.categoria}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Acciones de Edición y Eliminación */}
                  <div className="flex items-center gap-1 shrink-0">
                    <InventarioFormModal
                      itemInicial={item as any}
                      isEdit={true}
                      categorias={categorias}
                    />
                    <DeleteInventarioButton
                      id={item.id}
                      nombreItem={item.nombre}
                    />
                  </div>
                </div>

                {/* Sub-tarjeta de SKU y Precio Unitario */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/60 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">
                      Precio Unitario
                    </span>
                    <span className="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(item.precio_unitario)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">
                      Código SKU
                    </span>
                    {item.sku ? (
                      <button
                        type="button"
                        onClick={() => handleCopySku(item.sku!, item.id)}
                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-mono text-[11px] font-semibold transition-all ${
                          isSkuCopied
                            ? "bg-emerald-500 text-white"
                            : "text-slate-700 dark:text-zinc-300 hover:text-cyan-500"
                        }`}
                        title="Copiar SKU"
                      >
                        <span>#{item.sku}</span>
                        {isSkuCopied ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-60" />
                        )}
                      </button>
                    ) : (
                      <span className="text-slate-400 dark:text-zinc-600 font-mono text-[11px]">
                        Sin SKU
                      </span>
                    )}
                  </div>
                </div>

                {/* Sección de Stock Físico con Barra y Stepper Rápido */}
                {isService ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 text-xs text-purple-600 dark:text-purple-300">
                    <span className="font-semibold flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5" />
                      Servicio sin inventario físico
                    </span>
                    <span className="text-[11px] opacity-80">Mano de obra</span>
                  </div>
                ) : (
                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                    {/* Indicador de Stock y Badge de Salud */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 dark:text-zinc-100 text-sm">
                          {currentStock} u.
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                          (mín: {minStock} u.)
                        </span>
                      </div>

                      {isZero ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          Agotado
                        </span>
                      ) : isCritical ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          Stock Crítico
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          Stock Disponible
                        </span>
                      )}
                    </div>

                    {/* Barra de Nivel de Stock */}
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isZero
                            ? "bg-rose-500"
                            : isCritical
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(5, stockPct)}%` }}
                      />
                    </div>

                    {/* Control Rápido de Stock (+ / -) con Touch Target de 44px */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                        Ajuste rápido en depósito:
                      </span>

                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-xl border border-slate-200 dark:border-zinc-700/60">
                        <button
                          type="button"
                          onClick={() => handleAjustarStock(item.id, -1, currentStock)}
                          disabled={isUpdating || currentStock <= 0}
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 disabled:opacity-40 transition-colors shadow-sm active:scale-95"
                          title="Restar 1 unidad"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <div className="px-2.5 min-w-[32px] text-center font-mono text-xs font-bold text-slate-800 dark:text-zinc-200">
                          {isUpdating ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-cyan-500" />
                          ) : (
                            currentStock
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAjustarStock(item.id, 1, currentStock)}
                          disabled={isUpdating}
                          className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-lg bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 disabled:opacity-40 transition-colors shadow-sm active:scale-95"
                          title="Sumar 1 unidad"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                <th className="px-6 py-4">Ítem / Artículo</th>
                <th className="px-6 py-4">Tipo & Categoría</th>
                <th className="px-6 py-4">Código SKU</th>
                <th className="px-6 py-4">Precio Unitario</th>
                <th className="px-6 py-4">Nivel de Stock</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredInventario.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-slate-400 dark:text-zinc-500"
                  >
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
                          className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-4 font-semibold"
                        >
                          Limpiar filtros de búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredInventario.map((item) => {
                  const badgeMeta = getBadgeStyles(item.tipo);
                  const Icon = badgeMeta.icon;
                  const isService = item.tipo === "Servicio";
                  const currentStock = stockOverrides[item.id] ?? item.stock_actual ?? 0;
                  const minStock = item.stock_minimo ?? 0;
                  const isCritical = !isService && currentStock <= minStock;
                  const isZero = !isService && currentStock === 0;
                  const isUpdating = updatingStockId === item.id;
                  const isSkuCopied = copiedSkuId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Ítem y Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-xl bg-gradient-to-br ${badgeMeta.avatar} flex items-center justify-center shrink-0 shadow-sm`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                              {item.nombre}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                              ID: {item.id.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Tipo y Categoría */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeMeta.badge}`}
                          >
                            {badgeMeta.label}
                          </span>
                          {item.categoria ? (
                            <span className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-zinc-400">
                              <FolderTree className="w-3 h-3 opacity-60 shrink-0" />
                              <span className="truncate max-w-[150px]">
                                {item.categoria}
                              </span>
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-zinc-600">
                              Sin categoría
                            </span>
                          )}
                        </div>
                      </td>

                      {/* SKU con copiado */}
                      <td className="px-6 py-4 font-mono text-xs">
                        {item.sku ? (
                          <button
                            type="button"
                            onClick={() => handleCopySku(item.sku!, item.id)}
                            className="inline-flex items-center gap-1 text-slate-700 dark:text-zinc-300 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                            title="Copiar SKU"
                          >
                            <span>#{item.sku}</span>
                            {isSkuCopied ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3 opacity-50 hover:opacity-100" />
                            )}
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-zinc-600">-</span>
                        )}
                      </td>

                      {/* Precio Unitario */}
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-zinc-100">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        }).format(item.precio_unitario)}
                      </td>

                      {/* Nivel de Stock y Stepper */}
                      <td className="px-6 py-4">
                        {isService ? (
                          <span className="text-xs text-slate-400 dark:text-zinc-500 italic">
                            Intangible (Servicio)
                          </span>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="space-y-1 min-w-[100px]">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-bold ${
                                    isZero
                                      ? "text-rose-600 dark:text-rose-400"
                                      : isCritical
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-slate-800 dark:text-zinc-200"
                                  }`}
                                >
                                  {currentStock} u.
                                </span>
                                {isCritical && (
                                  <AlertTriangle className="w-3 h-3 text-amber-500" />
                                )}
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-zinc-500 block">
                                Mínimo: {minStock} u.
                              </span>
                            </div>

                            {/* Mini stepper en tabla */}
                            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-200 dark:border-zinc-700/70">
                              <button
                                type="button"
                                onClick={() =>
                                  handleAjustarStock(item.id, -1, currentStock)
                                }
                                disabled={isUpdating || currentStock <= 0}
                                className="h-6 w-6 flex items-center justify-center rounded bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-rose-500 disabled:opacity-30 shadow-sm transition-colors"
                                title="Restar 1"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  handleAjustarStock(item.id, 1, currentStock)
                                }
                                disabled={isUpdating}
                                className="h-6 w-6 flex items-center justify-center rounded bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-emerald-500 disabled:opacity-30 shadow-sm transition-colors"
                                title="Sumar 1"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <InventarioFormModal
                            itemInicial={item as any}
                            isEdit={true}
                            categorias={categorias}
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
