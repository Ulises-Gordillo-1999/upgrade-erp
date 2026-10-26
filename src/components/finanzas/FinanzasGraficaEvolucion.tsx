"use client";

import { useState, useMemo } from "react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Sparkles,
} from "lucide-react";

interface TransaccionParaGrafica {
  tipo: "Ingreso" | "Egreso";
  monto: number;
  moneda: "ARS" | "USDT";
  fecha_transaccion?: string;
  created_at?: string;
}

interface Props {
  transacciones: TransaccionParaGrafica[];
}

export function FinanzasGraficaEvolucion({ transacciones }: Props) {
  const [moneda, setMoneda] = useState<"ARS" | "USDT">("ARS");
  const [mesesAtras, setMesesAtras] = useState<6 | 12>(6);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Generar lista de los últimos N meses (orden cronológico)
  const monthlyData = useMemo(() => {
    const today = new Date();
    const result: Array<{
      key: string;
      label: string;
      yearMonth: string;
      ingresos: number;
      egresos: number;
      neto: number;
    }> = [];

    for (let i = mesesAtras - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthStr = String(month + 1).padStart(2, "0");
      const yearMonth = `${year}-${monthStr}`;

      const monthName = d.toLocaleDateString("es-AR", { month: "short" });
      const label = `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${String(year).slice(-2)}`;

      result.push({
        key: yearMonth,
        label,
        yearMonth,
        ingresos: 0,
        egresos: 0,
        neto: 0,
      });
    }

    // Sumar transacciones en sus meses correspondientes
    transacciones.forEach((t) => {
      if (t.moneda !== moneda) return;
      const fStr = t.fecha_transaccion || t.created_at;
      if (!fStr) return;

      const fDate = new Date(fStr);
      if (isNaN(fDate.getTime())) return;

      const ym = `${fDate.getFullYear()}-${String(fDate.getMonth() + 1).padStart(2, "0")}`;
      const entry = result.find((r) => r.yearMonth === ym);
      if (!entry) return;

      const val = Number(t.monto) || 0;
      if (t.tipo === "Ingreso") {
        entry.ingresos += val;
      } else if (t.tipo === "Egreso") {
        entry.egresos += val;
      }
    });

    result.forEach((r) => {
      r.neto = r.ingresos - r.egresos;
    });

    return result;
  }, [transacciones, moneda, mesesAtras]);

  // Cálculos de resumen
  const totales = useMemo(() => {
    const totalIngresos = monthlyData.reduce((acc, m) => acc + m.ingresos, 0);
    const totalEgresos = monthlyData.reduce((acc, m) => acc + m.egresos, 0);
    const netoTotal = totalIngresos - totalEgresos;
    const margen = totalIngresos > 0 ? (netoTotal / totalIngresos) * 100 : 0;

    let mejorMes = monthlyData[0];
    monthlyData.forEach((m) => {
      if (m.ingresos > (mejorMes?.ingresos || 0)) {
        mejorMes = m;
      }
    });

    return {
      totalIngresos,
      totalEgresos,
      netoTotal,
      margen: Math.round(margen),
      mejorMes: mejorMes?.ingresos > 0 ? mejorMes : null,
    };
  }, [monthlyData]);

  // Escalado SVG
  const maxVal = useMemo(() => {
    const maxNumber = Math.max(
      ...monthlyData.map((m) => Math.max(m.ingresos, m.egresos)),
      1
    );
    // Margen superior del 15%
    return maxNumber * 1.15;
  }, [monthlyData]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: moneda,
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Dimensiones del canvas SVG
  const svgWidth = 800;
  const svgHeight = 280;
  const paddingBottom = 40;
  const paddingTop = 20;
  const chartHeight = svgHeight - paddingBottom - paddingTop;
  const n = monthlyData.length;
  const slotWidth = svgWidth / n;
  const barWidth = Math.min(slotWidth * 0.28, 28);
  const gapBetweenBars = 3;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 p-5 sm:p-6 shadow-sm backdrop-blur-md space-y-6">
      {/* 1. Header con Controles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Evolución de Ingresos y Gastos
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Flujo comparativo mes a mes en tiempo real ({moneda}).
              </p>
            </div>
          </div>
        </div>

        {/* Controles de Divisa y Período */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Selector Moneda */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setMoneda("ARS")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                moneda === "ARS"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              ARS ($)
            </button>
            <button
              type="button"
              onClick={() => setMoneda("USDT")}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                moneda === "USDT"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              USDT (₮)
            </button>
          </div>

          {/* Selector Período */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-xs">
            <button
              type="button"
              onClick={() => setMesesAtras(6)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mesesAtras === 6
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              6 meses
            </button>
            <button
              type="button"
              onClick={() => setMesesAtras(12)}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                mesesAtras === 12
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              1 año
            </button>
          </div>
        </div>
      </div>

      {/* 2. Mini Tarjetas KPI del Período */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
            Ingresos Totales
          </span>
          <p className="text-base sm:text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totales.totalIngresos)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <ArrowDownRight className="w-3.5 h-3.5 text-rose-500" />
            Gastos Totales
          </span>
          <p className="text-base sm:text-lg font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatCurrency(totales.totalEgresos)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-cyan-500" />
            Balance Neto
          </span>
          <p
            className={`text-base sm:text-lg font-bold font-mono ${
              totales.netoTotal >= 0
                ? "text-cyan-600 dark:text-cyan-400"
                : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {totales.netoTotal >= 0 ? "+" : ""}
            {formatCurrency(totales.netoTotal)}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 dark:text-zinc-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Margen de Ganancia
          </span>
          <p className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
            {totales.margen}%
            {totales.mejorMes && (
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-sans block truncate">
                Pico: {totales.mejorMes.label}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* 3. Gráfico SVG Puro Liviano */}
      <div className="relative w-full pt-2">
        {/* Tooltip Dinámico Flotante */}
        {hoveredIndex !== null && monthlyData[hoveredIndex] && (
          <div className="absolute top-0 right-2 z-10 p-2.5 rounded-xl bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 shadow-xl text-xs space-y-1 backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-100 min-w-[150px]">
            <p className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-1">
              <Calendar className="w-3.5 h-3.5 text-cyan-500" />
              {monthlyData[hoveredIndex].label}
            </p>
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span>Ingresos:</span>
              <span className="font-bold font-mono">
                {formatCurrency(monthlyData[hoveredIndex].ingresos)}
              </span>
            </div>
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
              <span>Egresos:</span>
              <span className="font-bold font-mono">
                {formatCurrency(monthlyData[hoveredIndex].egresos)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300 pt-1 border-t border-slate-100 dark:border-zinc-800 font-semibold">
              <span>Neto:</span>
              <span className="font-mono">
                {formatCurrency(monthlyData[hoveredIndex].neto)}
              </span>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Líneas de Guía de Fondo */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = paddingTop + chartHeight * (1 - pct);
            const val = maxVal * pct;
            return (
              <g key={pct} className="opacity-40 dark:opacity-20">
                <line
                  x1={0}
                  y1={y}
                  x2={svgWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  className="text-slate-300 dark:text-zinc-700"
                />
                <text
                  x={svgWidth - 5}
                  y={y - 4}
                  textAnchor="end"
                  className="text-[9px] fill-slate-400 dark:fill-zinc-600 font-mono"
                >
                  {formatCurrency(val)}
                </text>
              </g>
            );
          })}

          {/* Barras por Cada Mes */}
          {monthlyData.map((m, idx) => {
            const slotX = idx * slotWidth;
            const centerX = slotX + slotWidth / 2;
            const isHovered = hoveredIndex === idx;

            // Alturas relativas
            const hIngreso = Math.max((m.ingresos / maxVal) * chartHeight, m.ingresos > 0 ? 4 : 0);
            const hEgreso = Math.max((m.egresos / maxVal) * chartHeight, m.egresos > 0 ? 4 : 0);

            const yIngreso = paddingTop + chartHeight - hIngreso;
            const yEgreso = paddingTop + chartHeight - hEgreso;

            const xIngreso = centerX - barWidth - gapBetweenBars / 2;
            const xEgreso = centerX + gapBetweenBars / 2;

            return (
              <g
                key={m.key}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer transition-opacity"
              >
                {/* Zona de hover de la columna completa */}
                <rect
                  x={slotX + 2}
                  y={paddingTop}
                  width={slotWidth - 4}
                  height={chartHeight + paddingBottom}
                  fill="transparent"
                  className={isHovered ? "fill-slate-500/5 dark:fill-white/5" : ""}
                />

                {/* Barra Ingreso */}
                <rect
                  x={xIngreso}
                  y={yIngreso}
                  width={barWidth}
                  height={hIngreso}
                  rx={4}
                  className={`transition-all duration-300 ${
                    isHovered
                      ? "fill-emerald-400 dark:fill-emerald-400"
                      : "fill-emerald-500 dark:fill-emerald-500/80"
                  }`}
                />

                {/* Barra Egreso */}
                <rect
                  x={xEgreso}
                  y={yEgreso}
                  width={barWidth}
                  height={hEgreso}
                  rx={4}
                  className={`transition-all duration-300 ${
                    isHovered
                      ? "fill-rose-400 dark:fill-rose-400"
                      : "fill-rose-500 dark:fill-rose-500/80"
                  }`}
                />

                {/* Etiqueta del Mes en el Eje X */}
                <text
                  x={centerX}
                  y={svgHeight - 12}
                  textAnchor="middle"
                  className={`text-[11px] font-semibold transition-colors ${
                    isHovered
                      ? "fill-cyan-600 dark:fill-cyan-400"
                      : "fill-slate-500 dark:fill-zinc-400"
                  }`}
                >
                  {m.label}
                </text>
              </g>
            );
          })}

          {/* Línea de Tendencia del Balance Neto */}
          <path
            d={monthlyData.reduce((pathStr, m, idx) => {
              const centerX = idx * slotWidth + slotWidth / 2;
              const clampedNeto = Math.max(m.neto, 0);
              const y = paddingTop + chartHeight - Math.max((clampedNeto / maxVal) * chartHeight, 0);
              return idx === 0 ? `M ${centerX} ${y}` : `${pathStr} L ${centerX} ${y}`;
            }, "")}
            fill="none"
            stroke="url(#netoGradient)"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-80"
          />

          {/* Puntos en la línea de tendencia */}
          {monthlyData.map((m, idx) => {
            const centerX = idx * slotWidth + slotWidth / 2;
            const clampedNeto = Math.max(m.neto, 0);
            const y = paddingTop + chartHeight - Math.max((clampedNeto / maxVal) * chartHeight, 0);
            const isHovered = hoveredIndex === idx;

            return (
              <circle
                key={`dot-${m.key}`}
                cx={centerX}
                cy={y}
                r={isHovered ? 5 : 3.5}
                className="fill-cyan-500 dark:fill-cyan-400 stroke-white dark:stroke-zinc-900 stroke-2 transition-all"
              />
            );
          })}

          {/* Definiciones de Gradiente */}
          <defs>
            <linearGradient id="netoGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* 4. Leyenda de Colores */}
      <div className="flex items-center justify-center gap-6 pt-1 text-xs text-slate-500 dark:text-zinc-400 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-emerald-500" />
          <span>Ingresos Facturados</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-md bg-rose-500" />
          <span>Gastos / Egresos</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1 rounded-full bg-cyan-500" />
          <span>Línea de Superávit Neto</span>
        </div>
      </div>
    </div>
  );
}
