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
} from "lucide-react";
import {
  createBovedaRecord,
  uploadBovedaFile,
  updateBovedaRecord,
} from "@/app/actions/boveda";
import { TipoDatoBoveda, BovedaSeguridad } from "@/types/database";
import { useRouter } from "next/navigation";

interface Props {
  proyectoId?: string;
  credencialInicial?: BovedaSeguridad & { valor_desencriptado?: string | null };
  isEdit?: boolean;
}

export function BovedaFormModal({
  proyectoId,
  credencialInicial,
  isEdit = false,
}: Props) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openModal = () => {
    setErrorMsg(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setFileName("");
    setErrorMsg(null);
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

      if (isEdit && credencialInicial) {
        await updateBovedaRecord(credencialInicial.id, payload);
      } else {
        if (!proyectoId) throw new Error("Falta el ID del proyecto");
        payload.proyecto_id = proyectoId;
        await createBovedaRecord(payload);
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
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white rounded-xl transition-all text-sm font-medium shadow-lg shadow-rose-950/40"
        >
          <KeyRound className="w-4 h-4" />
          Nueva Credencial
        </button>
      ) : (
        <button
          onClick={openModal}
          className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
          title="Editar Credencial"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-900/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    {isEdit ? "Editar Credencial Segura" : "Guardar en Bóveda"}
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Cifrado AES-256 en reposo para credenciales e infraestructura crítica.
                  </p>
                </div>
              </div>

              <button
                onClick={closeModal}
                className="text-zinc-500 hover:text-zinc-300 p-1.5 rounded-lg hover:bg-zinc-800/60 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
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
                <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-zinc-500" />
                  Tipo de Credencial / Configuración *
                </label>
                <select
                  name="tipo_dato"
                  defaultValue={credencialInicial?.tipo_dato || ""}
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                >
                  <option value="" disabled>
                    Seleccionar tipo...
                  </option>
                  <option value="Password">Contraseña / Token</option>
                  <option value="IP_Publica">IP Pública / Subred</option>
                  <option value="AnyDesk_ID">ID AnyDesk / RustDesk / TeamViewer</option>
                  <option value="Config_Router">Configuración de Router / Switch</option>
                  <option value="Otro">Otro dato sensible</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                  Descripción o Identificador *
                </label>
                <input
                  type="text"
                  name="descripcion"
                  defaultValue={credencialInicial?.descripcion}
                  placeholder="Ej: admin / Acceso a MikroTik principal o Winbox"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-zinc-500" />
                  Valor Secreto {isEdit ? "(Dejar en blanco para conservar)" : "*"}
                </label>
                <input
                  type="password"
                  name="valor_real"
                  required={!isEdit}
                  placeholder={isEdit ? "•••••••• (Sin cambios)" : "••••••••"}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 font-mono transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
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
                  <div className="flex items-center justify-center w-full px-4 py-3 border border-zinc-800 border-dashed rounded-xl bg-zinc-950 hover:bg-zinc-900 transition-colors">
                    <Upload className="w-4 h-4 mr-2 text-zinc-500" />
                    <span className="text-xs text-zinc-400 truncate">
                      {fileName
                        ? fileName
                        : "Subir imagen (QR, etiqueta con serial, topología...)"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="pt-3 flex justify-end gap-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-medium shadow-lg shadow-rose-950/40 transition-all"
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
