"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Loader2,
  Pencil,
  Package,
  Barcode,
  Layers,
  DollarSign,
  Boxes,
  ShieldAlert,
  Info,
  FolderTree,
  Check,
} from "lucide-react";
import {
  createItemInventario,
  updateItemInventario,
  createCategoria,
} from "@/app/actions/inventario";
import { TipoItem, Inventario, CategoriaInventario } from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  itemInicial?: Inventario;
  isEdit?: boolean;
  categorias?: CategoriaInventario[];
}

export function InventarioFormModal({
  itemInicial,
  isEdit = false,
  categorias = [],
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tipoItem, setTipoItem] = useState<string>(itemInicial?.tipo || "Fijo");
  const [selectedCategoria, setSelectedCategoria] = useState<string>(
    itemInicial?.categoria || ""
  );
  const [categoriasList, setCategoriasList] = useState<CategoriaInventario[]>(categorias);

  // Estado para creación rápida de categoría inline
  const [showNewCatInput, setShowNewCatInput] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (categorias.length > 0) {
      setCategoriasList(categorias);
    }
  }, [categorias]);

  const openModal = () => {
    setTipoItem(itemInicial?.tipo || "Fijo");
    setSelectedCategoria(itemInicial?.categoria || "");
    setShowNewCatInput(false);
    setNewCatName("");
    setIsOpen(true);
  };
  const closeModal = () => setIsOpen(false);

  // Filtrar categorías según tipo de ítem
  const categoriasFiltradas = categoriasList.filter((cat) => {
    if (tipoItem === "Servicio") {
      return cat.tipo_asociado === "Servicio" || cat.tipo_asociado === "Ambos";
    }
    return cat.tipo_asociado === "Producto" || cat.tipo_asociado === "Ambos";
  });

  async function handleCreateNewCategory() {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    try {
      const tipoAsociado = tipoItem === "Servicio" ? "Servicio" : "Producto";
      const created = await createCategoria({
        nombre: newCatName.trim(),
        tipo_asociado: tipoAsociado,
      });
      setCategoriasList((prev) => [...prev, created]);
      setSelectedCategoria(created.nombre);
      setNewCatName("");
      setShowNewCatInput(false);
    } catch (err: any) {
      alert(err.message || "Error al crear la categoría");
    } finally {
      setCreatingCat(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const tipo = formData.get("tipo") as TipoItem;
      const categoriaVal = (formData.get("categoria") as string) || null;

      const payload = {
        nombre: formData.get("nombre") as string,
        sku: (formData.get("sku") as string) || undefined,
        tipo: tipo,
        categoria: categoriaVal && categoriaVal.trim() !== "" ? categoriaVal.trim() : null,
        precio_unitario:
          parseFloat(formData.get("precio_unitario") as string) || 0,
        stock_actual:
          tipo === "Servicio"
            ? 0
            : parseInt(formData.get("stock_actual") as string) || 0,
        stock_minimo:
          tipo === "Servicio"
            ? 0
            : parseInt(formData.get("stock_minimo") as string) || 0,
      };

      if (isEdit && itemInicial) {
        await updateItemInventario(itemInicial.id, payload);
      } else {
        await createItemInventario(payload);
      }

      closeModal();
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar el ítem.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isEdit ? (
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40"
        >
          <Plus className="w-4 h-4" />
          Nuevo Ítem
        </button>
      ) : (
        <button
          onClick={openModal}
          className="p-1.5 text-slate-400 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
          title="Editar ítem"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {isEdit ? "Editar Ítem del Catálogo" : "Registrar Nuevo Ítem"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Administra equipos de red, consumibles o servicios técnicos.
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Nombre del Ítem o Servicio *
                </label>
                <input
                  type="text"
                  name="nombre"
                  defaultValue={itemInicial?.nombre}
                  required
                  placeholder="Ej: Router MikroTik hEX S / Cable UTP Cat6 / Instalación"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <Barcode className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    SKU / Código Interno
                  </label>
                  <input
                    type="text"
                    name="sku"
                    defaultValue={itemInicial?.sku || ""}
                    placeholder="Ej: RT-MIK-HEX"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    Tipo de Ítem *
                  </label>
                  <select
                    name="tipo"
                    value={tipoItem}
                    onChange={(e) => setTipoItem(e.target.value)}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                  >
                    <option value="Fijo">Fijo (Equipamiento: Routers, Switches, DVR)</option>
                    <option value="Consumible">Consumible (Cables, Fichas, Insumos)</option>
                    <option value="Servicio">Servicio (Mano de Obra, Mantenimiento)</option>
                  </select>
                </div>
              </div>

              {/* Subcategoría / Categoría */}
              <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200 dark:border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    {tipoItem === "Servicio"
                      ? "Categoría de Servicio"
                      : "Subcategoría de Producto"}
                  </label>
                  {!showNewCatInput && (
                    <button
                      type="button"
                      onClick={() => setShowNewCatInput(true)}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-medium"
                    >
                      <Plus className="w-3 h-3" />
                      Nueva Categoría
                    </button>
                  )}
                </div>

                {showNewCatInput ? (
                  <div className="flex items-center gap-2 pt-1 animate-in fade-in duration-150">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      placeholder="Nombre de nueva categoría..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleCreateNewCategory();
                        }
                      }}
                      className="flex-1 bg-white dark:bg-zinc-900 border border-cyan-500/50 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNewCategory}
                      disabled={creatingCat || !newCatName.trim()}
                      className="px-2.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm transition-all"
                    >
                      {creatingCat ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCatInput(false);
                        setNewCatName("");
                      }}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <select
                    name="categoria"
                    value={selectedCategoria}
                    onChange={(e) => setSelectedCategoria(e.target.value)}
                    className="w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all cursor-pointer"
                  >
                    <option value="">
                      {tipoItem === "Servicio"
                        ? "-- Sin categoría (Servicio General) --"
                        : "-- Sin subcategoría (Producto General) --"}
                    </option>
                    {categoriasFiltradas.map((cat) => (
                      <option key={cat.id} value={cat.nombre}>
                        {cat.nombre}
                      </option>
                    ))}
                    {selectedCategoria &&
                      !categoriasFiltradas.some(
                        (c) => c.nombre === selectedCategoria
                      ) && (
                        <option value={selectedCategoria}>
                          {selectedCategoria}
                        </option>
                      )}
                  </select>
                )}
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  {tipoItem === "Servicio"
                    ? "Permite agrupar las prestaciones (ej. Mano de Obra, Mantenimientos) para cotizar más rápido."
                    : "Permite clasificar los materiales (ej. Accesorios, Conectividad, Cables, DVR, etc.)."}
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Precio Unitario ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500 text-sm font-semibold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="precio_unitario"
                    defaultValue={itemInicial?.precio_unitario}
                    required
                    placeholder="0.00"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              {tipoItem !== "Servicio" ? (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                        <Boxes className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        Stock Actual
                      </label>
                      <input
                        type="number"
                        name="stock_actual"
                        defaultValue={itemInicial?.stock_actual ?? 0}
                        min="0"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                        Stock Mínimo (Alerta)
                      </label>
                      <input
                        type="number"
                        name="stock_minimo"
                        defaultValue={itemInicial?.stock_minimo ?? 0}
                        min="0"
                        className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                      />
                    </div>
                  </div>

                  {tipoItem === "Consumible" && (
                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300/90 text-xs">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>
                        <strong>Ítem Consumible:</strong> La cantidad exacta se ajusta
                        al finalizar la obra (ej. metros reales de cable UTP) sin trabar el
                        presupuesto inicial.
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-300/90 text-xs">
                  <Info className="w-4 h-4 shrink-0" />
                  <span>
                    Los <strong>Servicios</strong> no requieren control de inventario físico ni stock mínimo.
                  </span>
                </div>
              )}

              {/* Botones */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40 transition-all"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEdit ? "Guardar Cambios" : "Guardar Ítem"}
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
