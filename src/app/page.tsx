import { getDashboardData } from "@/app/actions/dashboard";
import { FinancialCardsARS } from "@/components/dashboard/FinancialCardsARS";
import { ProjectCounter } from "@/components/dashboard/ProjectCounter";
import { CriticalStockAlert } from "@/components/dashboard/CriticalStockAlert";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Building2, Package, Wifi, ShieldCheck, Cpu } from "lucide-react";
import { TelemetryClock } from "@/components/dashboard/TelemetryClock";
import { formatFechaArgentina, formatHoraArgentina } from "@/utils/date";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  const now = new Date();
  const fechaHoy = formatFechaArgentina(now, true, true);
  const horaActual = formatHoraArgentina(now, true);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* 0. Telemetry Command Bar (Estilo Centro de Telemetría UPGRADE) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-white/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-cyan-500/25 backdrop-blur-md shadow-sm text-[10px] sm:text-[11px] font-mono text-slate-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
          <span className="text-slate-900 dark:text-zinc-200 font-bold tracking-wide truncate">
            UPGRADE CORE // TELEMETRÍA
          </span>
          <span className="text-slate-400 dark:text-zinc-600 hidden xs:inline">|</span>
          <span className="text-cyan-700 dark:text-cyan-400 font-medium hidden xs:inline">SISTEMA EN LÍNEA</span>
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-5 text-[10px] sm:text-[11px] pt-1.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-zinc-800/60">
          <TelemetryClock initialHora={horaActual} />
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <Wifi className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
            <span>LATENCIA: <strong className="text-slate-800 dark:text-zinc-200">2ms</strong></span>
          </span>
          <span className="hidden md:flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>SEGURIDAD: <strong className="text-slate-800 dark:text-zinc-200">AES-256 + RBAC</strong></span>
          </span>
          <span className="hidden sm:flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
            <Cpu className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>UPTIME: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">99.99%</strong></span>
          </span>
        </div>
      </div>

      {/* 1. Header Ejecutivo con Indicador en Vivo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-zinc-800/80 transition-colors">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">
              Panel de Control
            </h2>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Métricas en Vivo
            </span>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-xs sm:text-sm mt-1.5 transition-colors">
            <span className="capitalize">{fechaHoy}</span> • Monitoreo integral de operaciones, flujo de caja e inventario.
          </p>
        </div>

        {/* Resumen de Entidades */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex-1 sm:flex-initial rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-cyan-500/40 px-3.5 py-2 shadow-sm backdrop-blur-sm flex items-center gap-2.5 transition-all">
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Clientes</p>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100">
                {data.statsGenerales.clientesTotales}
              </p>
            </div>
          </div>

          <div className="flex-1 sm:flex-initial rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-cyan-500/40 px-3.5 py-2 shadow-sm backdrop-blur-sm flex items-center gap-2.5 transition-all">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Insumos</p>
              <p className="text-sm font-bold font-mono text-slate-900 dark:text-zinc-100">
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
