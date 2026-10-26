import { getTransacciones, getRentabilidadProyectos } from "@/app/actions/finanzas";
import { FinanzasDashboard } from "@/components/finanzas/FinanzasDashboard";

export default async function FinanzasPage() {
  const [transacciones, rentabilidad] = await Promise.all([
    getTransacciones(),
    getRentabilidadProyectos(),
  ]);

  return (
    <FinanzasDashboard
      transacciones={transacciones as any}
      rentabilidad={rentabilidad}
    />
  );
}
