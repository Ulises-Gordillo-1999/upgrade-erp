import { getClientes } from "@/app/actions/clientes";
import { ClienteFormModal } from "@/components/clientes/ClienteFormModal";
import { DeleteClienteButton } from "@/components/clientes/DeleteClienteButton";
import { Building2, Phone, ReceiptText, MapPin } from "lucide-react";

export default async function ClientesPage() {
  const clientes = await getClientes();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">Directorio de Clientes</h2>
          <p className="text-zinc-400 mt-1">Gestiona la base de clientes y su información fiscal.</p>
        </div>
        <ClienteFormModal />
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Contacto</th>
                <th className="px-6 py-4 font-medium">Fiscal</th>
                <th className="px-6 py-4 font-medium">Dirección</th>
                <th className="px-6 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {clientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                    No hay clientes registrados.
                  </td>
                </tr>
              ) : (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center mr-3">
                          <Building2 className="w-4 h-4 text-cyan-400" />
                        </div>
                        <span className="font-medium text-zinc-100">{cliente.nombre_razon_social}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="flex items-center">
                        <Phone className="w-3.5 h-3.5 mr-2 opacity-70" />
                        {cliente.telefono || "-"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="flex flex-col space-y-1">
                        <span className="flex items-center text-xs">
                          <ReceiptText className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                          {cliente.condicion_iva || "No definido"}
                        </span>
                        {cliente.cuit_cuil && <span className="text-xs opacity-70 ml-5">CUIT: {cliente.cuit_cuil}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="flex items-start">
                        <MapPin className="w-3.5 h-3.5 mr-2 mt-0.5 opacity-70 flex-shrink-0" />
                        <span className="truncate max-w-[200px]">{cliente.direccion || "-"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1">
                        <ClienteFormModal clienteInicial={cliente} isEdit={true} />
                        <DeleteClienteButton id={cliente.id} />
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
