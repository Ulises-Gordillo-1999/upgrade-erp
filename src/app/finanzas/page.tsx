import {
  getTransacciones,
  getRentabilidadProyectos,
  getCategoriasFinanzas,
} from "@/app/actions/finanzas";
import { FinanzasDashboard } from "@/components/finanzas/FinanzasDashboard";

export default async function FinanzasPage() {
  const [transacciones, rentabilidad, categorias] = await Promise.all([
    getTransacciones(),
    getRentabilidadProyectos(),
    getCategoriasFinanzas(),
  ]);

  return (
    <FinanzasDashboard
      transacciones={transacciones as any}
      rentabilidad={rentabilidad}
      categorias={categorias}
    />
  );
}

