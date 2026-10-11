"use client";

import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  FolderGit2,
  DollarSign,
  ArrowRight,
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  History,
} from "lucide-react";
import { UltimaTransaccion, UltimoProyecto } from "@/app/actions/dashboard";

interface Props {
  transacciones: UltimaTransaccion[];
  proyectos: UltimoProyecto[];
}

export function RecentActivity({ transacciones, proyectos }: Props) {
  const formatMonto = (monto: number, moneda: "ARS" | "USDT") => {
    if (moneda === "USDT") {
      return `USDT ${monto.toFixed(2)}`;
    }
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(monto);
  };

  const formatFecha = (iso: string | null) => {
    if (!iso) return "Fecha no registrada";
    const date = new Date(iso);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Borrador_Bot":
        return {
          label: "Borrador Bot",
          cls: "bg-violet-500/10 text-violet-300 border-violet-500/20",
        };
      case "En_Ejecucion":
        return {
          label: "En Ejecución",
          cls: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
        };
      case "Finalizado":
        return {
          label: "Finalizado",
          cls: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
        };
      case "Pendiente_Aprobacion_Cliente":
        return {
          label: "Pendiente Aprob.",
          cls: "bg-amber-500/10 text-amber-300 border-amber-500/20",
        };
      case "Aprobado":
        return {
          label: "Aprobado",
          cls: "bg-blue-500/10 text-blue-300 border-blue-500/20",
        };
      default:
        return {
          label: estado.replace(/_/g, " "),
          cls: "bg-zinc-800 text-zinc-300 border-zinc-700",
        };
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Panel 1: Últimas Transacciones */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-5 shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Últimos Movimientos Financieros
              </h3>
            </div>
            <Link
              href="/finanzas"
              className="text-xs text-zinc-400 hover:text-cyan-400 font-medium flex items-center gap-1 transition-colors group"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60 mt-2">
            {transacciones.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No hay movimientos financieros recientes registrados.
              </div>
            ) : (
              transacciones.map((tx) => {
                const isIngreso = tx.tipo === "Ingreso";
                return (
                  <div
                    key={tx.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-800/20 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-lg shrink-0 border ${
                          isIngreso
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                        }`}
                      >
                        {isIngreso ? (
                          <ArrowDownLeft className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-200 truncate">
                          {tx.descripcion || `${tx.tipo} - ${tx.categoria}`}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                          <span>{tx.categoria}</span>
                          <span>•</span>
                          <span>{formatFecha(tx.fecha_transaccion)}</span>
                          {tx.clienteNombre && (
                            <>
                              <span>•</span>
                              <span className="text-cyan-400/80 truncate">
                                {tx.clienteNombre}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p
                        className={`text-xs font-mono font-bold ${
                          isIngreso ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isIngreso ? "+" : "-"}
                        {formatMonto(tx.monto, tx.moneda)}
                      </p>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                          tx.estado === "Pagado"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        }`}
                      >
                        {tx.estado}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-2 text-right">
          <Link
            href="/finanzas"
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Auditoría contable completa en módulo Finanzas →
          </Link>
        </div>
      </div>

      {/* Panel 2: Proyectos Recientes */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-5 shadow-sm space-y-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <FolderGit2 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Últimos Proyectos y Obras
              </h3>
            </div>
            <Link
              href="/proyectos"
              className="text-xs text-zinc-400 hover:text-cyan-400 font-medium flex items-center gap-1 transition-colors group"
            >
              <span>Ver todos</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-800/60 mt-2">
            {proyectos.length === 0 ? (
              <div className="py-8 text-center text-xs text-zinc-500">
                No hay proyectos registrados en el sistema.
              </div>
            ) : (
              proyectos.map((proy) => {
                const badge = getEstadoBadge(proy.estado);
                const montoDisplay =
                  proy.total_final > 0 ? proy.total_final : proy.total_estimado;

                return (
                  <Link
                    key={proy.id}
                    href={`/proyectos/${proy.id}`}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-zinc-800/20 px-2 rounded-lg transition-colors group block"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-lg shrink-0 bg-zinc-800/80 border border-zinc-700/60 text-zinc-300 group-hover:text-cyan-400 group-hover:border-cyan-500/30 transition-colors">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-zinc-200 group-hover:text-cyan-300 transition-colors truncate">
                          {proy.clienteNombre}
                        </p>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-500 mt-0.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                          <span>•</span>
                          <span>{formatFecha(proy.created_at)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs font-mono font-bold text-zinc-100">
                        {new Intl.NumberFormat("es-AR", {
                          style: "currency",
                          currency: "ARS",
                          maximumFractionDigits: 0,
                        }).format(montoDisplay)}
                      </p>
                      <span className="text-[10px] text-zinc-500">
                        {proy.total_final > 0 ? "Total final" : "Estimado"}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        <div className="pt-2 text-right">
          <Link
            href="/proyectos"
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Gestión completa de presupuestos y cierre de obra →
          </Link>
        </div>
      </div>
    </div>
  );
}
