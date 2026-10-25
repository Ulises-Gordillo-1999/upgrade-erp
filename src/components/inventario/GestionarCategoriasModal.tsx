"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CategoriaInventario } from "@/types/database";
import {
  createCategoria,
  updateCategoria,
  deleteCategoria,
} from "@/app/actions/inventario";
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Loader2,
  AlertCircle,
  Package,
  Wrench,
  Sparkles,
} from "lucide-react";

interface Props {
  categorias: CategoriaInventario[];
  isOpen?: boolean;
  onClose?: () => void;
  triggerButton?: React.ReactNode;
}

export function GestionarCategoriasModal({
  categorias,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  triggerButton,
}: Props) {
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isModalOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const closeModal = () => {
    if (controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
    setEditingId(null);
    setSearchTerm("");
    setError(null);
  };

  const openModal = () => {
    setInternalIsOpen(true);
    setEditingId(null);
    setSearchTerm("");
    setError(null);
  };

  // Estados del formulario de nueva categoría
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<"Producto" | "Servicio" | "Ambos">("Producto");

  // Estado de edición en línea
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editTipo, setEditTipo] = useState<"Producto" | "Servicio" | "Ambos">("Producto");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "Producto" | "Servicio">("todos");
  const [error, setError] = useState<string | null>(null);

  const filteredCategorias = categorias.filter((c) => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo =
      filtroTipo === "todos"
        ? true
        : filtroTipo === "Producto"
        ? c.tipo_asociado === "Producto" || c.tipo_asociado === "Ambos"
        : c.tipo_asociado === "Servicio" || c.tipo_asociado === "Ambos";
    return matchesSearch && matchesTipo;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        await createCategoria({
          nombre: nuevoNombre.trim(),
          tipo_asociado: nuevoTipo,
        });
        setNuevoNombre("");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Error al crear categoría");
      }
    });
  };

  const startEdit = (c: CategoriaInventario) => {
    setEditingId(c.id);
    setEditNombre(c.nombre);
    setEditTipo(c.tipo_asociado);
    setError(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editNombre.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        await updateCategoria(id, {
          nombre: editNombre.trim(),
          tipo_asociado: editTipo,
        });
        setEditingId(null);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Error al actualizar categoría");
      }
    });
  };

  // Estado eliminación con confirmación moderna
  const [itemToDelete, setItemToDelete] = useState<CategoriaInventario | null>(null);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteCategoria(itemToDelete.id);
        if (editingId === itemToDelete.id) setEditingId(null);
        setItemToDelete(null);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Error al eliminar categoría");
        setItemToDelete(null);
      }
    });
  };

  return (
    <>
      {triggerButton ? (
        <div onClick={openModal} className="inline-block cursor-pointer">
          {triggerButton}
        </div>
      ) : (
        <button
          type="button"
          onClick={openModal}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700/80 transition-all shadow-sm"
        >
          <Tags className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>Gestionar Categorías</span>
        </button>
      )}

      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                    <Tags className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Gestionar Categorías del Catálogo
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Crea, renombra o elimina categorías para clasificar productos y servicios.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Formulario Nueva Categoría */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/40 shrink-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-2 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                  Crear Nueva Categoría
                </span>
                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Accesorios, Discos SSD, Cámaras..."
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                  <select
                    value={nuevoTipo}
                    onChange={(e) => setNuevoTipo(e.target.value as any)}
                    className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Producto">Para Productos</option>
                    <option value="Servicio">Para Servicios</option>
                    <option value="Ambos">Para Ambos</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isPending || !nuevoNombre.trim()}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Agregar</span>
                  </button>
                </form>
              </div>

              {/* Filtros de Lista */}
              <div className="px-5 pt-3 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Filtrar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800/80 p-0.5 rounded-lg text-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFiltroTipo("todos")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                      filtroTipo === "todos"
                        ? "bg-white dark:bg-zinc-700 text-slate-900 dark:text-white shadow-xs"
                        : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    Todas ({categorias.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroTipo("Producto")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                      filtroTipo === "Producto"
                        ? "bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-xs"
                        : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Package className="w-3 h-3" />
                    Productos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroTipo("Servicio")}
                    className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                      filtroTipo === "Servicio"
                        ? "bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-xs"
                        : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Wrench className="w-3 h-3" />
                    Servicios
                  </button>
                </div>
              </div>

              {/* Lista Scrollable de Categorías */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1">
                {filteredCategorias.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                    No se encontraron categorías que coincidan.
                  </div>
                ) : (
                  filteredCategorias.map((c) => {
                    const isEditing = editingId === c.id;

                    return (
                      <div
                        key={c.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isEditing
                            ? "bg-cyan-50/50 dark:bg-cyan-950/20 border-cyan-500/40"
                            : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs"
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <input
                              type="text"
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              className="flex-1 w-full bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                              placeholder="Nombre de la categoría..."
                              autoFocus
                            />
                            <select
                              value={editTipo}
                              onChange={(e) => setEditTipo(e.target.value as any)}
                              className="bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 shrink-0"
                            >
                              <option value="Producto">Para Productos</option>
                              <option value="Servicio">Para Servicios</option>
                              <option value="Ambos">Para Ambos</option>
                            </select>
                            <div className="flex items-center gap-1 self-end sm:self-auto shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(c.id)}
                                disabled={isPending || !editNombre.trim()}
                                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                                title="Guardar cambios"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="p-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 transition-colors"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`p-1.5 rounded-lg shrink-0 ${
                                  c.tipo_asociado === "Servicio"
                                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                    : c.tipo_asociado === "Ambos"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                    : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400"
                                }`}
                              >
                                {c.tipo_asociado === "Servicio" ? (
                                  <Wrench className="w-3.5 h-3.5" />
                                ) : c.tipo_asociado === "Ambos" ? (
                                  <Sparkles className="w-3.5 h-3.5" />
                                ) : (
                                  <Package className="w-3.5 h-3.5" />
                                )}
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">
                                {c.nombre}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                                  c.tipo_asociado === "Servicio"
                                    ? "bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20"
                                    : c.tipo_asociado === "Ambos"
                                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20"
                                }`}
                              >
                                {c.tipo_asociado}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEdit(c)}
                                disabled={isPending}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                title="Editar categoría"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setItemToDelete(c)}
                                disabled={isPending}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 shrink-0">
                <span>Total: {categorias.length} categorías registradas</span>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors text-slate-700 dark:text-zinc-200"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}

      {/* Modal de Confirmación Moderno */}
      {itemToDelete &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
            <div
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-150 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    ¿Eliminar categoría?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Estás a punto de eliminar la categoría{" "}
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      &quot;{itemToDelete.nombre}&quot;
                    </span>
                    .
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl mt-2 leading-relaxed">
                    ⚠️ Los ítems de inventario que pertenezcan a esta categoría quedarán como <strong>&quot;Sin categoría&quot;</strong>. No se perderá ningún ítem ni stock físico.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setItemToDelete(null)}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isPending}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-rose-950/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  <span>Eliminar definitivamente</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
