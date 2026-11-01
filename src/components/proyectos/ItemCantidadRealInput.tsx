"use client";

import { useState } from "react";
import { Check, Loader2, AlertCircle, Plus, Minus } from "lucide-react";
import { updateItemCantidadReal } from "@/app/actions/proyectos";
import { useRouter } from "next/navigation";

interface Props {
  itemId: string;
  proyectoId: string;
  cantidadEstimada: number;
  cantidadRealInicial: number | null;
  tipoItem?: string;
  isProyectoFinalizado: boolean;
}

export function ItemCantidadRealInput({
  itemId,
  proyectoId,
  cantidadEstimada,
  cantidadRealInicial,
  tipoItem,
  isProyectoFinalizado,
}: Props) {
  const router = useRouter();
  const [val, setVal] = useState<string>(
    cantidadRealInicial !== null && cantidadRealInicial !== undefined
      ? cantidadRealInicial.toString()
      : ""
  );
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const esConsumible = tipoItem === "Consumible";
  const numVal = parseFloat(val);
  const currentNumeric = !isNaN(numVal) ? numVal : cantidadEstimada;
  const delta = !isNaN(numVal) ? numVal - cantidadEstimada : 0;

  async function handleSave(valueToSave?: number) {
    const finalVal = valueToSave !== undefined ? valueToSave : numVal;
    if (isNaN(finalVal) || finalVal < 0) return;
    setLoading(true);
    setSaved(false);

    try {
      await updateItemCantidadReal(itemId, proyectoId, finalVal);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la cantidad real");
    } finally {
      setLoading(false);
    }
  }

  const handleStep = (stepDelta: number) => {
    if (isProyectoFinalizado || loading) return;
    const base = val === "" || isNaN(numVal) ? cantidadEstimada : numVal;
    const newVal = Math.max(0, Math.round((base + stepDelta) * 10) / 10);
    setVal(newVal.toString());
    handleSave(newVal);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Input numérico principal con soporte táctil */}
        <div className="flex items-center gap-1">
          {!isProyectoFinalizado && (
            <button
              type="button"
              onClick={() => handleStep(esConsumible ? -5 : -1)}
              disabled={loading || currentNumeric <= 0}
              className="min-h-[38px] min-w-[34px] flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-30 border border-slate-200 dark:border-zinc-700 transition-colors active:scale-95 text-xs font-bold"
              title={esConsumible ? "Restar 5m" : "Restar 1"}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          )}

          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={val}
            placeholder={cantidadEstimada.toString()}
            onChange={(e) => setVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSave();
              }
            }}
            disabled={loading || isProyectoFinalizado}
            className={`w-20 sm:w-24 min-h-[38px] text-center bg-slate-50 dark:bg-zinc-950 border rounded-lg px-2 py-1 text-base sm:text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none transition-all ${
              esConsumible && cantidadRealInicial === null
                ? "border-amber-500/50 focus:border-amber-500 dark:focus:border-amber-400 focus:ring-1 focus:ring-amber-500"
                : "border-slate-300 dark:border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            } ${isProyectoFinalizado ? "opacity-60 cursor-not-allowed" : ""}`}
          />

          {!isProyectoFinalizado && (
            <button
              type="button"
              onClick={() => handleStep(esConsumible ? 5 : 1)}
              disabled={loading}
              className="min-h-[38px] min-w-[34px] flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-30 border border-slate-200 dark:border-zinc-700 transition-colors active:scale-95 text-xs font-bold"
              title={esConsumible ? "Sumar 5m" : "Sumar 1"}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Botón Guardar / Confirmar */}
        {!isProyectoFinalizado && (
          <button
            type="button"
            onClick={() => handleSave()}
            disabled={loading || val === ""}
            title="Guardar medición real"
            className={`min-h-[38px] min-w-[38px] flex items-center justify-center p-1.5 rounded-lg text-xs transition-all border ${
              saved
                ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                : "bg-cyan-600 hover:bg-cyan-500 text-white border-cyan-500 disabled:opacity-30 active:scale-95 shadow-sm"
            }`}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4" />
            ) : (
              <Check className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Badges de ayuda contextual y cálculo de variación */}
      {cantidadRealInicial === null && esConsumible ? (
        <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
          <AlertCircle className="w-3 h-3 shrink-0" />
          Medición pendiente en obra
        </span>
      ) : cantidadRealInicial !== null && delta !== 0 ? (
        <span
          className={`text-[10px] font-bold inline-flex items-center gap-1 ${
            delta > 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-rose-600 dark:text-rose-400"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)} {esConsumible ? "m" : "u."} vs presupuestado
        </span>
      ) : null}
    </div>
  );
}
