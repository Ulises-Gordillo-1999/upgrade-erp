"use client";

import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { TipoCredencialBoveda } from "@/types/database";
import {
  createTipoCredencial,
  updateTipoCredencial,
  deleteTipoCredencial,
} from "@/app/actions/boveda";
import {
  ShieldAlert,
  Key,
  Network,
  MonitorSmartphone,
  Router,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Search,
  Loader2,
  AlertCircle,
  Settings,
} from "lucide-react";

interface Props {
  tiposCredencial: TipoCredencialBoveda[];
  isOpen?: boolean;
  onClose?: () => void;
  triggerButton?: React.ReactNode;
}

const getTipoIcon = (nombre: string) => {
  const n = nombre.toLowerCase();
  if (n.includes("pass") || n.includes("clave") || n.includes("token") || n.includes("contraseña")) {
    return <Key className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
  }
  if (n.includes("ip") || n.includes("subred") || n.includes("red") || n.includes("vlan") || n.includes("vpn")) {
    return <Network className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
  }
  if (n.includes("anydesk") || n.includes("rustdesk") || n.includes("teamviewer") || n.includes("remoto") || n.includes("vnc")) {
    return <MonitorSmartphone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
  }
  if (n.includes("router") || n.includes("switch") || n.includes("mikrotik") || n.includes("firewall") || n.includes("ap")) {
    return <Router className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
  }
  return <ShieldAlert className="w-4 h-4 text-rose-500 dark:text-rose-400" />;
};

export function GestionarTiposCredencialModal({
  tiposCredencial,
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

  // Estado nuevo tipo
  const [nuevoNombre, setNuevoNombre] = useState("");

  // Estado edición en línea
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNombre, setEditNombre] = useState("");

  // Búsqueda y errores
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredTipos = tiposCredencial.filter((t) =>
    t.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        await createTipoCredencial({ nombre: nuevoNombre.trim() });
        setNuevoNombre("");
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Error al crear tipo de credencial");
      }
    });
  };

  const startEdit = (t: TipoCredencialBoveda) => {
    setEditingId(t.id);
    setEditNombre(t.nombre);
    setError(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editNombre.trim()) return;

    setError(null);
    startTransition(async () => {
      try {
        await updateTipoCredencial(id, { nombre: editNombre.trim() });
        setEditingId(null);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Error al actualizar tipo de credencial");
      }
    });
  };

  const handleDelete = async (t: TipoCredencialBoveda) => {
    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar el tipo de credencial "${t.nombre}"?\n\nLas credenciales existentes que tengan este tipo se reclasificarán automáticamente como "Otro dato sensible".`
    );
    if (!confirmDelete) return;

    setError(null);
    startTransition(async () => {
      try {
        await deleteTipoCredencial(t.id);
        if (editingId === t.id) setEditingId(null);
        router.refresh();
      } catch (err: any) {
        setError(err.message || "Error al eliminar tipo de credencial");
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
          <Settings className="w-4 h-4 text-rose-500 dark:text-rose-400" />
          <span>Gestionar Tipos</span>
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
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                      Gestionar Tipos de Credencial
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Crea, renombra o elimina categorías de credenciales de la bóveda.
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

              {/* Formulario Nuevo Tipo */}
              <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-950/40 shrink-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block mb-2 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400" />
                  Nuevo Tipo de Credencial
                </span>
                <form onSubmit={handleCreate} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej: Clave WiFi, API Key, Licencia Windows..."
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="flex-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-rose-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={isPending || !nuevoNombre.trim()}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs sm:text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0 shadow-sm"
                  >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    <span>Agregar</span>
                  </button>
                </form>
              </div>

              {/* Buscador */}
              <div className="px-5 pt-3 pb-2 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar tipo de credencial..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Lista Scrollable */}
              <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1">
                {filteredTipos.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-zinc-500 text-xs">
                    No se encontraron tipos de credencial.
                  </div>
                ) : (
                  filteredTipos.map((t) => {
                    const isEditing = editingId === t.id;

                    return (
                      <div
                        key={t.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isEditing
                            ? "bg-rose-50/50 dark:bg-rose-950/20 border-rose-500/40"
                            : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 shadow-xs"
                        }`}
                      >
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editNombre}
                              onChange={(e) => setEditNombre(e.target.value)}
                              className="flex-1 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500"
                              placeholder="Nombre del tipo..."
                              autoFocus
                            />
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(t.id)}
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
                              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 shrink-0">
                                {getTipoIcon(t.nombre)}
                              </div>
                              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-zinc-200 truncate">
                                {t.nombre}
                              </span>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => startEdit(t)}
                                disabled={isPending}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                title="Editar nombre"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(t)}
                                disabled={isPending}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                                title="Eliminar tipo"
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
                <span>Total: {tiposCredencial.length} tipos de credencial</span>
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
    </>
  );
}
