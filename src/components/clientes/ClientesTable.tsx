"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ClienteFormModal } from "./ClienteFormModal";
import { DeleteClienteButton } from "./DeleteClienteButton";
import { getWhatsAppLink } from "@/utils/whatsapp";
import {
  Search,
  X,
  RotateCcw,
  Building2,
  Phone,
  ReceiptText,
  MapPin,
  FilterX,
  FolderGit2,
  Copy,
  Check,
  Navigation,
  Users,
  Activity,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

interface ClienteItem {
  id: string;
  nombre_razon_social: string;
  telefono?: string | null;
  cuit_cuil?: string | null;
  condicion_iva?: string | null;
  direccion?: string | null;
  created_at?: string;
  total_proyectos?: number;
  proyectos_activos?: number;
}

interface Props {
  clientes: ClienteItem[];
}

function getInitials(name: string): string {
  if (!name) return "CL";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getConditionBadge(condicion?: string | null) {
  switch (condicion) {
    case "Responsable Inscripto":
      return {
        bg: "bg-blue-500/10 dark:bg-blue-500/15",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/25",
        avatar: "from-blue-600 to-cyan-600 text-white",
      };
    case "Monotributo":
      return {
        bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/25",
        avatar: "from-emerald-600 to-teal-600 text-white",
      };
    case "Consumidor Final":
      return {
        bg: "bg-purple-500/10 dark:bg-purple-500/15",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-500/25",
        avatar: "from-purple-600 to-indigo-600 text-white",
      };
    case "Exento":
      return {
        bg: "bg-amber-500/10 dark:bg-amber-500/15",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/25",
        avatar: "from-amber-600 to-orange-600 text-white",
      };
    default:
      return {
        bg: "bg-slate-500/10 dark:bg-zinc-800",
        text: "text-slate-600 dark:text-zinc-400",
        border: "border-slate-300/40 dark:border-zinc-700",
        avatar: "from-slate-600 to-zinc-700 text-white",
      };
  }
}

export function ClientesTable({ clientes }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRapido, setFiltroRapido] = useState<string>("todas");
  const [copiedCuitId, setCopiedCuitId] = useState<string | null>(null);

  // Estadísticas para tarjetas ejecutivas
  const stats = useMemo(() => {
    const total = clientes.length;
    const conObrasActivas = clientes.filter(
      (c) => (c.proyectos_activos || 0) > 0
    ).length;
    const conWhatsapp = clientes.filter(
      (c) => Boolean(c.telefono && c.telefono.trim().length >= 6)
    ).length;
    const conCuit = clientes.filter(
      (c) => Boolean(c.cuit_cuil && c.cuit_cuil.trim().length >= 5)
    ).length;

    return { total, conObrasActivas, conWhatsapp, conCuit };
  }, [clientes]);

  const hasActiveFilters = searchTerm !== "" || filtroRapido !== "todas";

  const resetFilters = () => {
    setSearchTerm("");
    setFiltroRapido("todas");
  };

  const handleCopyCuit = async (cuit: string, clienteId: string) => {
    try {
      await navigator.clipboard.writeText(cuit);
      setCopiedCuitId(clienteId);
      setTimeout(() => setCopiedCuitId(null), 2000);
    } catch (err) {
      console.error("Error al copiar CUIT:", err);
    }
  };

  const filteredClientes = useMemo(() => {
    return clientes.filter((c) => {
      // 1. Filtro texto de búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const nombre = (c.nombre_razon_social || "").toLowerCase();
        const cuit = (c.cuit_cuil || "").toLowerCase();
        const telefono = (c.telefono || "").toLowerCase();
        const direccion = (c.direccion || "").toLowerCase();

        const matches =
          nombre.includes(query) ||
          cuit.includes(query) ||
          telefono.includes(query) ||
          direccion.includes(query);

        if (!matches) return false;
      }

      // 2. Filtro rápido de tabs / pills
      if (filtroRapido === "activas") {
        if ((c.proyectos_activos || 0) <= 0) return false;
      } else if (filtroRapido === "sin_cuit") {
        if (c.cuit_cuil && c.cuit_cuil.trim() !== "") return false;
      } else if (filtroRapido !== "todas") {
        if (filtroRapido === "No definido") {
          if (c.condicion_iva && c.condicion_iva.trim() !== "") return false;
        } else if (c.condicion_iva !== filtroRapido) {
          return false;
        }
      }

      return true;
    });
  }, [clientes, searchTerm, filtroRapido]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Métricas Ejecutivas / Telemetría de Clientes (Mobile-First Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Total Clientes
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.total}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              registrados
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Obras en Curso
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.conObrasActivas}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              clientes activos
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              WhatsApp Activo
            </span>
            <div className="p-2 rounded-xl bg-green-500/10 text-green-600 dark:text-green-400">
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.conWhatsapp}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              con teléfono
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              CUIT / Fiscal
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <ReceiptText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.conCuit}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              dados de alta
            </span>
          </div>
        </div>
      </div>

      {/* 2. Barra de Búsqueda y Filtros Rápidos Táctiles */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 backdrop-blur-md shadow-sm space-y-3 transition-colors">
        {/* Input de Búsqueda */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, CUIT, teléfono o dirección..."
            className="w-full min-h-[46px] bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-10 py-2.5 text-base sm:text-xs text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-lg transition-colors"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Píldoras / Tabs de Filtros Rápidos Deslizables (Mobile Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          <button
            type="button"
            onClick={() => setFiltroRapido("todas")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "todas"
                ? "bg-cyan-600 text-white shadow-sm shadow-cyan-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Todos ({clientes.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("activas")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "activas"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            Obras Activas ({stats.conObrasActivas})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("Responsable Inscripto")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              filtroRapido === "Responsable Inscripto"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Resp. Inscripto
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("Monotributo")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              filtroRapido === "Monotributo"
                ? "bg-teal-600 text-white shadow-sm shadow-teal-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Monotributo
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("Consumidor Final")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              filtroRapido === "Consumidor Final"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Consumidor Final
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("Exento")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
              filtroRapido === "Exento"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Exento
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-bold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-all shrink-0 flex items-center gap-1"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </div>

        {/* Resumen de Resultados */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
          <span>
            Mostrando{" "}
            <strong className="text-slate-900 dark:text-zinc-100 font-bold">
              {filteredClientes.length}
            </strong>{" "}
            de {clientes.length} clientes
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
              Filtro aplicado
            </span>
          )}
        </div>
      </div>

      {/* 3. VISTA MÓVIL: Tarjetas Adaptativas Ergonómicas (< md) */}
      <div className="md:hidden space-y-3">
        {filteredClientes.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center text-slate-400 dark:text-zinc-500">
            <FilterX className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-zinc-600 stroke-1" />
            <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
              {hasActiveFilters
                ? "No se encontraron clientes con los filtros aplicados."
                : "No hay clientes registrados."}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          filteredClientes.map((cliente) => {
            const condBadge = getConditionBadge(cliente.condicion_iva);
            const initials = getInitials(cliente.nombre_razon_social);
            const tieneWhatsapp = Boolean(
              cliente.telefono && cliente.telefono.trim().length >= 6
            );
            const waUrl = tieneWhatsapp
              ? getWhatsAppLink(
                  cliente.telefono,
                  `¡Hola ${cliente.nombre_razon_social}! Te contacto desde UPGRADE Soporte IT y Redes.`
                )
              : "";
            const isCuitCopied = copiedCuitId === cliente.id;
            const tieneObrasActivas = (cliente.proyectos_activos || 0) > 0;
            const totalObras = cliente.total_proyectos || 0;

            return (
              <div
                key={cliente.id}
                className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/70 p-4 shadow-sm space-y-3.5 transition-all"
              >
                {/* Cabecera de la tarjeta: Avatar, Nombre y Acciones Rápidas */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Avatar con Iniciales y Gradiente según Condición */}
                    <div
                      className={`h-11 w-11 rounded-2xl bg-gradient-to-br ${condBadge.avatar} flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-sm`}
                    >
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 truncate leading-snug">
                        {cliente.nombre_razon_social}
                      </h4>

                      {/* Badges de Estado: Obras y Condición IVA */}
                      <div className="flex items-center gap-1.5 flex-wrap mt-1">
                        {tieneObrasActivas ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {cliente.proyectos_activos} obra(s) activa(s)
                          </span>
                        ) : totalObras > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700/60">
                            <FolderGit2 className="w-3 h-3" />
                            {totalObras} obra(s)
                          </span>
                        ) : null}

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${condBadge.bg} ${condBadge.text} ${condBadge.border}`}
                        >
                          {cliente.condicion_iva || "Sin condición"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de Edición / Borrado */}
                  <div className="flex items-center gap-1 shrink-0">
                    <ClienteFormModal
                      clienteInicial={cliente as any}
                      isEdit={true}
                    />
                    <DeleteClienteButton
                      id={cliente.id}
                      nombreCliente={cliente.nombre_razon_social}
                    />
                  </div>
                </div>

                {/* Datos Clave: CUIT con Copiado 1-Toque y Dirección GPS */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80 text-xs">
                  {/* CUIT / CUIL con botón copiar táctil */}
                  {cliente.cuit_cuil ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/60">
                      <div className="flex items-center gap-2 min-w-0">
                        <ReceiptText className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                        <span className="font-mono text-slate-700 dark:text-zinc-300 font-semibold truncate">
                          CUIT: {cliente.cuit_cuil}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopyCuit(cliente.cuit_cuil!, cliente.id)
                        }
                        className={`min-h-[36px] px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all ${
                          isCuitCopied
                            ? "bg-emerald-500 text-white"
                            : "bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:border-cyan-500 active:scale-95"
                        }`}
                        title="Copiar CUIT"
                      >
                        {isCuitCopied ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>¡Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 text-slate-400 dark:text-zinc-400" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : null}

                  {/* Dirección y enlace a Google Maps */}
                  {cliente.direccion ? (
                    <div className="flex items-center justify-between text-slate-600 dark:text-zinc-400 text-xs px-1">
                      <div className="flex items-start gap-1.5 min-w-0 flex-1">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400 dark:text-zinc-500 shrink-0" />
                        <span className="truncate">{cliente.direccion}</span>
                      </div>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          cliente.direccion
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-cyan-600 dark:text-cyan-400 font-semibold hover:underline flex items-center gap-0.5 shrink-0 ml-2"
                        title="Abrir en Google Maps"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Mapa</span>
                      </a>
                    </div>
                  ) : null}
                </div>

                {/* BOTONERA TÁCTIL INFERIOR (Ergonomía Mobile >= 44px) */}
                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                  {/* Botón WhatsApp 1-Toque */}
                  {tieneWhatsapp ? (
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 text-xs font-bold transition-all active:scale-[0.98]"
                    >
                      <svg
                        className="w-4 h-4 fill-current shrink-0"
                        viewBox="0 0 24 24"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <span className="min-h-[44px] flex items-center justify-center px-2 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-600 text-xs font-medium cursor-not-allowed text-center">
                      Sin WhatsApp
                    </span>
                  )}

                  {/* Botón Llamar 1-Toque */}
                  {cliente.telefono ? (
                    <a
                      href={`tel:${cliente.telefono}`}
                      className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all active:scale-[0.98]"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>Llamar</span>
                    </a>
                  ) : (
                    <span className="min-h-[44px] flex items-center justify-center px-2 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800/40 text-slate-400 dark:text-zinc-600 text-xs font-medium cursor-not-allowed text-center">
                      Sin Teléfono
                    </span>
                  )}

                  {/* Botón Ver Proyectos */}
                  <Link
                    href={`/proyectos?search=${encodeURIComponent(
                      cliente.nombre_razon_social
                    )}`}
                    className="min-h-[44px] flex items-center justify-center gap-1 px-2.5 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 text-xs font-bold transition-all active:scale-[0.98] border border-slate-200 dark:border-zinc-700"
                  >
                    <FolderGit2 className="w-3.5 h-3.5 shrink-0" />
                    <span>Obras ({totalObras})</span>
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 4. VISTA DESKTOP & TABLET: Tabla Completa y Densidad Ejecutiva (>= md) */}
      <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase bg-slate-50/90 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 font-semibold">
              <tr>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Contacto Directo</th>
                <th className="px-6 py-4">Condición Fiscal</th>
                <th className="px-6 py-4">Obras Vinculadas</th>
                <th className="px-6 py-4">Dirección</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {filteredClientes.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-14 text-center text-slate-400 dark:text-zinc-500"
                  >
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FilterX className="w-8 h-8 text-slate-300 dark:text-zinc-600 stroke-1" />
                      <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                        {hasActiveFilters
                          ? "No se encontraron clientes con los filtros aplicados."
                          : "No hay clientes registrados."}
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-4 font-semibold"
                        >
                          Limpiar filtros de búsqueda
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredClientes.map((cliente) => {
                  const condBadge = getConditionBadge(cliente.condicion_iva);
                  const initials = getInitials(cliente.nombre_razon_social);
                  const tieneWhatsapp = Boolean(
                    cliente.telefono && cliente.telefono.trim().length >= 6
                  );
                  const waUrl = tieneWhatsapp
                    ? getWhatsAppLink(
                        cliente.telefono,
                        `¡Hola ${cliente.nombre_razon_social}! Te contacto desde UPGRADE Soporte IT y Redes.`
                      )
                    : "";
                  const isCuitCopied = copiedCuitId === cliente.id;
                  const tieneObrasActivas = (cliente.proyectos_activos || 0) > 0;
                  const totalObras = cliente.total_proyectos || 0;

                  return (
                    <tr
                      key={cliente.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Cliente y Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-xl bg-gradient-to-br ${condBadge.avatar} flex items-center justify-center font-bold text-xs tracking-wider shrink-0 shadow-sm`}
                          >
                            {initials}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                              {cliente.nombre_razon_social}
                            </span>
                            <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                              ID: {cliente.id.substring(0, 8)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contacto Directo: Teléfono y WhatsApp */}
                      <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                        {cliente.telefono ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-800 dark:text-zinc-200 font-medium">
                              {cliente.telefono}
                            </span>
                            {tieneWhatsapp && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                                title="Abrir chat en WhatsApp"
                              >
                                <svg
                                  className="w-3.5 h-3.5 fill-current"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-zinc-600">
                            -
                          </span>
                        )}
                      </td>

                      {/* Condición Fiscal y CUIT con copiado */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${condBadge.bg} ${condBadge.text} ${condBadge.border}`}
                          >
                            {cliente.condicion_iva || "No definido"}
                          </span>
                          {cliente.cuit_cuil && (
                            <button
                              type="button"
                              onClick={() =>
                                handleCopyCuit(cliente.cuit_cuil!, cliente.id)
                              }
                              className="inline-flex items-center gap-1 font-mono text-xs text-slate-500 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
                              title="Clic para copiar CUIT"
                            >
                              <span>CUIT: {cliente.cuit_cuil}</span>
                              {isCuitCopied ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3 opacity-60 hover:opacity-100" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Obras Vinculadas */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/proyectos?search=${encodeURIComponent(
                              cliente.nombre_razon_social
                            )}`}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800/80 hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-zinc-700/70 transition-all"
                            title="Ver proyectos de este cliente"
                          >
                            <FolderGit2 className="w-3.5 h-3.5" />
                            <span>{totalObras} obra(s)</span>
                          </Link>
                          {tieneObrasActivas && (
                            <span
                              className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"
                              title={`${cliente.proyectos_activos} obra(s) en curso`}
                            />
                          )}
                        </div>
                      </td>

                      {/* Dirección */}
                      <td className="px-6 py-4 text-slate-600 dark:text-zinc-400">
                        {cliente.direccion ? (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 opacity-60 shrink-0" />
                            <span className="truncate max-w-[180px] text-xs">
                              {cliente.direccion}
                            </span>
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                cliente.direccion
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-cyan-600 dark:text-cyan-400 hover:opacity-80 p-0.5 rounded transition-opacity"
                              title="Ver en Google Maps"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-zinc-600">
                            -
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end items-center gap-1">
                          <ClienteFormModal
                            clienteInicial={cliente as any}
                            isEdit={true}
                          />
                          <DeleteClienteButton
                            id={cliente.id}
                            nombreCliente={cliente.nombre_razon_social}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
