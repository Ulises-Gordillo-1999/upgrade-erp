"use client";

import { Trash2 } from "lucide-react";
import { deleteTransaccion } from "@/app/actions/finanzas";

export function DeleteTransaccionButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (window.confirm("¿Seguro que deseas eliminar esta transacción? Esta acción no se puede deshacer.")) {
      try {
        await deleteTransaccion(id);
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Error al eliminar la transacción.");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-zinc-400 hover:text-rose-500 hover:bg-zinc-800/50 rounded-md transition-colors"
      title="Eliminar"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
