"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { registrarRevelacionBoveda } from "@/app/actions/boveda";

interface MaskedValueProps {
  value: string;
  recordId?: string;
  descripcion?: string;
  tipoDato?: string;
}

export function MaskedValue({ value, recordId, descripcion, tipoDato }: MaskedValueProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      if (recordId) {
        registrarRevelacionBoveda(
          recordId,
          descripcion || "Credencial (Copiada)",
          tipoDato || "Dato Sensible"
        ).catch(() => {});
      }
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Error al copiar al portapapeles:", err);
    }
  };

  return (
    <div className="flex items-center gap-1.5 w-full sm:w-auto">
      <div className="font-mono text-sm tracking-wider text-cyan-600 dark:text-cyan-400 bg-slate-100 dark:bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 flex-1 sm:w-48 sm:max-w-[200px] truncate select-all">
        {isVisible ? value : "••••••••••••••••"}
      </div>
      <button
        type="button"
        onClick={handleToggle}
        className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center p-2 text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors active:scale-95 shrink-0"
        title={isVisible ? "Ocultar" : "Mostrar"}
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      <button
        type="button"
        onClick={handleCopy}
        className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center p-2 text-slate-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg transition-colors active:scale-95 shrink-0"
        title={copied ? "¡Copiado!" : "Copiar credencial"}
      >
        {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
      </button>
    </div>
  );
}
