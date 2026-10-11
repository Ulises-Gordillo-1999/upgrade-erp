"use client";

import { Trash2 } from "lucide-react";
import { deleteBovedaRecord } from "@/app/actions/boveda";

export function DeleteBovedaButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (window.confirm("¿Seguro que deseas eliminar esta credencial de la bóveda? Esta acción no se puede deshacer.")) {
      try {
        await deleteBovedaRecord(id);
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Error al eliminar la credencial.");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-zinc-800/50 rounded-md transition-colors"
      title="Eliminar Credencial"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
