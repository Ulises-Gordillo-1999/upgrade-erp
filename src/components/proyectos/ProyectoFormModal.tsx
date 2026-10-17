"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Loader2,
  FolderKanban,
  Building2,
  FileText,
  Clock,
} from "lucide-react";
import { createProyecto } from "@/app/actions/proyectos";
import { Cliente, EstadoProyecto } from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  clientes: Cliente[];
}

export function ProyectoFormModal({ clientes }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const cliente_id = formData.get("cliente_id") as string;
      const estado = formData.get("estado") as EstadoProyecto;
      const notas_tecnicas = formData.get("notas_tecnicas") as string;

      const newProyecto = await createProyecto({
        cliente_id,
        estado,
        notas_tecnicas,
      });

      setIsOpen(false);
      router.push(`/proyectos/${newProyecto.id}`);
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al crear el proyecto.");
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40"
      >
        <Plus className="w-4 h-4" />
        Nuevo Proyecto
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Crear Proyecto / Presupuesto
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Inicia un nuevo proyecto técnico o cotización de infraestructura.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
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
                  <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Cliente Destino *
                </label>
                <select
                  name="cliente_id"
                  required
                  defaultValue=""
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                >
                  <option value="" disabled>
                    Selecciona un cliente...
                  </option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre_razon_social} {c.cuit_cuil ? `(${c.cuit_cuil})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Estado Inicial *
                </label>
                <select
                  name="estado"
                  required
                  defaultValue="Borrador_Bot"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                >
                  <option value="Borrador_Bot">Borrador (Bot / Interno)</option>
                  <option value="Pendiente_Aprobacion_Cliente">
                    Pendiente Aprobación del Cliente
                  </option>
                  <option value="Aprobado">Aprobado directamente</option>
                </select>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500 pt-0.5">
                  En estado Borrador podrás cotizar materiales sin comprometer el stock de catálogo.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Notas Técnicas Iniciales
                </label>
                <textarea
                  name="notas_tecnicas"
                  rows={3}
                  placeholder="Requerimientos, detalles del sitio, topología, alcance del trabajo..."
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
                />
              </div>

              {/* Botones */}
              <div className="pt-3 flex justify-end gap-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
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
                  Crear Proyecto
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
