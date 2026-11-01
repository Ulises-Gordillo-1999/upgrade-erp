"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MaskedValue } from "./MaskedValue";
import { BovedaImageModal } from "./BovedaImageModal";
import { getWhatsAppLink } from "@/utils/whatsapp";
import {
  Search,
  X,
  RotateCcw,
  ShieldAlert,
  FolderGit2,
  Calendar,
  Key,
  Network,
  MonitorSmartphone,
  Router,
  FilterX,
  SlidersHorizontal,
  Building2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Paperclip,
  Phone,
  Table as TableIcon,
  Users,
} from "lucide-react";
import { TipoCredencialBoveda } from "@/types/database";

interface BovedaItem {
  id: string;
  proyecto_id?: string | null;
  tipo_dato: string;
  descripcion: string;
  valor_encriptado?: string | null;
  valor_desencriptado?: string | null;
  archivo_url?: string | null;
  created_at?: string;
  proyecto?: {
    id: string;
    notas_tecnicas?: string | null;
    estado?: string | null;
    created_at?: string;
    cliente?: {
      id?: string;
      nombre_razon_social?: string;
      telefono?: string;
      cuit_cuil?: string;
    } | null;
  } | null;
  proyectos?: {
    id?: string;
    notas_tecnicas?: string | null;
    clientes?: {
      id?: string;
      nombre_razon_social?: string;
    } | null;
  } | null;
}

interface Props {
  bovedaItems: BovedaItem[];
  tiposCredencial?: TipoCredencialBoveda[];
}

const getTipoDatoIcon = (tipo: string) => {
  const t = (tipo || "").toLowerCase();
  if (
    t.includes("pass") ||
    t.includes("clave") ||
    t.includes("token") ||
    t.includes("contraseña")
  ) {
    return <Key className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
  }
  if (
    t.includes("ip") ||
    t.includes("subred") ||
    t.includes("red") ||
    t.includes("vlan") ||
    t.includes("vpn")
  ) {
    return <Network className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
  }
  if (
    t.includes("anydesk") ||
    t.includes("rustdesk") ||
    t.includes("teamviewer") ||
    t.includes("remoto") ||
    t.includes("vnc")
  ) {
    return (
      <MonitorSmartphone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
    );
  }
  if (
    t.includes("router") ||
    t.includes("switch") ||
    t.includes("mikrotik") ||
    t.includes("firewall") ||
    t.includes("ap")
  ) {
    return <Router className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
  }
  return <ShieldAlert className="w-4 h-4 text-slate-400 dark:text-zinc-400" />;
};

const getEstadoBadge = (estado?: string | null) => {
  if (!estado) return null;
  switch (estado) {
    case "Finalizado":
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          Finalizado
        </span>
      );
    case "En_Ejecucion":
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
          En Ejecución
        </span>
      );
    case "Aprobado":
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
          Aprobado
        </span>
      );
    default:
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
          {estado.replace(/_/g, " ")}
        </span>
      );
  }
};

export function BovedaTable({ bovedaItems, tiposCredencial }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroRapido, setFiltroRapido] = useState<string>("todos");
  const [clienteFiltro, setClienteFiltro] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"cliente" | "tabla">("cliente");

  // Estado de colapso de clientes
  const [collapsedClients, setCollapsedClients] = useState<Record<string, boolean>>({});

  const toggleClientCollapse = (clienteKey: string) => {
    setCollapsedClients((prev) => ({
      ...prev,
      [clienteKey]: !prev[clienteKey],
    }));
  };

  // Clientes únicos para el dropdown
  const clientesDisponibles = useMemo(() => {
    const setClis = new Set<string>();
    bovedaItems.forEach((item) => {
      const nombre =
        item.proyecto?.cliente?.nombre_razon_social ||
        item.proyectos?.clientes?.nombre_razon_social;
      if (nombre && nombre.trim() !== "") {
        setClis.add(nombre.trim());
      }
    });
    return Array.from(setClis).sort();
  }, [bovedaItems]);

  // Telemetría para métricas ejecutivas
  const stats = useMemo(() => {
    const total = bovedaItems.length;
    const clientesCount = clientesDisponibles.length;
    const passwords = bovedaItems.filter((i) => {
      const t = (i.tipo_dato || "").toLowerCase();
      return (
        t.includes("pass") ||
        t.includes("clave") ||
        t.includes("token") ||
        t.includes("contraseña")
      );
    }).length;
    const conAdjunto = bovedaItems.filter(
      (i) => Boolean(i.archivo_url && i.archivo_url.trim() !== "")
    ).length;

    return { total, clientesCount, passwords, conAdjunto };
  }, [bovedaItems, clientesDisponibles]);

  const hasActiveFilters =
    searchTerm !== "" || filtroRapido !== "todos" || clienteFiltro !== "todos";

  const resetFilters = () => {
    setSearchTerm("");
    setFiltroRapido("todos");
    setClienteFiltro("todos");
  };

  // Filtrado de ítems
  const filteredItems = useMemo(() => {
    return bovedaItems.filter((item) => {
      const clienteNombre =
        item.proyecto?.cliente?.nombre_razon_social ||
        item.proyectos?.clientes?.nombre_razon_social ||
        "";

      // 1. Filtro Cliente
      if (clienteFiltro !== "todos" && clienteNombre !== clienteFiltro) {
        return false;
      }

      // 2. Filtro texto de búsqueda
      if (searchTerm.trim() !== "") {
        const query = searchTerm.toLowerCase().trim();
        const cliente = clienteNombre.toLowerCase();
        const desc = (item.descripcion || "").toLowerCase();
        const id = (item.proyecto_id || "").toLowerCase();
        const notas = (item.proyecto?.notas_tecnicas || "").toLowerCase();

        const matches =
          cliente.includes(query) ||
          desc.includes(query) ||
          id.includes(query) ||
          notas.includes(query);

        if (!matches) return false;
      }

      // 3. Filtro rápido de pills
      if (filtroRapido === "passwords") {
        const t = (item.tipo_dato || "").toLowerCase();
        if (
          !t.includes("pass") &&
          !t.includes("clave") &&
          !t.includes("token") &&
          !t.includes("contraseña")
        )
          return false;
      } else if (filtroRapido === "redes") {
        const t = (item.tipo_dato || "").toLowerCase();
        if (
          !t.includes("ip") &&
          !t.includes("subred") &&
          !t.includes("red") &&
          !t.includes("vlan") &&
          !t.includes("vpn")
        )
          return false;
      } else if (filtroRapido === "remoto") {
        const t = (item.tipo_dato || "").toLowerCase();
        if (
          !t.includes("anydesk") &&
          !t.includes("rustdesk") &&
          !t.includes("teamviewer") &&
          !t.includes("remoto")
        )
          return false;
      } else if (filtroRapido === "routers") {
        const t = (item.tipo_dato || "").toLowerCase();
        if (
          !t.includes("router") &&
          !t.includes("switch") &&
          !t.includes("mikrotik")
        )
          return false;
      } else if (filtroRapido === "con_adjunto") {
        if (!item.archivo_url || item.archivo_url.trim() === "") return false;
      }

      return true;
    });
  }, [bovedaItems, searchTerm, filtroRapido, clienteFiltro]);

  // Agrupación estructurada: Cliente -> Proyectos -> Credenciales
  const groupedByClient = useMemo(() => {
    const map = new Map<
      string,
      {
        clienteNombre: string;
        telefono?: string;
        cuit?: string;
        proyectosMap: Map<
          string,
          {
            proyectoId: string;
            notasTecnicas?: string;
            estado?: string;
            items: BovedaItem[];
          }
        >;
        totalItems: number;
      }
    >();

    filteredItems.forEach((item) => {
      const clienteNombre =
        item.proyecto?.cliente?.nombre_razon_social ||
        item.proyectos?.clientes?.nombre_razon_social ||
        "Cliente General / Desconocido";

      const telefono = item.proyecto?.cliente?.telefono;
      const cuit = item.proyecto?.cliente?.cuit_cuil;
      const proyectoId = item.proyecto_id || "sin_proyecto";
      const notasTecnicas =
        item.proyecto?.notas_tecnicas || item.proyectos?.notas_tecnicas || undefined;
      const estado = item.proyecto?.estado || undefined;

      if (!map.has(clienteNombre)) {
        map.set(clienteNombre, {
          clienteNombre,
          telefono,
          cuit,
          proyectosMap: new Map(),
          totalItems: 0,
        });
      }

      const clientEntry = map.get(clienteNombre)!;
      clientEntry.totalItems++;

      if (!clientEntry.proyectosMap.has(proyectoId)) {
        clientEntry.proyectosMap.set(proyectoId, {
          proyectoId,
          notasTecnicas,
          estado,
          items: [],
        });
      }

      clientEntry.proyectosMap.get(proyectoId)!.items.push(item);
    });

    return Array.from(map.values()).sort((a, b) =>
      a.clienteNombre.localeCompare(b.clienteNombre)
    );
  }, [filteredItems]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. MÉTRICAS EJECUTIVAS / TELEMETRÍA CRIPTOGRÁFICA (Mobile-First Grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Total Encriptadas
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.total}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              claves AES-256
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Clientes Custodiados
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {stats.clientesCount}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              con credenciales
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Contraseñas & Tokens
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Key className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {stats.passwords}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              claves de acceso
            </span>
          </div>
        </div>

        <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-zinc-400">
              Esquemas & Adjuntos
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <Paperclip className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {stats.conAdjunto}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 dark:text-zinc-500">
              planos / QR
            </span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE BÚSQUEDA Y FILTROS RÁPIDOS */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm backdrop-blur-md space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5 sm:gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, proyecto o descripción de credencial..."
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

          {/* Selector de Cliente y Switch de Vista */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              className="w-full sm:w-auto min-h-[46px] bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-base sm:text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer max-w-full sm:max-w-[190px] truncate [color-scheme:light] dark:[color-scheme:dark]"
            >
              <option value="todos">Todos los Clientes</option>
              {clientesDisponibles.map((cli) => (
                <option key={cli} value={cli}>
                  {cli}
                </option>
              ))}
            </select>

            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 min-h-[46px]">
              <button
                type="button"
                onClick={() => setViewMode("cliente")}
                className={`min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "cliente"
                    ? "bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400"
                }`}
                title="Agrupar credenciales por cliente"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Por Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("tabla")}
                className={`min-h-[38px] flex items-center justify-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "tabla"
                    ? "bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-sm"
                    : "text-slate-600 dark:text-zinc-400"
                }`}
                title="Ver lista plana cronológica"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Lista Plana</span>
              </button>
            </div>
          </div>
        </div>

        {/* Píldoras / Tabs Deslizables Horizontales (Mobile Carousel) */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          <button
            type="button"
            onClick={() => setFiltroRapido("todos")}
            className={`min-h-[38px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "todos"
                ? "bg-cyan-600 text-white shadow-sm shadow-cyan-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            Todas ({bovedaItems.length})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("passwords")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "passwords"
                ? "bg-amber-600 text-white shadow-sm shadow-amber-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Contraseñas ({stats.passwords})
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("redes")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "redes"
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            IPs & Redes
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("remoto")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "remoto"
                ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <MonitorSmartphone className="w-3.5 h-3.5" />
            AnyDesk / Remoto
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("routers")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "routers"
                ? "bg-cyan-700 text-white shadow-sm shadow-cyan-700/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <Router className="w-3.5 h-3.5" />
            Routers / Switches
          </button>

          <button
            type="button"
            onClick={() => setFiltroRapido("con_adjunto")}
            className={`min-h-[38px] px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 flex items-center gap-1.5 ${
              filtroRapido === "con_adjunto"
                ? "bg-purple-600 text-white shadow-sm shadow-purple-600/30"
                : "bg-slate-100 dark:bg-zinc-800/80 hover:bg-slate-200 dark:hover:bg-zinc-700/80 text-slate-600 dark:text-zinc-300"
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            Con Adjunto ({stats.conAdjunto})
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
              {filteredItems.length}
            </strong>{" "}
            credenciales de{" "}
            <strong className="text-slate-900 dark:text-zinc-100 font-bold">
              {groupedByClient.length}
            </strong>{" "}
            clientes
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
              Filtro activo
            </span>
          )}
        </div>
      </div>

      {/* VISTA 1: AGRUPADO POR CLIENTE (Por Defecto) */}
      {viewMode === "cliente" && (
        <div className="space-y-4">
          {groupedByClient.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 sm:p-10 text-center text-slate-400 dark:text-zinc-500">
              <FilterX className="w-10 h-10 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
              <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                {hasActiveFilters
                  ? "No se encontraron credenciales con los filtros aplicados."
                  : "No hay registros en la bóveda de seguridad."}
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
            groupedByClient.map((clientGroup) => {
              const isCollapsed = Boolean(
                collapsedClients[clientGroup.clienteNombre]
              );
              const proyectosArray = Array.from(
                clientGroup.proyectosMap.values()
              );
              const tieneWhatsapp = Boolean(
                clientGroup.telefono && clientGroup.telefono.trim().length >= 6
              );
              const waUrl = tieneWhatsapp
                ? getWhatsAppLink(
                    clientGroup.telefono,
                    `¡Hola ${clientGroup.clienteNombre}! Te contacto desde UPGRADE Soporte IT y Redes.`
                  )
                : "";

              return (
                <div
                  key={clientGroup.clienteNombre}
                  className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/70 shadow-sm overflow-hidden transition-all"
                >
                  {/* Encabezado del Cliente con Touch Target Ergonómico */}
                  <div
                    onClick={() =>
                      toggleClientCollapse(clientGroup.clienteNombre)
                    }
                    className="p-4 bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                            {clientGroup.clienteNombre}
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          {clientGroup.totalItems}{" "}
                          {clientGroup.totalItems === 1
                            ? "clave protegida"
                            : "claves protegidas"}{" "}
                          en {proyectosArray.length}{" "}
                          {proyectosArray.length === 1
                            ? "obra"
                            : "obras/instalaciones"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {clientGroup.totalItems} claves
                      </span>
                      <button
                        type="button"
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                        title={isCollapsed ? "Expandir" : "Colapsar"}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Cuerpo del Cliente: Agrupado por Obra / Proyecto */}
                  {!isCollapsed && (
                    <div className="p-3.5 sm:p-5 space-y-4 bg-slate-50/30 dark:bg-zinc-950/20">
                      {proyectosArray.map((proy) => (
                        <div
                          key={proy.proyectoId}
                          className="rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 shadow-xs overflow-hidden"
                        >
                          {/* Barra de Proyecto de Referencia */}
                          <div className="px-4 py-3 bg-slate-100/70 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <FolderGit2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-zinc-200 truncate">
                                  {proy.notasTecnicas && proy.notasTecnicas.trim() !== ""
                                    ? proy.notasTecnicas
                                    : `Proyecto #${proy.proyectoId.slice(0, 8)}`}
                                </span>
                                {getEstadoBadge(proy.estado)}
                              </div>
                            </div>

                            {proy.proyectoId !== "sin_proyecto" && (
                              <Link
                                href={`/proyectos/${proy.proyectoId}`}
                                className="min-h-[36px] inline-flex items-center gap-1 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline shrink-0"
                              >
                                Ver Proyecto / Obra
                                <ExternalLink className="w-3.5 h-3.5" />
                              </Link>
                            )}
                          </div>

                          {/* Lista de Credenciales del Proyecto */}
                          <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                            {proy.items.map((item) => (
                              <div
                                key={item.id}
                                className="p-3.5 sm:p-4 hover:bg-slate-50/60 dark:hover:bg-zinc-800/30 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
                              >
                                {/* Descripción y Tipo */}
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80">
                                      {getTipoDatoIcon(item.tipo_dato)}
                                      {item.tipo_dato.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(item.created_at!).toLocaleDateString("es-AR")}
                                    </span>
                                  </div>

                                  <h5 className="font-semibold text-sm text-slate-900 dark:text-zinc-100">
                                    {item.descripcion}
                                  </h5>
                                </div>

                                {/* Valor Desencriptado Táctil & Adjunto */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800/60">
                                  <MaskedValue
                                    value={item.valor_desencriptado || ""}
                                    recordId={item.id}
                                    descripcion={item.descripcion}
                                    tipoDato={item.tipo_dato}
                                  />
                                  {item.archivo_url && (
                                    <BovedaImageModal path={item.archivo_url} />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* VISTA 2: LISTA PLANA CRONOLÓGICA */}
      {viewMode === "tabla" && (
        <div className="space-y-4">
          {/* Móvil: Tarjetas Táctiles (< md) */}
          <div className="md:hidden space-y-3">
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center text-slate-400 dark:text-zinc-500">
                <FilterX className="w-8 h-8 mx-auto mb-2 text-slate-400 dark:text-zinc-600 stroke-1" />
                <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                  {hasActiveFilters
                    ? "No se encontraron registros con los filtros aplicados."
                    : "No hay registros en la bóveda de seguridad."}
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
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200/90 dark:border-zinc-800/90 bg-white dark:bg-zinc-900/70 p-4 shadow-sm space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 font-semibold">
                          {getTipoDatoIcon(item.tipo_dato)}
                          {item.tipo_dato.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                          {new Date(item.created_at!).toLocaleDateString("es-AR")}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                        {item.proyecto?.cliente?.nombre_razon_social ||
                          item.proyectos?.clientes?.nombre_razon_social ||
                          "Desconocido"}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                        {item.descripcion}
                      </p>

                      {item.proyecto_id && (
                        <div className="pt-1.5">
                          <Link
                            href={`/proyectos/${item.proyecto_id}`}
                            className="inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-mono"
                          >
                            <FolderGit2 className="w-3 h-3" />
                            Ref: {item.proyecto?.notas_tecnicas || item.proyecto_id.slice(0, 8)}
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 dark:border-zinc-800/80 space-y-2">
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">
                      Credencial / Clave Resguardada
                    </span>
                    <MaskedValue
                      value={item.valor_desencriptado || ""}
                      recordId={item.id}
                      descripcion={item.descripcion}
                      tipoDato={item.tipo_dato}
                    />
                    {item.archivo_url && (
                      <div className="pt-1">
                        <BovedaImageModal path={item.archivo_url} />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop & Tablet: Tabla Completa (>= md) */}
          <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase bg-slate-50/90 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Cliente & Proyecto Ref.</th>
                    <th className="px-6 py-4">Tipo de Dato</th>
                    <th className="px-6 py-4">Descripción</th>
                    <th className="px-6 py-4">Valor Desencriptado</th>
                    <th className="px-6 py-4 text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-14 text-center text-slate-400 dark:text-zinc-500"
                      >
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <FilterX className="w-8 h-8 text-slate-400 dark:text-zinc-600 stroke-1" />
                          <p className="text-sm font-medium text-slate-600 dark:text-zinc-400">
                            {hasActiveFilters
                              ? "No se encontraron registros con los filtros aplicados."
                              : "No hay registros en la bóveda de seguridad."}
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
                    filteredItems.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <FolderGit2 className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-zinc-100">
                                {item.proyecto?.cliente?.nombre_razon_social ||
                                  item.proyectos?.clientes?.nombre_razon_social ||
                                  "Desconocido"}
                              </span>
                              {item.proyecto_id && (
                                <Link
                                  href={`/proyectos/${item.proyecto_id}`}
                                  className="text-xs text-slate-500 hover:text-cyan-600 dark:text-zinc-500 dark:hover:text-cyan-400 font-mono transition-colors flex items-center gap-1"
                                >
                                  Ref: {item.proyecto?.notas_tecnicas || item.proyecto_id.slice(0, 8)}...
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80">
                            {getTipoDatoIcon(item.tipo_dato)}
                            {item.tipo_dato.replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-slate-700 dark:text-zinc-300 font-medium">
                          {item.descripcion}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <MaskedValue
                              value={item.valor_desencriptado || ""}
                              recordId={item.id}
                              descripcion={item.descripcion}
                              tipoDato={item.tipo_dato}
                            />
                            {item.archivo_url && (
                              <BovedaImageModal path={item.archivo_url} />
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right text-xs text-slate-500 dark:text-zinc-400 font-mono">
                          {new Date(item.created_at!).toLocaleDateString("es-AR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
