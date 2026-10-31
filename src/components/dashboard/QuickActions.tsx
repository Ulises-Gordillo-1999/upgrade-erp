"use client";

import Link from "next/link";
import {
  DollarSign,
  FolderGit2,
  Package,
  Users,
  ShieldAlert,
  Zap,
  ArrowUpRight,
} from "lucide-react";

export function QuickActions() {
  const actions = [
    {
      title: "Nueva Transacción",
      desc: "Registrar ingreso o egreso en ARS/USDT",
      href: "/finanzas",
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/40",
    },
    {
      title: "Nuevo Proyecto",
      desc: "Crear cotización u obra técnica",
      href: "/proyectos",
      icon: FolderGit2,
      color: "text-cyan-600 dark:text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      hoverBorder: "hover:border-cyan-500/40",
    },
    {
      title: "Registrar Ítem",
      desc: "Dar de alta router, cable o insumo",
      href: "/inventario",
      icon: Package,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      hoverBorder: "hover:border-amber-500/40",
    },
    {
      title: "Nuevo Cliente",
      desc: "Alta de cliente comercial con CUIT",
      href: "/clientes",
      icon: Users,
      color: "text-blue-600 dark:text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      hoverBorder: "hover:border-blue-500/40",
    },
    {
      title: "Bóveda Segura",
      desc: "Resguardar passwords y configs",
      href: "/boveda",
      icon: ShieldAlert,
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      hoverBorder: "hover:border-rose-500/40",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
          <Zap className="w-4 h-4 text-amber-500 dark:text-amber-400" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold tracking-wider text-cyan-600 dark:text-cyan-400">
              // ACCIONES RÁPIDAS DE COMANDO
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 transition-colors">
            Atajos de Operaciones
          </h3>
          <p className="text-xs text-slate-500 dark:text-zinc-400 transition-colors">
            Acceso directo para la operatoria diaria de administración, soporte e infraestructura.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.title}
              href={act.href}
              className={`rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/80 dark:bg-[#0c101b]/80 backdrop-blur-xl p-3.5 shadow-sm transition-all duration-200 group flex flex-col justify-between hover:bg-slate-50 dark:hover:bg-[#121726] hover:-translate-y-0.5 telemetry-card ${act.hoverBorder}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${act.bg} ${act.border} ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-cyan-700 dark:group-hover:text-cyan-300 transition-colors">
                  {act.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-zinc-500 line-clamp-1 mt-0.5">
                  {act.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
