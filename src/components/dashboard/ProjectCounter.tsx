"use client";

import Link from "next/link";
import {
  FolderGit2,
  Bot,
  Activity,
  CheckCircle2,
  ArrowRight,
  Clock,
  Sparkles,
  FileCheck,
} from "lucide-react";

interface Props {
  counts: {
    borradorBot: number;
    enEjecucion: number;
    finalizados: number;
    pendienteAprobacion: number;
    aprobados: number;
    cancelados: number;
    total: number;
  };
}

export function ProjectCounter({ counts }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
            <FolderGit2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-zinc-100 flex items-center gap-2 transition-colors">
              Estado de Obras & Proyectos
              <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 font-medium">
                {counts.total} en total
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 transition-colors">
              Distribución de etapas de presupuestación, ejecución técnica y cierre.
            </p>
          </div>
        </div>

        <Link
          href="/proyectos"
          className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors group self-start sm:self-auto"
        >
          <span>Ver todos los proyectos</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Grid de los 3 contadores clave solicitados */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* 1. Borrador Bot */}
        <Link
          href="/proyectos"
          className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-zinc-900/80 dark:to-zinc-950/80 p-5 shadow-sm hover:border-violet-500/40 hover:shadow-md transition-all duration-300 group block"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-violet-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-violet-500/10 transition-colors" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 group-hover:scale-110 transition-transform">
                <Bot className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Borrador Bot
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/20 px-2 py-0.5 rounded font-medium">
              Estimación
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
                {counts.borradorBot}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">cotizaciones</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 shrink-0" />
              <span>Borradores automáticos / Cotizaciones preliminares</span>
            </p>
          </div>
        </Link>

        {/* 2. En Ejecución */}
        <Link
          href="/proyectos"
          className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-zinc-900/80 dark:to-zinc-950/80 p-5 shadow-sm hover:border-cyan-500/40 hover:shadow-md transition-all duration-300 group block"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                <Activity className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                En Ejecución
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 px-2 py-0.5 rounded font-medium">
              Activo
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                {counts.enEjecucion}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">obras en curso</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
              <span>Servicios y cableado en progreso físico</span>
            </p>
          </div>
        </Link>

        {/* 3. Finalizados */}
        <Link
          href="/proyectos"
          className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-transparent dark:bg-gradient-to-b dark:from-zinc-900/80 dark:to-zinc-950/80 p-5 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 group block"
        >
          <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors" />

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                Finalizados
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-medium">
              Concluido
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                {counts.finalizados}
              </span>
              <span className="text-xs text-slate-500 dark:text-zinc-500 font-medium">entregados</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center gap-1.5">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Obras cerradas con liquidación de stock real</span>
            </p>
          </div>
        </Link>
      </div>

      {/* Fila secundaria informativa */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/40 p-2.5 flex items-center justify-between shadow-sm transition-colors">
          <span className="text-slate-600 dark:text-zinc-400">Pendientes Aprobación:</span>
          <span className="font-mono font-semibold text-amber-700 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            {counts.pendienteAprobacion}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/40 p-2.5 flex items-center justify-between shadow-sm transition-colors">
          <span className="text-slate-600 dark:text-zinc-400">Aprobados por Cliente:</span>
          <span className="font-mono font-semibold text-blue-700 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {counts.aprobados}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/40 p-2.5 flex items-center justify-between shadow-sm transition-colors">
          <span className="text-slate-600 dark:text-zinc-400">Cancelados / Desestimados:</span>
          <span className="font-mono font-semibold text-slate-600 dark:text-zinc-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
            {counts.cancelados}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 dark:border-zinc-800/70 bg-white dark:bg-zinc-900/40 p-2.5 flex items-center justify-between shadow-sm transition-colors">
          <span className="text-slate-600 dark:text-zinc-400">Total Proyectos:</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-700">
            {counts.total}
          </span>
        </div>
      </div>
    </div>
  );
}
