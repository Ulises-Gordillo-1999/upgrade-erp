"use client";

import { useState, useEffect } from "react";
import { Eye, EyeOff, Copy, Check, ShieldCheck } from "lucide-react";
import { registrarRevelacionBoveda } from "@/app/actions/boveda";

interface MaskedValueProps {
  value: string;
  recordId?: string;
  descripcion?: string;
  tipoDato?: string;
}

export function MaskedValue({
  value,
  recordId,
  descripcion,
  tipoDato,
}: MaskedValueProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-ocultamiento de seguridad tras 30 segundos (Mobile Field Security)
  useEffect(() => {
    if (!isVisible) return;
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 30000);
    return () => clearTimeout(timer);
  }, [isVisible]);

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
      {/* Contenedor de la clave encriptada/revelada */}
      <div className="font-mono text-xs sm:text-sm tracking-wider text-cyan-700 dark:text-cyan-400 bg-slate-100 dark:bg-zinc-950 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 flex-1 sm:w-48 sm:max-w-[220px] truncate select-all">
        {isVisible ? value : "••••••••••••••••"}
      </div>

      {/* Botón Revelar / Ocultar (Touch Target >= 40px) */}
      <button
        type="button"
        onClick={handleToggle}
        className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center p-2 rounded-xl transition-all active:scale-95 shrink-0 border ${
          isVisible
            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25"
            : "bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-zinc-700/60"
        }`}
        title={isVisible ? "Ocultar credencial (se auto-oculta en 30s)" : "Revelar credencial"}
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>

      {/* Botón Copiar al Portapapeles (Touch Target >= 40px) */}
      <button
        type="button"
        onClick={handleCopy}
        className={`min-h-[40px] min-w-[40px] inline-flex items-center justify-center p-2 rounded-xl transition-all active:scale-95 shrink-0 border ${
          copied
            ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
            : "bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 border-slate-200 dark:border-zinc-700/60"
        }`}
        title={copied ? "¡Copiado al portapapeles!" : "Copiar credencial"}
      >
        {copied ? (
          <Check className="w-4 h-4 text-emerald-500 animate-in zoom-in-50 duration-150" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
    </div>
  );
}
