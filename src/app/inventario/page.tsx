import { getInventario, getCategorias } from "@/app/actions/inventario";
import { InventarioFormModal } from "@/components/inventario/InventarioFormModal";
import { GestionarCategoriasModal } from "@/components/inventario/GestionarCategoriasModal";
import { InventarioTable } from "@/components/inventario/InventarioTable";

export default async function InventarioPage() {
  const [inventario, categorias] = await Promise.all([
    getInventario(),
    getCategorias(),
  ]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            Inventario y Catálogo
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Control de stock, equipos y servicios ofrecidos.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <GestionarCategoriasModal categorias={categorias} />
          <InventarioFormModal categorias={categorias} />
        </div>
      </div>

      <InventarioTable inventario={inventario as any} categorias={categorias} />
    </div>
  );
}
