"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { registrarRevelacionBoveda } from "@/app/actions/boveda";

interface MaskedValueProps {
  value: string;
  recordId?: string;
  descripcion?: string;
  tipoDato?: string;
}

export function MaskedValue({ value, recordId, descripcion, tipoDato }: MaskedValueProps) {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggle = () => {
    const nextState = !isVisible;
    setIsVisible(nextState);

    if (nextState && recordId) {
      registrarRevelacionBoveda(
        recordId,
        descripcion || "Credencial",
        tipoDato || "Dato Sensible"
      ).catch(() => {});
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="font-mono text-sm tracking-wider text-cyan-600 dark:text-cyan-400 bg-slate-100 dark:bg-zinc-950 px-2 py-1 rounded border border-slate-200 dark:border-zinc-800 w-full max-w-[200px] truncate">
        {isVisible ? value : "••••••••••••••••"}
      </div>
      <button
        onClick={handleToggle}
        className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
        title={isVisible ? "Ocultar" : "Mostrar"}
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
