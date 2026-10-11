import { getBovedaData } from "@/app/actions/boveda";
import { MaskedValue } from "@/components/boveda/MaskedValue";
import { BovedaImageModal } from "@/components/boveda/BovedaImageModal";
import { ShieldAlert, FolderGit2, Calendar, Key, Network, MonitorSmartphone, Router } from "lucide-react";
import { TipoDatoBoveda } from "@/types/database";

const getTipoDatoIcon = (tipo: TipoDatoBoveda) => {
  switch (tipo) {
    case "Password":
      return <Key className="w-4 h-4 text-amber-400" />;
    case "IP_Publica":
      return <Network className="w-4 h-4 text-blue-400" />;
    case "AnyDesk_ID":
      return <MonitorSmartphone className="w-4 h-4 text-emerald-400" />;
    case "Config_Router":
      return <Router className="w-4 h-4 text-cyan-400" />;
    default:
      return <ShieldAlert className="w-4 h-4 text-zinc-400" />;
  }
};

export default async function BovedaGlobalPage() {
  const bovedaItems = await getBovedaData();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center">
            <ShieldAlert className="w-8 h-8 mr-3 text-rose-500" />
            Bóveda Segura Global
          </h2>
          <p className="text-zinc-400 mt-1">Acceso centralizado a contraseñas y configuraciones sensibles (Encriptación AES).</p>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-zinc-400 uppercase bg-zinc-900/80 border-b border-zinc-800">
              <tr>
                <th className="px-6 py-4 font-medium">Proyecto / Cliente</th>
                <th className="px-6 py-4 font-medium">Tipo de Dato</th>
                <th className="px-6 py-4 font-medium">Descripción</th>
                <th className="px-6 py-4 font-medium">Valor Desencriptado</th>
                <th className="px-6 py-4 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {bovedaItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                    No hay registros en la bóveda de seguridad.
                  </td>
                </tr>
              ) : (
                bovedaItems.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FolderGit2 className="w-4 h-4 mr-2 text-cyan-400" />
                        <div className="flex flex-col">
                                                    <span className="font-medium text-zinc-100">{item.proyectos?.clientes?.nombre_razon_social || "Desconocido"}</span>
                          <span className="text-xs text-zinc-500">ID: {item.proyecto_id?.split('-')[0]}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-zinc-300">
                        <div className="mr-2 p-1.5 bg-zinc-800 rounded-md">
                          {getTipoDatoIcon(item.tipo_dato as TipoDatoBoveda)}
                        </div>
                        {item.tipo_dato.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-300 font-medium">
                      {item.descripcion}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                                                <MaskedValue value={item.valor_desencriptado || ""} />
                        {item.archivo_url && (
                          <BovedaImageModal path={item.archivo_url} />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500 text-xs">
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1.5" />
                        {new Date(item.created_at!).toLocaleDateString("es-AR")}
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
