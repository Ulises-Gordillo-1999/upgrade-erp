import { getClientes } from "@/app/actions/clientes";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { ClientesTable } from "@/components/clientes/ClientesTable";

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Directorio de Clientes</h2>
          <p className="text-zinc-400 mt-1">Gestiona la base de clientes y su información fiscal.</p>
        </div>
        <ClienteFormModal />
      </div>

      <ClientesTable clientes={clientes as any} />
    </div>
  );
}
