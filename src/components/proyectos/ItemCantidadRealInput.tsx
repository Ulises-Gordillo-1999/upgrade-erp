"use client";

import { useState } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
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
  const delta = !isNaN(numVal) ? numVal - cantidadEstimada : 0;

  async function handleSave() {
    if (val === "" || isNaN(numVal)) return;
    setLoading(true);
    setSaved(false);

    try {
      await updateItemCantidadReal(itemId, proyectoId, numVal);
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

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1.5">
        <input
          type="number"
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
          className={`w-20 bg-zinc-950 border rounded-lg px-2.5 py-1 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none transition-all ${
            esConsumible && cantidadRealInicial === null
              ? "border-amber-500/50 focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              : "border-zinc-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
          } ${isProyectoFinalizado ? "opacity-60 cursor-not-allowed" : ""}`}
        />

        {!isProyectoFinalizado && (
          <button
            type="button"
            onClick={handleSave}
            disabled={loading || val === ""}
            title="Guardar cantidad real"
            className={`p-1 rounded-md text-xs transition-colors border ${
              saved
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border-zinc-700 disabled:opacity-30"
            }`}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Badges de ayuda contextual */}
      {cantidadRealInicial === null && esConsumible ? (
        <span className="text-[10px] text-amber-400 flex items-center gap-0.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          Medición pendiente
        </span>
      ) : cantidadRealInicial !== null && delta !== 0 ? (
        <span
          className={`text-[10px] font-medium ${
            delta > 0 ? "text-emerald-400" : "text-rose-400"
          }`}
        >
          {delta > 0 ? "+" : ""}
          {delta.toFixed(1)} u/m vs est.
        </span>
      ) : null}
    </div>
  );
}
