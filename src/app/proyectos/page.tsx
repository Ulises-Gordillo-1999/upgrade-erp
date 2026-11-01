import { getProyectos } from "@/app/actions/proyectos";
import { getClientes } from "@/app/actions/clientes";
import { getSession } from "@/utils/auth";
import { ProyectoFormModal } from "@/components/proyectos/ProyectoFormModal";
import { ProyectosTable } from "@/components/proyectos/ProyectosTable";
import { FolderGit2 } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Proyectos y Presupuestos | UPGRADE ERP",
  description:
    "Control de cotizaciones, obras de redes y liquidación de materiales de UPGRADE ERP",
};

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
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center transition-colors">
            <FolderGit2 className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 sm:mr-3 text-cyan-500 shrink-0" />
            Proyectos y Presupuestos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Gestiona cotizaciones, ciclo de vida de obras y liquidación de materiales en terreno.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ProyectoFormModal clientes={clientes} />
        </div>
      </div>

      <ProyectosTable proyectos={proyectos as any} isSuperAdmin={isSuperAdmin} />
    </div>
  );
}
