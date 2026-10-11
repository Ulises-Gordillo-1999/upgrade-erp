import { getDashboardData } from "@/app/actions/dashboard";
import { FinancialCardsARS } from "@/components/dashboard/FinancialCardsARS";
import { ProjectCounter } from "@/components/dashboard/ProjectCounter";
import { CriticalStockAlert } from "@/components/dashboard/CriticalStockAlert";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Activity, ShieldCheck, Sparkles, Building2, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();

  const fechaHoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* 1. Header Ejecutivo con Indicador en Vivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Panel de Control
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Métricas en Vivo
            </span>
          </div>
          <p className="text-zinc-400 text-sm mt-1.5 capitalize">
            {fechaHoy} • Monitoreo integral de operaciones, flujo de caja e inventario.
          </p>
        </div>

        {/* Resumen de Entidades */}
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 backdrop-blur-sm flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400">Clientes</p>
              <p className="text-sm font-bold font-mono text-zinc-100">
                {data.statsGenerales.clientesTotales}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 backdrop-blur-sm flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-zinc-400">Insumos</p>
              <p className="text-sm font-bold font-mono text-zinc-100">
                {data.statsGenerales.itemsTotales}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Tarjetas de Resumen Financiero (Solo ARS) */}
      <section>
        <FinancialCardsARS data={data.finanzasARS} />
      </section>

      {/* 3. Contador de Proyectos (Borrador Bot, En Ejecución, Finalizados) */}
      <section>
        <ProjectCounter counts={data.proyectosCounts} />
      </section>

      {/* 4. Alerta Visual de Stock Crítico en Tiempo Real */}
      <section>
        <CriticalStockAlert stockCritico={data.stockCritico} />
      </section>

      {/* 5. Accesos Directos Rápidos */}
      <section>
        <QuickActions />
      </section>

      {/* 6. Últimos Movimientos (Finanzas & Proyectos) */}
      <section>
        <RecentActivity
          transacciones={data.ultimasTransacciones}
          proyectos={data.ultimosProyectos}
        />
      </section>
    </div>
  );
}
