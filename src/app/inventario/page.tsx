import { getInventario, getCategorias } from "@/app/actions/inventario";
import { InventarioFormModal } from "@/components/inventario/InventarioFormModal";
import { GestionarCategoriasModal } from "@/components/inventario/GestionarCategoriasModal";
import { InventarioTable } from "@/components/inventario/InventarioTable";
import { Boxes } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inventario y Catálogo IT | UPGRADE ERP",
  description:
    "Control de stock, equipos fijos, consumibles de red y catálogo de servicios de UPGRADE ERP",
};

export default async function InventarioPage() {
  const [inventario, categorias] = await Promise.all([
    getInventario(),
    getCategorias(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center transition-colors">
            <Boxes className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 sm:mr-3 text-cyan-500 shrink-0" />
            Inventario y Catálogo IT
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Control de stock físico en depósito, consumibles de conectividad y servicios.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:gap-2.5 w-full sm:w-auto">
          <GestionarCategoriasModal categorias={categorias} />
          <InventarioFormModal categorias={categorias} />
        </div>
      </div>

      <InventarioTable inventario={inventario as any} categorias={categorias} />
    </div>
  );
}
