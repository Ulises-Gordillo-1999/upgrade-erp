import { getBovedaData } from "@/app/actions/boveda";
import { BovedaTable } from "@/components/boveda/BovedaTable";
import { ShieldAlert } from "lucide-react";

export default async function BovedaGlobalPage() {
  const bovedaItems = await getBovedaData();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center transition-colors">
            <ShieldAlert className="w-8 h-8 mr-3 text-rose-500" />
            Bóveda Segura Global
          </h2>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Acceso centralizado a contraseñas y configuraciones sensibles (Encriptación AES).
          </p>
        </div>
      </div>

      <BovedaTable bovedaItems={bovedaItems as any} />
    </div>
  );
}
