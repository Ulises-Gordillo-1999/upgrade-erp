"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { formatFechaArgentina, formatHoraArgentina } from "@/utils/date";

interface Props {
  initialFecha?: string;
  initialHora?: string;
  className?: string;
  showSeconds?: boolean;
}

export function HeaderClock({
  initialFecha = "",
  initialHora = "",
  className = "",
  showSeconds = false,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const [fecha, setFecha] = useState(initialFecha);
  const [hora, setHora] = useState(initialHora);

  useEffect(() => {
    setMounted(true);

    const updateClock = () => {
      const now = new Date();
      setFecha(formatFechaArgentina(now, true, false)); // Ej: Sábado, 31 de octubre
      setHora(formatHoraArgentina(now, showSeconds)); // Ej: 23:22 o 23:22:15
    };

    updateClock();
    const interval = setInterval(updateClock, showSeconds ? 1000 : 10000);
    return () => clearInterval(interval);
  }, [showSeconds]);

  // Si no ha montado aún, muestra los valores iniciales del servidor sin parpadeo
  const displayFecha = mounted ? fecha : initialFecha;
  const displayHora = mounted ? hora : initialHora;

  return (
    <div className={`flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 font-medium ${className}`}>
      <span className="hidden sm:inline capitalize">{displayFecha}</span>
      {displayFecha && <span className="hidden sm:inline text-slate-300 dark:text-zinc-700">•</span>}
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700/60 font-mono text-[11px] text-cyan-700 dark:text-cyan-400">
        <Clock className="w-3 h-3 shrink-0" />
        <span>{displayHora ? `${displayHora} hs` : "--:-- hs"}</span>
      </div>
    </div>
  );
}
