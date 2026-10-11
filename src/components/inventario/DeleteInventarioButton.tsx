"use client";

import { Trash2 } from "lucide-react";
import { deleteItemInventario } from "@/app/actions/inventario";

export function DeleteInventarioButton({ id }: { id: string }) {
  const handleDelete = async () => {
    if (window.confirm("¿Seguro que deseas eliminar este ítem? No se podrá eliminar si ya está en uso en algún proyecto.")) {
      try {
        await deleteItemInventario(id);
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Error al eliminar el ítem de inventario.");
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
