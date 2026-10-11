import { getInventario } from "@/app/actions/inventario";
import { InventarioFormModal } from "@/components/inventario/InventarioFormModal";
import { DeleteInventarioButton } from "@/components/inventario/DeleteInventarioButton";
import { Package, Hash, CircleDollarSign, AlertTriangle } from "lucide-react";
import { TipoItem } from "@/types/database";

// Badge colors helper
const getBadgeStyles = (tipo: TipoItem) => {
  switch (tipo) {
    case "Fijo":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "Consumible":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Servicio":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
};

export default async function InventarioPage() {
  const inventario = await getInventario();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Inventario y Catálogo</h2>
          <p className="text-zinc-400 mt-1">Control de stock, equipos y servicios ofrecidos.</p>
        </div>
        <InventarioFormModal />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Ítem</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Precio Unitario</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {inventario.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    El inventario está vacío.
                  </td>
                </tr>
              ) : (
                inventario.map((item) => {
                  const isLowStock =
                    item.tipo !== "Servicio" &&
                    (item.stock_actual ?? 0) <= (item.stock_minimo ?? 0);

                  return (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-1.5">
                          <span className="font-medium text-zinc-100">{item.nombre}</span>
                          <div>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border uppercase tracking-wider ${getBadgeStyles(
                                item.tipo
                              )}`}
                            >
                              {item.tipo}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <div className="flex items-center">
                          <Hash className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                          {item.sku || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 font-medium">
                        <div className="flex items-center">
                          <CircleDollarSign className="w-4 h-4 mr-1.5 text-zinc-500" />
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(item.precio_unitario)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {item.tipo === "Servicio" ? (
                          <span className="text-zinc-500 text-sm">N/A</span>
                        ) : (
                          <div className="flex items-center">
                            <span
                              className={`font-medium ${
                                isLowStock ? "text-amber-400" : "text-zinc-300"
                              }`}
                            >
                              {item.stock_actual || 0}
                            </span>
                            {isLowStock && (
                              <span title="Stock bajo" className="flex items-center">
                                <AlertTriangle className="w-4 h-4 ml-2 text-amber-400" />
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-1">
                          <InventarioFormModal itemInicial={item} isEdit={true} />
                          <DeleteInventarioButton id={item.id} />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
