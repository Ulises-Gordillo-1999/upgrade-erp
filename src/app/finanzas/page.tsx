import { getTransacciones } from "@/app/actions/finanzas";
import { TransaccionFormModal } from "@/components/finanzas/TransaccionFormModal";
import { FinanzasTable } from "@/components/finanzas/FinanzasTable";
import { DollarSign } from "lucide-react";

export default async function FinanzasPage() {
  const transacciones = await getTransacciones();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center transition-colors">
            <DollarSign className="w-7 h-7 sm:w-8 sm:h-8 mr-2.5 sm:mr-3 text-emerald-500 shrink-0" />
            Finanzas y Flujo de Caja
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1 transition-colors">
            Control de ingresos, egresos, ARS y USDT.
          </p>
        </div>
        <TransaccionFormModal />
      </div>

      <FinanzasTable transacciones={transacciones as any} />
    </div>
  );
}
