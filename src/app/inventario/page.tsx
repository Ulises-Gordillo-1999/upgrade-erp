import { getInventario } from "@/app/actions/inventario";
import { InventarioFormModal } from "@/components/inventario/InventarioFormModal";
import { InventarioTable } from "@/components/inventario/InventarioTable";

export default async function InventarioPage() {
  const inventario = await getInventario();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            Inventario y Catálogo
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Control de stock, equipos y servicios ofrecidos.
          </p>
        </div>
        <InventarioFormModal />
      </div>

      <InventarioTable inventario={inventario as any} />
    </div>
  );
}
