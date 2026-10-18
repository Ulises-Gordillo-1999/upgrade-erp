import { getClientes } from "@/app/actions/clientes";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { ClientesTable } from "@/components/clientes/ClientesTable";

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">
            Directorio de Clientes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Gestiona la base de clientes y su información fiscal.
          </p>
        </div>
        <ClienteFormModal />
      </div>

      <ClientesTable clientes={clientes as any} />
    </div>
  );
}
