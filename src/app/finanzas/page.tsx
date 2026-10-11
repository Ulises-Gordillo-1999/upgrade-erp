import { getTransacciones } from "@/app/actions/finanzas";
import { TransaccionFormModal } from "@/components/finanzas/TransaccionFormModal";
import { DeleteTransaccionButton } from "@/components/finanzas/DeleteTransaccionButton";
import { DollarSign, ArrowUpRight, ArrowDownRight, Calendar, CreditCard, FolderGit2 } from "lucide-react";

export default async function FinanzasPage() {
  const transacciones = await getTransacciones();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-emerald-500" />
            Finanzas y Flujo de Caja
          </h2>
          <p className="text-zinc-400 mt-1">Control de ingresos, egresos, ARS y USDT.</p>
        </div>
        <TransaccionFormModal />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Concepto</th>
                <th className="px-6 py-4 font-medium">Categoría</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">Monto</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {transacciones.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No hay transacciones registradas. Crea tu primer movimiento.
                  </td>
                </tr>
              ) : (
                transacciones.map((t) => (
                  <tr key={t.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-100 flex items-center">
                          {t.tipo === 'Ingreso' ? (
                            <ArrowUpRight className="w-4 h-4 mr-1 text-emerald-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 mr-1 text-rose-500" />
                          )}
                          {t.descripcion || `Movimiento de ${t.tipo}`}
                        </span>
                        {t.proyecto_id && (
                          <span className="text-xs text-cyan-400 flex items-center mt-1">
                            <FolderGit2 className="w-3 h-3 mr-1" />
                                                        {t.proyectos?.clientes?.nombre_razon_social || "Proyecto Eliminado"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded border border-zinc-700">
                        {t.categoria}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-zinc-400 text-xs">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(t.fecha_transaccion!).toLocaleString("es-AR", {
                          day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute:'2-digit'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold ${t.tipo === 'Ingreso' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {t.tipo === 'Ingreso' ? '+' : '-'} 
                          {new Intl.NumberFormat("es-AR", { style: "currency", currency: t.moneda }).format(t.monto)}
                        </span>
                        <span className="text-[10px] text-zinc-500 flex items-center mt-0.5">
                          <CreditCard className="w-3 h-3 mr-1" />
                          {t.metodo_pago}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-full border ${
                        t.estado === 'Pagado' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                      }`}>
                        {t.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1">
                        <TransaccionFormModal transaccionInicial={t as any} isEdit={true} />
                        <DeleteTransaccionButton id={t.id} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
