"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteUsuario } from "@/app/actions/usuarios";

interface DeleteUsuarioButtonProps {
  id: string;
  nombre: string;
  isSelf: boolean;
}

export function DeleteUsuarioButton({ id, nombre, isSelf }: DeleteUsuarioButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (isSelf) {
      alert("No puedes eliminar tu propia cuenta.");
      return;
    }

    const confirmed = confirm(
      `¿Está seguro de que desea eliminar al usuario "${nombre}"? Esta acción es irreversible.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      await deleteUsuario(id);
    } catch (err: any) {
      alert(err.message || "Error al eliminar usuario.");
    } finally {
      setLoading(false);
    }
  };

  if (isSelf) {
    return (
      <span className="p-1.5 text-zinc-700 cursor-not-allowed" title="No puedes eliminarte a ti mismo">
        <Trash2 className="w-4 h-4" />
      </span>
    );
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors disabled:opacity-50"
      title="Eliminar usuario"
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin text-rose-400" /> : <Trash2 className="w-4 h-4" />}
    </button>
  );
}
