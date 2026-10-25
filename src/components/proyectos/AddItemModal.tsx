"use client";

import { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Minus,
  Loader2,
  PackagePlus,
  Boxes,
  Info,
  Search,
  CheckCircle2,
  FolderTree,
  Filter,
} from "lucide-react";
import { addItemToProyecto } from "@/app/actions/proyectos";
import { Inventario, TipoItem } from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  proyectoId: string;
  inventarioDisponible: Inventario[];
}

export function AddItemModal({ proyectoId, inventarioDisponible }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [cantidad, setCantidad] = useState<number | string>(1);

  // Estados de búsqueda y filtrado
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<string>("todos");
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>("todos");

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = () => {
    setSelectedItemId("");
    setCantidad(1);
    setSearchTerm("");
    setTipoFiltro("todos");
    setCategoriaFiltro("todos");
    setIsOpen(true);
  };

  const closeModal = () => {
    setSelectedItemId("");
    setIsOpen(false);
  };

  const selectedItemData = inventarioDisponible.find(
    (i) => i.id === selectedItemId
  );

  // Extraer categorías únicas disponibles en el inventario
  const categoriasDisponibles = useMemo(() => {
    const setCats = new Set<string>();
    inventarioDisponible.forEach((item) => {
      if (item.categoria && item.categoria.trim() !== "") {
        setCats.add(item.categoria.trim());
      }
    });
    return Array.from(setCats).sort();
  }, [inventarioDisponible]);

  // Filtrado reactivo en tiempo real
  const itemsFiltrados = useMemo(() => {
    return inventarioDisponible.filter((item) => {
      // 1. Filtro Tipo
      if (tipoFiltro !== "todos" && item.tipo !== tipoFiltro) {
        return false;
      }

      // 2. Filtro Categoría
      if (categoriaFiltro !== "todos") {
        if (categoriaFiltro === "sin_categoria") {
          if (item.categoria && item.categoria.trim() !== "") return false;
        } else if (item.categoria !== categoriaFiltro) {
          return false;
        }
      }

      // 3. Filtro Búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const nombre = (item.nombre || "").toLowerCase();
        const sku = (item.sku || "").toLowerCase();
        const cat = (item.categoria || "").toLowerCase();
        return (
          nombre.includes(query) || sku.includes(query) || cat.includes(query)
        );
      }

      return true;
    });
  }, [inventarioDisponible, tipoFiltro, categoriaFiltro, searchTerm]);

  // Manejo de incremento/decremento entero por teclado y botones
  const handleKeyDownCantidad = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setCantidad((prev) => Math.max(1, Math.floor(Number(prev || 0)) + 1));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const min = selectedItemData?.tipo === "Consumible" ? 0.1 : 1;
      setCantidad((prev) => Math.max(min, Math.ceil(Number(prev || 1)) - 1));
    }
  };

  const stepUpCantidad = () => {
    setCantidad((prev) => Math.max(1, Math.floor(Number(prev || 0)) + 1));
  };

  const stepDownCantidad = () => {
    const min = selectedItemData?.tipo === "Consumible" ? 0.1 : 1;
    setCantidad((prev) => Math.max(min, Math.ceil(Number(prev || 1)) - 1));
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedItemId) {
      alert("Por favor selecciona un material o servicio del catálogo.");
      return;
    }

    setLoading(true);

    try {
      const cantidadFinal = parseFloat(cantidad.toString()) || 1;

      await addItemToProyecto({
        proyecto_id: proyectoId,
        inventario_id: selectedItemId,
        cantidad_estimada: cantidadFinal,
      });

      closeModal();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al agregar el material o servicio.");
    } finally {
      setLoading(false);
    }
  }

  const subtotalEstimado = selectedItemData
    ? Number(selectedItemData.precio_unitario || 0) * (Number(cantidad) || 0)
    : 0;

  return (
    <>
      <button
        onClick={openModal}
        className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-zinc-200 rounded-xl transition-all text-xs font-medium border border-slate-200 dark:border-zinc-700/80 shadow-sm"
      >
        <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
        Agregar Material / Servicio
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[92dvh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200 dark:border-zinc-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <PackagePlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Agregar Ítem al Presupuesto
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Busca y filtra rápidamente en tu catálogo activo de productos y servicios.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* Barra de Filtros Rápidos por Tipo */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: "todos", label: "Todos" },
                    { id: "Fijo", label: "Fijos (Equipos)" },
                    { id: "Consumible", label: "Consumibles" },
                    { id: "Servicio", label: "Servicios" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setTipoFiltro(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                        tipoFiltro === tab.id
                          ? "bg-cyan-600 text-white shadow-xs font-semibold"
                          : "bg-slate-100 dark:bg-zinc-800/70 text-slate-600 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Buscador y Dropdown de Categoría */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-7 relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Buscar por nombre, SKU o categoría..."
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        onClick={() => setSearchTerm("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="sm:col-span-5">
                    <select
                      value={categoriaFiltro}
                      onChange={(e) => setCategoriaFiltro(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer truncate"
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
              </div>

              {/* Lista interactiva de Ítems Disponibles */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 px-0.5">
                  <span className="flex items-center gap-1 font-medium">
                    <Boxes className="w-3.5 h-3.5" />
                    Resultados del Catálogo ({itemsFiltrados.length})
                  </span>
                  {selectedItemData && (
                    <span className="text-cyan-600 dark:text-cyan-400 font-medium truncate max-w-[250px]">
                      Seleccionado: {selectedItemData.nombre}
                    </span>
                  )}
                </div>

                <div className="border border-slate-200 dark:border-zinc-800 rounded-xl max-h-56 sm:max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 p-1">
                  {itemsFiltrados.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
                      No se encontraron productos ni servicios con estos filtros.
                    </div>
                  ) : (
                    itemsFiltrados.map((item) => {
                      const isSelected = selectedItemId === item.id;
                      const isOutOfStock =
                        item.tipo !== "Servicio" && (item.stock_actual || 0) <= 0;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={isOutOfStock}
                          onClick={() => setSelectedItemId(item.id)}
                          className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between gap-3 text-xs ${
                            isSelected
                              ? "bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-500/50 shadow-xs"
                              : isOutOfStock
                              ? "opacity-40 cursor-not-allowed bg-slate-100/50 dark:bg-zinc-900/30"
                              : "hover:bg-white dark:hover:bg-zinc-800/60"
                          }`}
                        >
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-semibold text-slate-900 dark:text-zinc-100">
                                {item.nombre}
                              </span>
                              {item.sku && (
                                <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                                  #{item.sku}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                  item.tipo === "Fijo"
                                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                                    : item.tipo === "Consumible"
                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                    : "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20"
                                }`}
                              >
                                {item.tipo}
                              </span>

                              {item.categoria && (
                                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700/60">
                                  <FolderTree className="w-2.5 h-2.5 text-cyan-600 dark:text-cyan-400" />
                                  {item.categoria}
                                </span>
                              )}

                              {item.tipo !== "Servicio" && (
                                <span
                                  className={`text-[10px] ${
                                    (item.stock_actual || 0) <= 0
                                      ? "text-rose-600 font-semibold"
                                      : "text-slate-500 dark:text-zinc-400"
                                  }`}
                                >
                                  Stock: {item.stock_actual ?? 0} u.
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex items-center gap-2">
                            <div>
                              <div className="font-bold text-sm text-slate-900 dark:text-zinc-100 font-mono">
                                {new Intl.NumberFormat("es-AR", {
                                  style: "currency",
                                  currency: "ARS",
                                }).format(Number(item.precio_unitario))}
                              </div>
                              {isOutOfStock && (
                                <span className="text-[10px] text-rose-500 font-semibold">
                                  Agotado
                                </span>
                              )}
                            </div>

                            {isSelected && (
                              <CheckCircle2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Cantidad Estimada con Stepper Entero */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    Cantidad Estimada *
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500">
                    Usa las flechas del teclado (↑ / ↓) o los botones para cambiar de a 1 unidad
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={stepDownCantidad}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors"
                    title="Disminuir 1 unidad"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <input
                    type="number"
                    step={selectedItemData?.tipo === "Consumible" ? "any" : "1"}
                    inputMode="decimal"
                    name="cantidad_estimada"
                    required
                    min={selectedItemData?.tipo === "Consumible" ? "0.01" : "1"}
                    value={cantidad}
                    onChange={(e) => setCantidad(e.target.value)}
                    onKeyDown={handleKeyDownCantidad}
                    className="flex-1 text-center font-bold font-mono text-base bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl py-2 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />

                  <button
                    type="button"
                    onClick={stepUpCantidad}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors"
                    title="Aumentar 1 unidad"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subtotal Estimado & Aviso Consumible */}
              {selectedItemData && (
                <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-zinc-300 font-medium">
                      Subtotal Estimado ({cantidad} x{" "}
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(Number(selectedItemData.precio_unitario))}
                      ):
                    </span>
                    <span className="font-bold font-mono text-cyan-700 dark:text-cyan-300 text-sm">
                      {new Intl.NumberFormat("es-AR", {
                        style: "currency",
                        currency: "ARS",
                      }).format(subtotalEstimado)}
                    </span>
                  </div>

                  {selectedItemData.tipo === "Consumible" && (
                    <div className="flex items-start gap-2 pt-1 border-t border-cyan-500/20 text-amber-700 dark:text-amber-300/90 text-[11px]">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        <strong>Ítem Consumible:</strong> Los metros reales se ajustarán al liquidar la obra y el total se recalculará automáticamente.
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de Acción */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row sm:justify-end gap-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !selectedItemId}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40 transition-all"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Agregar al Proyecto
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

