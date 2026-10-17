"use client";

import { useTheme, Theme } from "./ThemeProvider";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-9 w-full rounded-xl bg-zinc-900/50 dark:bg-zinc-900/50 animate-pulse" />
    );
  }

  const options: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Claro", icon: Sun },
    { value: "dark", label: "Oscuro", icon: Moon },
    { value: "system", label: "Sistema", icon: Monitor },
  ];

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-zinc-800/80 transition-colors">
      <div className="flex items-center justify-between px-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
        <span>Tema</span>
        <span className="capitalize text-zinc-700 dark:text-zinc-300 font-semibold text-[10px]">
          {theme === "system" ? "Automático" : theme}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-1 p-0.5 rounded-lg bg-zinc-200/70 dark:bg-zinc-950/70">
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTheme(opt.value)}
              className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                isActive
                  ? "bg-white dark:bg-zinc-850 text-cyan-600 dark:text-cyan-400 shadow-sm border border-zinc-200/80 dark:border-zinc-700 font-semibold"
                  : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              }`}
              title={`Modo ${opt.label}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="text-[10px] hidden sm:inline">{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
