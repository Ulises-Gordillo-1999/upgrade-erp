"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { CategoriaFinanzas } from "@/types/database";
import {
  createCategoriaFinanzas,
  updateCategoriaFinanzas,
  deleteCategoriaFinanzas,
} from "@/app/actions/finanzas";
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
  TrendingUp,
  TrendingDown,
  Layers,
  Sparkles,
} from "lucide-react";

interface Props {
  categorias: CategoriaFinanzas[];
  isOpen?: boolean;
  onClose?: () => void;
  triggerButton?: React.ReactNode;
}

export function GestionarCategoriasFinanzasModal({
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
  const [nuevoTipo, setNuevoTipo] = useState<"Ingreso" | "Egreso" | "Ambos">("Ambos");

  // Estado de edición en línea
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");
  const [editTipo, setEditTipo] = useState<"Ingreso" | "Egreso" | "Ambos">("Ambos");

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<"todos" | "Ingreso" | "Egreso" | "Ambos">("todos");
  const [error, setError] = useState<string | null>(null);

  const filteredCategorias = categorias.filter((c) => {
    const matchesSearch = c.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTipo =
      filtroTipo === "todos"
        ? true
        : filtroTipo === "Ingreso"
        ? c.tipo_asociado === "Ingreso" || c.tipo_asociado === "Ambos"
        : filtroTipo === "Egreso"
        ? c.tipo_asociado === "Egreso" || c.tipo_asociado === "Ambos"
        : c.tipo_asociado === "Ambos";
    return matchesSearch && matchesTipo;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        await createCategoriaFinanzas({
          nombre: nuevoNombre.trim(),
          tipo_asociado: nuevoTipo,
        });
        setNuevoNombre("");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Error al crear la categoría");
      }
    });
  };

  const startEdit = (cat: CategoriaFinanzas) => {
    setEditingId(cat.id);
    setEditNombre(cat.nombre);
    setEditTipo(cat.tipo_asociado);
    setError(null);
  };

  const handleUpdate = async (id: string) => {
    if (!editNombre.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        await updateCategoriaFinanzas(id, {
          nombre: editNombre.trim(),
          tipo_asociado: editTipo,
        });
        setEditingId(null);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Error al actualizar la categoría");
      }
    });
  };

  // Estado eliminación con confirmación moderna
  const [itemToDelete, setItemToDelete] = useState<CategoriaFinanzas | null>(null);

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setError(null);
    startTransition(async () => {
      try {
        await deleteCategoriaFinanzas(itemToDelete.id);
        if (editingId === itemToDelete.id) setEditingId(null);
        setItemToDelete(null);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Error al eliminar la categoría");
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
          <Tags className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          <span>Gestionar Categorías</span>
        </button>
      )}

      {isModalOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
            <div
              className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-5 py-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Tags className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Gestionar Categorías Financieras
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Crea, clasifica, renombra o elimina categorías para tus ingresos y egresos.
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
                  <Plus className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  Nueva Categoría
                </span>
                <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Publicidad & Marketing, Licencias..."
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <div className="flex gap-2">
                    <select
                      value={nuevoTipo}
                      onChange={(e) => setNuevoTipo(e.target.value as any)}
                      className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Ambos">Ambos (+/-)</option>
                      <option value="Ingreso">Solo Ingresos (+)</option>
                      <option value="Egreso">Solo Egresos (-)</option>
                    </select>
                    <button
                      type="submit"
                      disabled={isPending || !nuevoNombre.trim()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-950/20 flex items-center gap-1.5 shrink-0"
                    >
                      {isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                      <span>Agregar</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Filtro y Búsqueda */}
              <div className="px-5 py-3 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 shrink-0">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar categorías..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-950 p-1 rounded-lg border border-slate-200 dark:border-zinc-800 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setFiltroTipo("todos")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                      filtroTipo === "todos"
                        ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                        : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
                    }`}
                  >
                    Todos ({categorias.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroTipo("Ingreso")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                      filtroTipo === "Ingreso"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold"
                        : "text-slate-500 dark:text-zinc-400 hover:text-emerald-600"
                    }`}
                  >
                    Ingresos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroTipo("Egreso")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                      filtroTipo === "Egreso"
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold"
                        : "text-slate-500 dark:text-zinc-400 hover:text-rose-600"
                    }`}
                  >
                    Egresos
                  </button>
                  <button
                    type="button"
                    onClick={() => setFiltroTipo("Ambos")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all ${
                      filtroTipo === "Ambos"
                        ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-semibold"
                        : "text-slate-500 dark:text-zinc-400 hover:text-cyan-600"
                    }`}
                  >
                    Ambos
                  </button>
                </div>
              </div>

              {/* Lista scrolleable de categorías */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
                {filteredCategorias.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 dark:text-zinc-500 text-xs">
                    No se encontraron categorías que coincidan.
                  </div>
                ) : (
                  filteredCategorias.map((cat) => {
                    const isEditing = editingId === cat.id;

                    return (
                      <div
                        key={cat.id}
                        className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isEditing
                            ? "border-emerald-500/50 bg-emerald-50/20 dark:bg-emerald-950/10"
                            : "border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 hover:border-slate-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 mr-2">
                            <input
                              type="text"
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              autoFocus
                              className="flex-1 bg-white dark:bg-zinc-900 border border-emerald-500 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-zinc-100 focus:outline-none"
                            />
                            <select
                              value={editTipo}
                              onChange={(e) => setEditTipo(e.target.value as any)}
                              className="bg-white dark:bg-zinc-900 border border-slate-300 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
                            >
                              <option value="Ambos">Ambos (+/-)</option>
                              <option value="Ingreso">Solo Ingresos (+)</option>
                              <option value="Egreso">Solo Egresos (-)</option>
                            </select>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                              {cat.tipo_asociado === "Ingreso" ? (
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                              ) : cat.tipo_asociado === "Egreso" ? (
                                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                              ) : (
                                <Layers className="w-3.5 h-3.5 text-cyan-500" />
                              )}
                            </div>
                            <div>
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 block">
                                {cat.nombre}
                              </span>
                              <span
                                className={`text-[10px] inline-flex items-center gap-1 font-semibold px-1.5 py-0.5 rounded-md mt-0.5 ${
                                  cat.tipo_asociado === "Ingreso"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : cat.tipo_asociado === "Egreso"
                                    ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                                    : "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                                }`}
                              >
                                {cat.tipo_asociado === "Ingreso"
                                  ? "Ingreso (+)"
                                  : cat.tipo_asociado === "Egreso"
                                  ? "Egreso (-)"
                                  : "Ingreso / Egreso (Ambos)"}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Botones de acción */}
                        <div className="flex items-center gap-1 shrink-0 ml-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleUpdate(cat.id)}
                                disabled={isPending || !editNombre.trim()}
                                className="p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
                                title="Guardar cambios"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Cancelar edición"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(cat)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                                title="Editar categoría"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setItemToDelete(cat)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                title="Eliminar categoría"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="px-5 py-3 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50 text-xs text-slate-500 dark:text-zinc-400 shrink-0">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Total: {categorias.length} categorías registradas
                </span>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
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
                    ¿Eliminar categoría financiera?
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">
                    Estás a punto de eliminar la categoría{" "}
                    <span className="font-semibold text-slate-800 dark:text-zinc-200">
                      &quot;{itemToDelete.nombre}&quot;
                    </span>
                    .
                  </p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl mt-2 leading-relaxed">
                    ⚠️ Las transacciones registradas con esta categoría se reclasificarán automáticamente como <strong>&quot;Otros&quot;</strong> para preservar la integridad del balance contable sin pérdida de fondos.
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
