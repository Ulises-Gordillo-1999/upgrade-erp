"use client";

import {
  TrendingUp,
  TrendingDown,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
} from "lucide-react";

interface Props {
  data: {
    ingresos: number;
    egresos: number;
    neto: number;
    porCobrar: number;
    porPagar: number;
    totalOperaciones: number;
    mesNombre: string;
    margenOperativo: number;
  };
}

export function FinancialCardsARS({ data }: Props) {
  const formatARS = (val: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(val);

  const totalFlujo = data.ingresos + data.egresos;
  const pctIngresos = totalFlujo > 0 ? Math.round((data.ingresos / totalFlujo) * 100) : 50;
  const pctEgresos = totalFlujo > 0 ? 100 - pctIngresos : 50;

  const isNetoPositivo = data.neto >= 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 transition-colors">
              Flujo Financiero Mensual
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                Solo en ARS
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 transition-colors">
              Período de caja: <span className="text-slate-700 dark:text-zinc-300 font-medium">{data.mesNombre}</span> ({data.totalOperaciones} movimientos pagados)
            </p>
          </div>
        </div>

        {/* Badge de Rendimiento */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`text-xs px-2.5 py-1 rounded-full border flex items-center gap-1.5 font-medium ${
              isNetoPositivo
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                : "bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400"
            }`}
          >
            {isNetoPositivo ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>
              {isNetoPositivo
                ? `Superávit (${data.margenOperativo}% margen)`
                : `Déficit operativo`}
            </span>
          </div>
        </div>
      </div>

      {/* Grid de las 3 tarjetas principales */}
      <div className="grid gap-3.5 sm:gap-4 grid-cols-1 md:grid-cols-3">
        {/* Card 1: Ingresos ARS */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-zinc-900/80 dark:to-zinc-950/80 p-5 shadow-sm hover:border-emerald-500/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <ArrowDownLeft className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Ingresos (ARS)
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400/90 bg-emerald-500/10 px-2 py-0.5 rounded font-medium">
              {pctIngresos}% del flujo
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 font-mono">
              {formatARS(data.ingresos)}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <span>Cobrado en el mes</span>
              {data.porCobrar > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-mono font-medium">
                  +{formatARS(data.porCobrar)} pendiente
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Egresos ARS */}
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-zinc-900/80 dark:to-zinc-950/80 p-5 shadow-sm hover:border-rose-500/40 transition-all duration-300 group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/10 transition-colors" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <ArrowUpRight className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Egresos (ARS)
              </span>
            </div>
            <span className="text-[11px] font-mono text-rose-700 dark:text-rose-400/90 bg-rose-500/10 px-2 py-0.5 rounded font-medium">
              {pctEgresos}% del flujo
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-600 dark:text-rose-400 font-mono">
              {formatARS(data.egresos)}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <span>Gastos pagados</span>
              {data.porPagar > 0 && (
                <span className="text-rose-600 dark:text-rose-400/80 font-mono font-medium">
                  +{formatARS(data.porPagar)} por pagar
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Balance Neto ARS */}
        <div className={`relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all duration-300 group ${
          isNetoPositivo
            ? "border-slate-200 dark:border-zinc-800 bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-zinc-900/90 dark:to-zinc-950 hover:border-emerald-500/40"
            : "border-rose-200 dark:border-rose-900/40 bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-rose-950/20 dark:to-zinc-950 hover:border-rose-500/40"
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg border ${
                isNetoPositivo
                  ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-600 dark:text-cyan-400"
                  : "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400"
              }`}>
                <Wallet className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Balance Neto (ARS)
              </span>
            </div>
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-medium ${
              isNetoPositivo
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20"
            }`}>
              {isNetoPositivo ? "Ganancia Neta" : "Déficit"}
            </span>
          </div>

          <div className="space-y-1">
            <p className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-mono ${
              isNetoPositivo ? "text-slate-900 dark:text-white" : "text-rose-600 dark:text-rose-400"
            }`}>
              {formatARS(data.neto)}
            </p>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
              <span>Ingresos vs Gastos</span>
              <span className="text-slate-700 dark:text-zinc-300 font-mono font-medium">
                {isNetoPositivo ? `+${formatARS(data.neto)}` : formatARS(data.neto)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de proporción visual */}
      {totalFlujo > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 p-3 space-y-2 shadow-sm transition-colors">
          <div className="flex justify-between text-xs text-slate-600 dark:text-zinc-400">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              Ingresos ({pctIngresos}%)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
              Egresos ({pctEgresos}%)
            </span>
          </div>
          <div className="h-2 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${pctIngresos}%` }}
              className="bg-emerald-500 h-full transition-all duration-500"
              title={`Ingresos: ${pctIngresos}%`}
            />
            <div
              style={{ width: `${pctEgresos}%` }}
              className="bg-rose-500 h-full transition-all duration-500"
              title={`Egresos: ${pctEgresos}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
