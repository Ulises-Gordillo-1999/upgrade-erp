"use client";

import { useState, useEffect } from "react";
import { Check, Loader2, Plus, Minus } from "lucide-react";
import { updateItemCantidadEstimada } from "@/app/actions/proyectos";
import { useRouter } from "next/navigation";

interface Props {
  itemId: string;
  proyectoId: string;
  cantidadEstimadaInicial: number;
  tipoItem?: string;
  isEditable: boolean;
}

export function ItemCantidadEstimadaInput({
  itemId,
  proyectoId,
  cantidadEstimadaInicial,
  tipoItem,
  isEditable,
}: Props) {
  const router = useRouter();
  const [val, setVal] = useState<string>(cantidadEstimadaInicial.toString());
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setVal(cantidadEstimadaInicial.toString());
  }, [cantidadEstimadaInicial]);

  const esConsumible = tipoItem === "Consumible";
  const numVal = parseFloat(val);
  const currentNumeric = !isNaN(numVal) ? numVal : cantidadEstimadaInicial;
  const isDirty = !isNaN(numVal) && numVal !== cantidadEstimadaInicial;

  if (!isEditable) {
    return (
      <span
        className="font-mono text-xs font-semibold text-slate-600 dark:text-zinc-400"
        title="Cantidad estimada congelada tras aprobación del presupuesto"
      >
        {cantidadEstimadaInicial} {esConsumible ? "m" : "u"}
      </span>
    );
  }

  async function handleSave(valueToSave?: number) {
    const finalVal = valueToSave !== undefined ? valueToSave : numVal;
    if (isNaN(finalVal) || finalVal <= 0) return;
    setLoading(true);
    setSaved(false);

    try {
      await updateItemCantidadEstimada(itemId, proyectoId, finalVal);
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      console.error(error);
      alert("Error al actualizar la cantidad estimada");
    } finally {
      setLoading(false);
    }
  }

  const handleStep = (stepDelta: number) => {
    if (loading) return;
    const min = esConsumible ? 0.5 : 1;
    const base = isNaN(numVal) ? cantidadEstimadaInicial : numVal;
    const newVal = Math.max(min, Math.round((base + stepDelta) * 10) / 10);
    setVal(newVal.toString());
    handleSave(newVal);
  };

  return (
    <div className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => handleStep(esConsumible ? -5 : -1)}
        disabled={loading || currentNumeric <= (esConsumible ? 0.5 : 1)}
        className="min-h-[34px] min-w-[30px] flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-30 border border-slate-200 dark:border-zinc-700 transition-colors active:scale-95 text-xs font-bold cursor-pointer"
        title={esConsumible ? "Restar 5m al estimado" : "Restar 1 al estimado"}
      >
        <Minus className="w-3 h-3" />
      </button>

      <div className="relative flex items-center">
        <input
          type="number"
          inputMode="decimal"
          step={esConsumible ? "0.5" : "1"}
          min={esConsumible ? "0.1" : "1"}
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSave();
            }
          }}
          onBlur={() => {
            if (isDirty) {
              handleSave();
            }
          }}
          disabled={loading}
          className={`w-16 sm:w-20 min-h-[34px] text-center bg-slate-50 dark:bg-zinc-950 border rounded-lg px-1.5 py-1 text-base sm:text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 focus:outline-none transition-all ${
            saved
              ? "border-emerald-500 ring-1 ring-emerald-500/40"
              : isDirty
              ? "border-amber-500 ring-1 ring-amber-500/40"
              : "border-slate-300 dark:border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          }`}
          title="Cantidad estimada del presupuesto"
        />
        {loading && (
          <Loader2 className="w-3 h-3 animate-spin text-cyan-500 absolute right-1.5 pointer-events-none" />
        )}
      </div>

      <button
        type="button"
        onClick={() => handleStep(esConsumible ? 5 : 1)}
        disabled={loading}
        className="min-h-[34px] min-w-[30px] flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 disabled:opacity-30 border border-slate-200 dark:border-zinc-700 transition-colors active:scale-95 text-xs font-bold cursor-pointer"
        title={esConsumible ? "Sumar 5m al estimado" : "Sumar 1 al estimado"}
      >
        <Plus className="w-3 h-3" />
      </button>

      {isDirty && !loading && (
        <button
          type="button"
          onClick={() => handleSave()}
          title="Guardar cantidad estimada"
          className="min-h-[34px] min-w-[30px] flex items-center justify-center p-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500 transition-all active:scale-95 shadow-sm cursor-pointer"
        >
          <Check className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
