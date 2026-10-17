"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Loader2,
  DollarSign,
  Pencil,
  Tag,
  CreditCard,
  CheckCircle,
  Briefcase,
  FileText,
  Calendar,
  Layers,
} from "lucide-react";
import { createTransaccion, updateTransaccion } from "@/app/actions/finanzas";
import { getProyectos } from "@/app/actions/proyectos";
import {
  Transaccion,
  TipoTransaccion,
  CategoriaTransaccion,
  Moneda,
  MetodoPago,
  EstadoPago,
} from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  transaccionInicial?: Transaccion;
  isEdit?: boolean;
}

export function TransaccionFormModal({ transaccionInicial, isEdit = false }: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [monto, setMonto] = useState<string>(transaccionInicial?.monto?.toString() || "");
  const [proyectoId, setProyectoId] = useState<string>(transaccionInicial?.proyecto_id || "");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      getProyectos()
        .then((data) => setProyectos(data))
        .catch(console.error);
    }
  }, [isOpen]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const payload = {
        tipo: formData.get("tipo") as TipoTransaccion,
        categoria: formData.get("categoria") as CategoriaTransaccion,
        monto: parseFloat(monto),
        moneda: formData.get("moneda") as Moneda,
        metodo_pago: formData.get("metodo_pago") as MetodoPago,
        estado: formData.get("estado") as EstadoPago,
        descripcion: (formData.get("descripcion") as string) || undefined,
        proyecto_id: proyectoId || undefined,
        fecha_transaccion: (formData.get("fecha_transaccion") as string) || undefined,
      };

      if (isEdit && transaccionInicial) {
        await updateTransaccion(transaccionInicial.id, payload);
      } else {
        await createTransaccion(payload);
      }

      setIsOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Error al registrar transacción.");
    } finally {
      setLoading(false);
    }
  }

  const defaultFecha = transaccionInicial?.fecha_transaccion
    ? new Date(transaccionInicial.fecha_transaccion).toISOString().slice(0, 16)
    : new Date().toISOString().slice(0, 16);

  return (
    <>
      {!isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4" />
          Nueva Transacción
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-slate-400 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
          title="Editar movimiento"
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
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {isEdit ? "Editar Transacción" : "Registrar Transacción"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Control de ingresos, egresos y flujo de caja corporativo.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    Tipo de Movimiento *
                  </label>
                  <select
                    name="tipo"
                    defaultValue={transaccionInicial?.tipo || "Ingreso"}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Ingreso">Ingreso (+)</option>
                    <option value="Egreso">Egreso (-)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    Categoría *
                  </label>
                  <select
                    name="categoria"
                    defaultValue={transaccionInicial?.categoria || "Hardware"}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Hardware">Hardware / Materiales</option>
                    <option value="Cloud">Servicios Cloud</option>
                    <option value="Movilidad">Movilidad / Viáticos</option>
                    <option value="Honorarios">Honorarios</option>
                    <option value="Abono">Abono Mensual</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    Monto *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      name="monto"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      placeholder="0.00"
                      required
                      className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    Moneda *
                  </label>
                  <select
                    name="moneda"
                    defaultValue={transaccionInicial?.moneda || "ARS"}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="ARS">Pesos Argentinos (ARS)</option>
                    <option value="USDT">Crypto Tether (USDT)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    Método de Pago *
                  </label>
                  <select
                    name="metodo_pago"
                    defaultValue={transaccionInicial?.metodo_pago || "Transferencia"}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Transferencia">Transferencia Bancaria</option>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta Virtual/Crypto">Tarjeta Virtual / Crypto</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    Estado de Pago *
                  </label>
                  <select
                    name="estado"
                    defaultValue={transaccionInicial?.estado || "Pagado"}
                    required
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="Pagado">Pagado / Cobrado</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Vincular a Proyecto (Opcional)
                </label>
                <select
                  name="proyecto_id"
                  value={proyectoId}
                  onChange={(e) => {
                    setProyectoId(e.target.value);
                    const selected = proyectos.find((p) => p.id === e.target.value);
                    if (selected && selected.total_final !== undefined && selected.total_final !== null) {
                      setMonto(selected.total_final.toString());
                    }
                  }}
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="">Ninguno (Gasto / Ingreso general)</option>
                  {proyectos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.clientes?.nombre_razon_social || "Proyecto"} • {p.id.substring(0, 8)}... (Total: ${p.total_final})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Descripción o Concepto
                </label>
                <input
                  type="text"
                  name="descripcion"
                  defaultValue={transaccionInicial?.descripcion || ""}
                  placeholder="Ej: Pago parcial materiales obra rack o abono mensual"
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Fecha de Transacción
                </label>
                <input
                  type="datetime-local"
                  name="fecha_transaccion"
                  defaultValue={defaultFecha}
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/40 transition-all"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isEdit ? "Actualizar Movimiento" : "Guardar Movimiento"}
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
