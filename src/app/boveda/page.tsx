import { getBovedaData } from "@/app/actions/boveda";
import { BovedaTable } from "@/components/boveda/BovedaTable";
import { ShieldAlert } from "lucide-react";

export default async function BovedaGlobalPage() {
  const bovedaItems = await getBovedaData();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center transition-colors">
            <ShieldAlert className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 sm:mr-3 text-rose-500 shrink-0" />
            Bóveda Segura Global
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Acceso centralizado a contraseñas y configuraciones sensibles (Encriptación AES).
          </p>
        </div>
      </div>

      <BovedaTable bovedaItems={bovedaItems as any} />
    </div>
  );
}
