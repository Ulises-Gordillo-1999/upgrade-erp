"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Loader2,
  Pencil,
  Building2,
  Phone,
  ReceiptText,
  MapPin,
  FileCheck,
} from "lucide-react";
import { createCliente, updateCliente } from "@/app/actions/clientes";
import { CondicionIva, Cliente } from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  clienteInicial?: Cliente;
  isEdit?: boolean;
}

export function ClienteFormModal({ clienteInicial, isEdit = false }: Props) {
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
      const payload = {
        nombre_razon_social: formData.get("nombre") as string,
        telefono: (formData.get("telefono") as string) || undefined,
        cuit_cuil: (formData.get("cuit_cuil") as string) || undefined,
        condicion_iva: (formData.get("condicion_iva") as CondicionIva) || undefined,
        direccion: (formData.get("direccion") as string) || undefined,
      };

      if (isEdit && clienteInicial) {
        await updateCliente(clienteInicial.id, payload);
      } else {
        await createCliente(payload);
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al guardar el cliente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40"
        >
          <Plus className="w-4 h-4" />
          Nuevo Cliente
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-slate-400 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
          title="Editar cliente"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {isEdit ? "Editar Cliente" : "Registrar Nuevo Cliente"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Datos fiscales y de contacto para facturación y presupuestos.
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

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Nombre o Razón Social *
                </label>
                <input
                  type="text"
                  name="nombre"
                  defaultValue={clienteInicial?.nombre_razon_social}
                  required
                  placeholder="Ej: Empresa SRL o Juan Pérez"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    defaultValue={clienteInicial?.telefono || ""}
                    placeholder="+54 9 11 ..."
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <ReceiptText className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    CUIT / CUIL
                  </label>
                  <input
                    type="text"
                    name="cuit_cuil"
                    defaultValue={clienteInicial?.cuit_cuil || ""}
                    placeholder="20-12345678-9"
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Condición frente al IVA
                </label>
                <select
                  name="condicion_iva"
                  defaultValue={clienteInicial?.condicion_iva || ""}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                >
                  <option value="">Seleccionar condición...</option>
                  <option value="Responsable Inscripto">Responsable Inscripto</option>
                  <option value="Monotributo">Monotributo</option>
                  <option value="Consumidor Final">Consumidor Final</option>
                  <option value="Exento">Exento</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Dirección o Sede
                </label>
                <input
                  type="text"
                  name="direccion"
                  defaultValue={clienteInicial?.direccion || ""}
                  placeholder="Av. Corrientes 1234, CABA"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>

              {/* Botones de acción */}
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
                  {isEdit ? "Guardar Cambios" : "Guardar Cliente"}
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
