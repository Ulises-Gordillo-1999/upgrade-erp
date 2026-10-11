"use client";

import Link from "next/link";
import {
  AlertTriangle,
  PackageX,
  PackageCheck,
  ArrowRight,
  Boxes,
  ShieldAlert,
  ShieldCheck,
  Plus,
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
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/20 via-zinc-900/60 to-zinc-950 p-5 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-zinc-100">
                  Inventario en Estado Óptimo
                </h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  100% Cobertura
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Todos los insumos físicos y repuestos se encuentran por encima de su stock mínimo de seguridad.
              </p>
            </div>
          </div>

          <Link
            href="/inventario"
            className="text-xs font-medium text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-zinc-900/90 to-zinc-950 p-5 shadow-lg shadow-rose-950/20 backdrop-blur-sm space-y-4">
      {/* Header con alerta activa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0 relative">
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <ShieldAlert className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                Alerta de Stock Crítico
              </h4>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                {stockCritico.count} {stockCritico.count === 1 ? "ítem en riesgo" : "ítems en riesgo"}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Materiales e insumos por debajo o igual al stock mínimo configurado. Requieren reposición inmediata.
            </p>
          </div>
        </div>

        <Link
          href="/inventario"
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 hover:text-white transition-all flex items-center gap-1.5 self-start sm:self-auto shrink-0"
        >
          <span>Ir a Inventario / Reponer</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Lista / Tabla de ítems críticos */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="text-[11px] text-zinc-400 uppercase bg-zinc-900/60 border-b border-zinc-800">
            <tr>
              <th className="px-3 py-2 font-medium">Ítem / Insumo</th>
              <th className="px-3 py-2 font-medium">SKU</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium text-center">Stock Actual</th>
              <th className="px-3 py-2 font-medium text-center">Stock Mínimo</th>
              <th className="px-3 py-2 font-medium text-right">Déficit</th>
              <th className="px-3 py-2 font-medium text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {stockCritico.items.slice(0, 5).map((item) => {
              const isAgotado = item.stock_actual <= 0;
              return (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-800/30 transition-colors group"
                >
                  <td className="px-3 py-2.5 font-medium text-zinc-200">
                    <div className="flex items-center gap-2">
                      {isAgotado ? (
                        <PackageX className="w-4 h-4 text-rose-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">
                        {item.nombre}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-zinc-400">
                    {item.sku || "S/SKU"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {item.tipo}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded ${
                        isAgotado
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {item.stock_actual}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-center font-mono text-zinc-400">
                    {item.stock_minimo}
                  </td>
                  <td className="px-3 py-2.5 text-right font-mono font-semibold text-rose-400">
                    -{item.deficit} u.
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <Link
                      href="/inventario"
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium hover:underline"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {stockCritico.items.length > 5 && (
        <div className="text-center pt-2 border-t border-zinc-800/60">
          <Link
            href="/inventario"
            className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors inline-flex items-center gap-1"
          >
            <span>Ver los {stockCritico.items.length - 5} ítems críticos restantes en Inventario</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}
