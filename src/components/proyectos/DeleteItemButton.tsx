"use client";

import { Trash2 } from "lucide-react";
import { removeItemFromProyecto } from "@/app/actions/proyectos";

export function DeleteItemButton({ id, proyecto_id }: { id: string, proyecto_id: string }) {
  const handleDelete = async () => {
    if (window.confirm("¿Seguro que deseas quitar este ítem del presupuesto?")) {
      try {
        await removeItemFromProyecto(id, proyecto_id);
        window.location.reload();
      } catch (error) {
        console.error(error);
        alert("Error al quitar el ítem.");
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="p-1.5 text-zinc-500 hover:text-rose-500 hover:bg-zinc-800/50 rounded-md transition-colors ml-2"
      title="Quitar ítem"
      type="button"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
