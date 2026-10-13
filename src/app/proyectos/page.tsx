import { getProyectos } from "@/app/actions/proyectos";
import { getClientes } from "@/app/actions/clientes";
import { getSession } from "@/utils/auth";
import { ProyectoFormModal } from "@/components/proyectos/ProyectoFormModal";
import { DeleteProyectoButton } from "@/components/proyectos/DeleteProyectoButton";
import { FolderGit2, Calendar, FileText, Activity } from "lucide-react";
import Link from "next/link";
import { EstadoProyecto } from "@/types/database";

const getEstadoBadge = (estado: EstadoProyecto) => {
  switch (estado) {
    case "Borrador_Bot":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    case "Pendiente_Aprobacion_Cliente":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "Aprobado":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "En_Ejecucion":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "Finalizado":
      return "bg-purple-500/10 text-purple-400 border-purple-500/20";
    case "Cancelado":
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    default:
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
  }
};

export default async function ProyectosPage() {
  const [proyectos, clientes, session] = await Promise.all([
    getProyectos(),
    getClientes(),
    getSession(),
  ]);

  const isSuperAdmin = session?.rol === "SuperAdmin";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Proyectos y Presupuestos</h2>
          <p className="text-zinc-400 mt-1">Gestiona el ciclo de vida de obras e instalaciones.</p>
        </div>
        <ProyectoFormModal clientes={clientes} />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Proyecto / Cliente</th>
                <th className="px-6 py-4 font-medium">Estado</th>
                <th className="px-6 py-4 font-medium">Presupuesto</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {proyectos.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No hay proyectos registrados.
                  </td>
                </tr>
              ) : (
                proyectos.map((proyecto) => (
                  <tr key={proyecto.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center mr-3">
                          <FolderGit2 className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div className="flex flex-col">
                                                    <span className="font-medium text-zinc-100">{proyecto.clientes?.nombre_razon_social || 'Desconocido'}</span>
                          <span className="text-xs text-zinc-500 truncate max-w-[200px] mt-0.5">
                            {proyecto.notas_tecnicas || 'Sin notas'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getEstadoBadge(proyecto.estado as EstadoProyecto)}`}>
                        {proyecto.estado?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-medium text-zinc-200">
                          {new Intl.NumberFormat("es-AR", {
                            style: "currency",
                            currency: "ARS",
                          }).format(proyecto.total_estimado || 0)}
                        </span>
                        {proyecto.total_final !== proyecto.total_estimado && proyecto.total_final !== 0 && (
                          <span className="text-xs text-cyan-500/80">
                            Final: {new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(proyecto.total_final!)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="flex items-center text-xs">
                        <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                        {new Date(proyecto.created_at!).toLocaleDateString("es-AR")}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link 
                          href={`/proyectos/${proyecto.id}`}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md transition-colors border border-zinc-700"
                        >
                          <FileText className="w-3 h-3 mr-1.5" />
                          Ver Detalle
                        </Link>
                        {isSuperAdmin && (
                          <DeleteProyectoButton
                            id={proyecto.id}
                            nombreCliente={proyecto.clientes?.nombre_razon_social || "Proyecto"}
                            isLiquidado={Boolean(proyecto.stock_descontado || proyecto.estado === "Finalizado")}
                            variant="icon"
                          />
                        )}
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
