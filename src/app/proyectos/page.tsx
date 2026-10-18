import { getProyectos } from "@/app/actions/proyectos";
import { getClientes } from "@/app/actions/clientes";
import { getSession } from "@/utils/auth";
import { ProyectoFormModal } from "@/components/proyectos/ProyectoFormModal";
import { ProyectosTable } from "@/components/proyectos/ProyectosTable";

export default async function ProyectosPage() {
  const [proyectos, clientes, session] = await Promise.all([
    getProyectos(),
    getClientes(),
    getSession(),
  ]);

  const isSuperAdmin = session?.rol === "SuperAdmin";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            Proyectos y Presupuestos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Gestiona el ciclo de vida de obras e instalaciones.
          </p>
        </div>
        <ProyectoFormModal clientes={clientes} />
      </div>

      <ProyectosTable proyectos={proyectos as any} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
