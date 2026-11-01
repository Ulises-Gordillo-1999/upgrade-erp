import { getClientes } from "@/app/actions/clientes";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { ClientesTable } from "@/components/clientes/ClientesTable";
import { Building2 } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Directorio de Clientes | UPGRADE ERP",
  description: "Directorio corporativo, datos fiscales y contacto de clientes de UPGRADE ERP",
};

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center transition-colors">
            <Building2 className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 sm:mr-3 text-cyan-500 shrink-0" />
            Directorio de Clientes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Base de clientes, datos fiscales (CUIT/IVA), contacto directo y obras asociadas.
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <ClienteFormModal />
        </div>
      </div>

      <ClientesTable clientes={clientes as any} />
    </div>
  );
}
