"use client";

import { useState, useEffect } from "react";
import { Clock } from "lucide-react";
import { formatHoraArgentina } from "@/utils/date";

export function TelemetryClock({ initialHora = "" }: { initialHora?: string }) {
  const [mounted, setMounted] = useState(false);
  const [hora, setHora] = useState(initialHora);

  useEffect(() => {
    setMounted(true);
    const update = () => {
      setHora(formatHoraArgentina(new Date(), true)); // Formato con segundos: 23:22:45
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const display = mounted ? hora : initialHora;

  return (
    <span className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-400">
      <Clock className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
      <span>
        HORA LOCAL:{" "}
        <strong className="text-cyan-700 dark:text-cyan-300 font-mono font-bold">
          {display ? `${display} ART` : "--:--:-- ART"}
        </strong>
      </span>
    </span>
  );
}
