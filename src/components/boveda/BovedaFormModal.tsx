"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Loader2,
  ShieldAlert,
  Upload,
  Pencil,
  KeyRound,
  FileText,
  Lock,
  Image as ImageIcon,
  Settings,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  createBovedaRecord,
  uploadBovedaFile,
  updateBovedaRecord,
  getTiposCredencial,
} from "@/app/actions/boveda";
import { TipoDatoBoveda, BovedaSeguridad, TipoCredencialBoveda } from "@/types/database";
import { GestionarTiposCredencialModal } from "./GestionarTiposCredencialModal";
import { useRouter } from "next/navigation";

interface Props {
  proyectoId?: string;
  credencialInicial?: BovedaSeguridad & { valor_desencriptado?: string | null };
  tiposCredencial?: TipoCredencialBoveda[];
  isEdit?: boolean;
}

export function BovedaFormModal({
  proyectoId,
  credencialInicial,
  tiposCredencial,
  isEdit = false,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [tiposList, setTiposList] = useState<TipoCredencialBoveda[]>(tiposCredencial || []);
  const [showSecret, setShowSecret] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (tiposCredencial && tiposCredencial.length > 0) {
      setTiposList(tiposCredencial);
    } else if (isOpen) {
      getTiposCredencial().then((list) => {
        if (list && list.length > 0) setTiposList(list);
      });
    }
  }, [isOpen, tiposCredencial]);

  const openModal = () => {
    setErrorMsg(null);
    setShowSecret(false);
    setIsOpen(true);
  };

  const closeModal = () => {
    setFileName("");
    setErrorMsg(null);
    setShowSecret(false);
    setIsOpen(false);
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);

    try {
      let archivo_url: string | undefined = undefined;
      const file = formData.get("archivo") as File;

      if (file && file.size > 0) {
        if (!proyectoId) throw new Error("Falta el ID del proyecto");
        archivo_url = await uploadBovedaFile(file, proyectoId);
      }

      const payload: any = {
        tipo_dato: formData.get("tipo_dato") as TipoDatoBoveda,
        descripcion: formData.get("descripcion") as string,
      };

      const valor_real = formData.get("valor_real") as string;
      if (valor_real) {
        payload.valor_real = valor_real;
      }
      if (archivo_url) {
        payload.archivo_url = archivo_url;
      }

      let res: any;
      if (isEdit && credencialInicial) {
        res = await updateBovedaRecord(credencialInicial.id, payload);
      } else {
        if (!proyectoId) throw new Error("Falta el ID del proyecto");
        payload.proyecto_id = proyectoId;
        res = await createBovedaRecord(payload);
      }

      if (res && res.success === false) {
        setErrorMsg(res.error || "Ocurrió un error al guardar la credencial.");
        return;
      }

      closeModal();
      router.refresh();
    } catch (error: any) {
      console.error("Error completo:", error);
      setErrorMsg(
        error.message || "Ocurrió un error inesperado al guardar la credencial."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {!isEdit ? (
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-rose-950/20 dark:shadow-rose-950/40"
        >
          <KeyRound className="w-4 h-4" />
          Nueva Credencial
        </button>
      ) : (
        <button
          onClick={openModal}
          className="p-1.5 text-slate-400 hover:text-rose-600 dark:text-zinc-400 dark:hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Editar Credencial"
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
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    {isEdit ? "Editar Credencial Segura" : "Guardar en Bóveda"}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-zinc-400">
                    Cifrado AES-256 en reposo para credenciales e infraestructura crítica.
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

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Error al guardar:</strong>
                  {errorMsg}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                    Tipo de Credencial / Configuración *
                  </label>
                  <GestionarTiposCredencialModal
                    tiposCredencial={tiposList}
                    triggerButton={
                      <span className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-medium cursor-pointer">
                        <Settings className="w-3 h-3 text-rose-500" />
                        Gestionar tipos
                      </span>
                    }
                  />
                </div>
                <select
                  name="tipo_dato"
                  defaultValue={
                    credencialInicial?.tipo_dato
                      ? {
                          Password: "Contraseña / Token",
                          IP_Publica: "IP Pública / Subred",
                          AnyDesk_ID: "ID AnyDesk / RustDesk / TeamViewer",
                          Config_Router: "Configuración de Router / Switch",
                          Otro: "Otro dato sensible",
                        }[credencialInicial.tipo_dato] || credencialInicial.tipo_dato
                      : ""
                  }
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    Seleccionar tipo...
                  </option>
                  {tiposList.map((t) => (
                    <option key={t.id} value={t.nombre}>
                      {t.nombre}
                    </option>
                  ))}
                  {credencialInicial?.tipo_dato &&
                    !tiposList.some(
                      (t) =>
                        t.nombre === credencialInicial.tipo_dato ||
                        t.nombre ===
                          ({
                            Password: "Contraseña / Token",
                            IP_Publica: "IP Pública / Subred",
                            AnyDesk_ID: "ID AnyDesk / RustDesk / TeamViewer",
                            Config_Router: "Configuración de Router / Switch",
                            Otro: "Otro dato sensible",
                          }[credencialInicial.tipo_dato] || "")
                    ) && (
                      <option value={credencialInicial.tipo_dato}>
                        {credencialInicial.tipo_dato}
                      </option>
                    )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Descripción o Identificador *
                </label>
                <input
                  type="text"
                  name="descripcion"
                  defaultValue={credencialInicial?.descripcion}
                  placeholder="Ej: admin / Acceso a MikroTik principal o Winbox"
                  required
                  className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Valor Secreto {isEdit ? "(Dejar en blanco para conservar)" : "*"}
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    name="valor_real"
                    required={!isEdit}
                    placeholder={isEdit ? "•••••••• (Sin cambios)" : "••••••••"}
                    className="w-full bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors p-1"
                    title={showSecret ? "Ocultar secreto" : "Mostrar secreto para verificar"}
                  >
                    {showSecret ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                  Foto / Captura Segura (Opcional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    name="archivo"
                    accept="image/*"
                    onChange={(e) =>
                      setFileName(e.target.files?.[0]?.name || "")
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex items-center justify-center w-full px-4 py-3 border border-slate-200 dark:border-zinc-800 border-dashed rounded-xl bg-slate-50 dark:bg-zinc-950 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors">
                    <Upload className="w-4 h-4 mr-2 text-slate-400 dark:text-zinc-500" />
                    <span className="text-xs text-slate-600 dark:text-zinc-400 truncate">
                      {fileName
                        ? fileName
                        : "Subir imagen (QR, etiqueta con serial, topología...)"}
                    </span>
                  </div>
                </div>
              </div>

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
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-lg shadow-rose-950/20 dark:shadow-rose-950/40 transition-all"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEdit ? "Actualizar Credencial" : "Cifrar y Guardar"}
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
