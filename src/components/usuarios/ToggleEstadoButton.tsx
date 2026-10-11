"use client";

import { useState } from "react";
import { toggleEstadoUsuario } from "@/app/actions/usuarios";
import { Loader2 } from "lucide-react";

interface ToggleEstadoButtonProps {
  id: string;
  activo: boolean;
  isSelf: boolean;
}

export function ToggleEstadoButton({ id, activo, isSelf }: ToggleEstadoButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (isSelf) {
      alert("No puedes desactivar tu propia cuenta.");
      return;
    }

    setLoading(true);
    try {
      await toggleEstadoUsuario(id, !activo);
    } catch (err: any) {
      alert(err.message || "Error al actualizar estado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading || isSelf}
      title={isSelf ? "No puedes desactivar tu propia cuenta" : activo ? "Desactivar usuario" : "Activar usuario"}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${
        activo ? "bg-emerald-500" : "bg-zinc-700"
      }`}
    >
      {loading ? (
        <span className="flex items-center justify-center w-full h-full">
          <Loader2 className="w-3 h-3 animate-spin text-white" />
        </span>
      ) : (
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            activo ? "translate-x-4" : "translate-x-0"
          }`}
        />
      )}
    </button>
  );
}
