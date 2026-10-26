"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Package,
  AlertTriangle,
  FolderGit2,
  Clock,
  Bot,
  CheckCircle2,
  ExternalLink,
  RotateCw,
  X,
  ShieldAlert,
} from "lucide-react";
import { ResumenNotificaciones, NotificacionItem } from "@/app/actions/notificaciones";

interface Props {
  initialNotificaciones?: ResumenNotificaciones;
}

export function NotificationCenter({ initialNotificaciones }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [filtro, setFiltro] = useState<"todas" | "inventario" | "proyectos">("todas");
  const [data, setData] = useState<ResumenNotificaciones>(
    initialNotificaciones || {
      total: 0,
      totalCriticas: 0,
      totalStock: 0,
      totalProyectos: 0,
      items: [],
    }
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (initialNotificaciones) {
      setData(initialNotificaciones);
    }
  }, [initialNotificaciones]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Cerrar con Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    router.refresh();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const filteredItems = data.items.filter((item) => {
    if (filtro === "inventario") return item.categoria === "inventario";
    if (filtro === "proyectos") return item.categoria === "proyectos";
    return true;
  });

  const getNotificationIcon = (tipo: NotificacionItem["tipo"]) => {
    switch (tipo) {
      case "stock_agotado":
        return (
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </div>
        );
      case "stock_critico":
        return (
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Package className="w-4 h-4" />
          </div>
        );
      case "proyecto_demorado":
        return (
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
            <Clock className="w-4 h-4" />
          </div>
        );
      case "borrador_bot":
        return (
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
            <Bot className="w-4 h-4" />
          </div>
        );
      case "presupuesto_pendiente":
      default:
        return (
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
            <FolderGit2 className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Botón Campana de Notificaciones */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl border transition-all ${
          isOpen
            ? "bg-slate-100 dark:bg-zinc-800 border-cyan-500/40 text-cyan-600 dark:text-cyan-400 shadow-sm"
            : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800/60 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white"
        }`}
        title="Centro de Alertas y Notificaciones"
        aria-label="Abrir centro de notificaciones"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:scale-105" />

        {/* Badge contador reactivo */}
        {data.total > 0 && (
          <span
            className={`absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-md ${
              data.totalCriticas > 0
                ? "bg-gradient-to-r from-rose-600 to-red-600 ring-2 ring-white dark:ring-zinc-950 animate-pulse"
                : "bg-gradient-to-r from-amber-500 to-orange-500 ring-2 ring-white dark:ring-zinc-950"
            }`}
          >
            {data.total > 99 ? "99+" : data.total}
          </span>
        )}
      </button>

      {/* Popover Desplegable */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/95 shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header del Popover */}
          <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/70 dark:bg-zinc-950/60">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white">
                Alertas del Sistema
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  data.total > 0
                    ? data.totalCriticas > 0
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                }`}
              >
                {data.total} {data.total === 1 ? "alerta" : "alertas"}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleRefresh}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Actualizar alertas"
              >
                <RotateCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-cyan-500" : ""}`}
                />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
                title="Cerrar panel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filtros por Categoría */}
          <div className="flex items-center gap-1 p-2 border-b border-slate-100 dark:border-zinc-800/60 bg-slate-50/40 dark:bg-zinc-950/30 text-xs">
            <button
              type="button"
              onClick={() => setFiltro("todas")}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                filtro === "todas"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              Todas ({data.total})
            </button>
            <button
              type="button"
              onClick={() => setFiltro("inventario")}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                filtro === "inventario"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              Stock ({data.totalStock})
            </button>
            <button
              type="button"
              onClick={() => setFiltro("proyectos")}
              className={`flex-1 py-1 px-2 rounded-lg font-medium transition-all ${
                filtro === "proyectos"
                  ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-semibold"
                  : "text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              Proyectos ({data.totalProyectos})
            </button>
          </div>

          {/* Lista de Notificaciones */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-zinc-800/60">
            {filteredItems.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  Todo bajo control
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 max-w-xs mx-auto">
                  No hay alertas de stock crítico ni proyectos demorados en este momento.
                </p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.enlace}
                  onClick={() => setIsOpen(false)}
                  className="p-3 sm:p-3.5 flex items-start gap-3 hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors group cursor-pointer block"
                >
                  {getNotificationIcon(item.tipo)}

                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="flex items-center justify-between gap-1.5">
                      <h4 className="text-xs font-semibold text-slate-900 dark:text-zinc-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                        {item.titulo}
                      </h4>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded shrink-0 ${
                          item.severidad === "alta"
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : item.severidad === "media"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {item.severidad}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                      {item.descripcion}
                    </p>

                    {item.detalle && (
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 pt-0.5 font-mono">
                        {item.detalle}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Footer del Popover */}
          <div className="p-2.5 bg-slate-50 dark:bg-zinc-950/70 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between text-[11px]">
            <Link
              href="/inventario"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium px-2 py-1 rounded"
            >
              <span>Inventario</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            <Link
              href="/proyectos"
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium px-2 py-1 rounded"
            >
              <span>Proyectos</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
