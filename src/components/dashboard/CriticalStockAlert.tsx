"use client";

import Link from "next/link";
import {
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { StockCriticoItem } from "@/app/actions/dashboard";

interface Props {
  stockCritico: {
    count: number;
    items: StockCriticoItem[];
  };
}

export function CriticalStockAlert({ stockCritico }: Props) {
  const hasAlerts = stockCritico.count > 0;

  if (!hasAlerts) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-emerald-500/20 bg-white/70 dark:bg-[#0c101b]/70 p-5 backdrop-blur-xl shadow-sm transition-all telemetry-card">
        {/* Acento superior de telemetría */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/20 via-emerald-500/50 to-transparent" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
                  // TELEMETRÍA DE INVENTARIO
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                  100% Cobertura
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
                Sensores de Stock en Estado Nominal
              </h4>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                Todos los insumos físicos, bobinas y repuestos se encuentran por encima de su umbral mínimo de seguridad.
              </p>
            </div>
          </div>

          <Link
            href="/inventario"
            className="text-xs font-mono font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 group"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-rose-500/30 bg-white/70 dark:bg-[#0c101b]/80 p-5 shadow-lg shadow-rose-950/10 backdrop-blur-xl space-y-4 transition-all telemetry-card">
      {/* Acento superior de telemetría */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-rose-500/40 via-rose-500/80 to-transparent" />
      
      {/* Header con alerta activa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 shrink-0 relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono font-bold tracking-wider text-rose-600 dark:text-rose-400">
                // SENSOR DE STOCK & HARDWARE • ALERTA ACTIVA
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-medium">
                {stockCritico.count} ítems bajo el mínimo
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 mt-0.5">
              Reposición Requerida
            </h4>
            <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
              Se requiere reposición urgente para no demorar instalaciones ni proyectos en curso.
            </p>
          </div>
        </div>

        <Link
          href="/inventario"
          className="text-xs font-mono font-medium text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 group"
        >
          <span>Ir a Inventario</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid de ítems en estado crítico */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {stockCritico.items.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/80 p-3 flex items-center justify-between gap-3 shadow-sm hover:border-rose-500/40 transition-colors"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                  {item.nombre}
                </p>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500 mt-0.5 font-mono">
                SKU: {item.sku || "N/A"} • Tipo: {item.tipo}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-bold font-mono text-rose-600 dark:text-rose-400">
                {item.stock_actual} disp.
              </span>
              <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
                Mín: {item.stock_minimo}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
