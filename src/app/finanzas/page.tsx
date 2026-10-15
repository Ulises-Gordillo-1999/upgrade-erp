import { getTransacciones } from "@/app/actions/finanzas";
import { TransaccionFormModal } from "@/components/finanzas/TransaccionFormModal";
import { FinanzasTable } from "@/components/finanzas/FinanzasTable";
import { DollarSign } from "lucide-react";

export default async function FinanzasPage() {
  const transacciones = await getTransacciones();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center">
            <DollarSign className="w-8 h-8 mr-3 text-emerald-500" />
            Finanzas y Flujo de Caja
          </h2>
          <p className="text-zinc-400 mt-1">Control de ingresos, egresos, ARS y USDT.</p>
        </div>
        <TransaccionFormModal />
      </div>

      <FinanzasTable transacciones={transacciones as any} />
    </div>
  );
}
