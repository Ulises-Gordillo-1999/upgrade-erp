"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MaskedValue } from "./MaskedValue";
import { BovedaImageModal } from "./BovedaImageModal";
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
  Layers,
  Table as TableIcon,
  ShieldCheck,
} from "lucide-react";
import { TipoDatoBoveda, TipoCredencialBoveda } from "@/types/database";

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
  if (t.includes("pass") || t.includes("clave") || t.includes("token") || t.includes("contraseña")) {
    return <Key className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
  }
  if (t.includes("ip") || t.includes("subred") || t.includes("red") || t.includes("vlan") || t.includes("vpn")) {
    return <Network className="w-4 h-4 text-blue-500 dark:text-blue-400" />;
  }
  if (t.includes("anydesk") || t.includes("rustdesk") || t.includes("teamviewer") || t.includes("remoto") || t.includes("vnc")) {
    return <MonitorSmartphone className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
  }
  if (t.includes("router") || t.includes("switch") || t.includes("mikrotik") || t.includes("firewall") || t.includes("ap")) {
    return <Router className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
  }
  return <ShieldAlert className="w-4 h-4 text-slate-400 dark:text-zinc-400" />;
};

const getEstadoBadge = (estado?: string | null) => {
  if (!estado) return null;
  switch (estado) {
    case "Finalizado":
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
          Finalizado
        </span>
      );
    case "En_Ejecucion":
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
          En Ejecución
        </span>
      );
    case "Aprobado":
      return (
        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
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
  const [tipoDatoFiltro, setTipoDatoFiltro] = useState<string>("todos");
  const [adjuntoFiltro, setAdjuntoFiltro] = useState<string>("todos");
  const [clienteFiltro, setClienteFiltro] = useState<string>("todos");
  const [viewMode, setViewMode] = useState<"cliente" | "tabla">("cliente");

  // Estado de colapso de tarjetas de cliente (por ID o nombre)
  const [collapsedClients, setCollapsedClients] = useState<Record<string, boolean>>({});

  const toggleClientCollapse = (clienteKey: string) => {
    setCollapsedClients((prev) => ({
      ...prev,
      [clienteKey]: !prev[clienteKey],
    }));
  };

  // Lista de clientes únicos para el dropdown
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

  const hasActiveFilters =
    searchTerm !== "" ||
    tipoDatoFiltro !== "todos" ||
    adjuntoFiltro !== "todos" ||
    clienteFiltro !== "todos";

  const resetFilters = () => {
    setSearchTerm("");
    setTipoDatoFiltro("todos");
    setAdjuntoFiltro("todos");
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

      // 3. Filtro Tipo de Dato
      if (tipoDatoFiltro !== "todos") {
        const itemTipo = item.tipo_dato;
        const legacyMatch: Record<string, string> = {
          Password: "Contraseña / Token",
          IP_Publica: "IP Pública / Subred",
          AnyDesk_ID: "ID AnyDesk / RustDesk / TeamViewer",
          Config_Router: "Configuración de Router / Switch",
          Otro: "Otro dato sensible",
        };
        const normalized = legacyMatch[itemTipo] || itemTipo;
        if (itemTipo !== tipoDatoFiltro && normalized !== tipoDatoFiltro) {
          return false;
        }
      }

      // 4. Filtro Adjunto
      if (adjuntoFiltro !== "todos") {
        const hasAttachment = Boolean(
          item.archivo_url && item.archivo_url.trim() !== ""
        );
        if (adjuntoFiltro === "con_adjunto" && !hasAttachment) {
          return false;
        }
        if (adjuntoFiltro === "sin_adjunto" && hasAttachment) {
          return false;
        }
      }

      return true;
    });
  }, [bovedaItems, searchTerm, tipoDatoFiltro, adjuntoFiltro, clienteFiltro]);

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
    <div className="space-y-5">
      {/* Barra de Búsqueda, Filtros y Switch de Vista */}
      <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 shadow-sm backdrop-blur-md space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Input de Búsqueda */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-400 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por cliente, proyecto o descripción de credencial..."
              className="w-full bg-slate-50 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 p-0.5 rounded transition-colors"
                title="Limpiar búsqueda"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtros Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filtro por Cliente */}
            <select
              value={clienteFiltro}
              onChange={(e) => setClienteFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer max-w-[180px] truncate"
            >
              <option value="todos">Todos los Clientes</option>
              {clientesDisponibles.map((cli) => (
                <option key={cli} value={cli}>
                  {cli}
                </option>
              ))}
            </select>

            {/* Tipo de Dato */}
            <select
              value={tipoDatoFiltro}
              onChange={(e) => setTipoDatoFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todos">Todos los Tipos</option>
              {tiposCredencial && tiposCredencial.length > 0 ? (
                tiposCredencial.map((t) => (
                  <option key={t.id} value={t.nombre}>
                    {t.nombre}
                  </option>
                ))
              ) : (
                <>
                  <option value="Contraseña / Token">Contraseña / Token</option>
                  <option value="IP Pública / Subred">IP Pública / Subred</option>
                  <option value="ID AnyDesk / RustDesk / TeamViewer">ID AnyDesk / Remoto</option>
                  <option value="Configuración de Router / Switch">Configuración Router</option>
                  <option value="Otro dato sensible">Otro dato sensible</option>
                </>
              )}
            </select>

            {/* Adjunto */}
            <select
              value={adjuntoFiltro}
              onChange={(e) => setAdjuntoFiltro(e.target.value)}
              className="bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-cyan-500 transition-colors cursor-pointer"
            >
              <option value="todos">Adjuntos (Todos)</option>
              <option value="con_adjunto">Con comprobante / imagen</option>
              <option value="sin_adjunto">Solo texto encriptado</option>
            </select>

            {/* Selector de Modo de Visualización (Agrupado por Cliente vs Lista) */}
            <div className="inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700/60 shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode("cliente")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "cliente"
                    ? "bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
                title="Agrupar credenciales por cliente"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Por Cliente</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("tabla")}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "tabla"
                    ? "bg-white dark:bg-zinc-700 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200"
                }`}
                title="Ver lista plana cronológica"
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Lista Plana</span>
              </button>
            </div>

            {/* Botón Reset */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 rounded-xl transition-all"
                title="Limpiar todos los filtros"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restablecer</span>
              </button>
            )}
          </div>
        </div>

        {/* Resumen de Resultados / Filtros Activos */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-200/60 dark:border-zinc-800/60">
          <span>
            Mostrando{" "}
            <strong className="text-slate-800 dark:text-zinc-200">
              {filteredItems.length}
            </strong>{" "}
            credenciales distribuidas en{" "}
            <strong className="text-slate-800 dark:text-zinc-200">
              {groupedByClient.length}
            </strong>{" "}
            clientes
          </span>

          {hasActiveFilters && (
            <span className="text-[11px] text-cyan-600 dark:text-cyan-400 flex items-center gap-1 font-medium">
              <SlidersHorizontal className="w-3 h-3" />
              Filtros activos
            </span>
          )}
        </div>
      </div>

      {/* VISTA 1: AGRUPADO POR CLIENTE (Por Defecto) */}
      {viewMode === "cliente" && (
        <div className="space-y-4">
          {groupedByClient.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-10 text-center text-slate-400 dark:text-zinc-500">
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
                  className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
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

              return (
                <div
                  key={clientGroup.clienteNombre}
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/70 shadow-sm overflow-hidden transition-all"
                >
                  {/* Encabezado del Cliente */}
                  <div
                    onClick={() =>
                      toggleClientCollapse(clientGroup.clienteNombre)
                    }
                    className="p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 cursor-pointer select-none hover:bg-slate-100/60 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-slate-900 dark:text-zinc-100 tracking-tight truncate">
                            {clientGroup.clienteNombre}
                          </h3>
                          {clientGroup.telefono && (
                            <span className="text-xs text-slate-500 dark:text-zinc-400">
                              • Tel: {clientGroup.telefono}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                          {clientGroup.totalItems}{" "}
                          {clientGroup.totalItems === 1
                            ? "credencial resguardada"
                            : "credenciales resguardadas"}{" "}
                          en {proyectosArray.length}{" "}
                          {proyectosArray.length === 1 ? "obra/instalación" : "obras/instalaciones"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20">
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

                  {/* Cuerpo del Cliente: Agrupado por Proyecto de Referencia */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-5 space-y-5 bg-slate-50/30 dark:bg-zinc-950/20">
                      {proyectosArray.map((proy) => (
                        <div
                          key={proy.proyectoId}
                          className="rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/90 shadow-2xs overflow-hidden"
                        >
                          {/* Barra de Proyecto de Referencia */}
                          <div className="px-4 py-3 bg-slate-100/70 dark:bg-zinc-800/60 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2 min-w-0">
                              <FolderGit2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                              <div className="flex items-center gap-2 flex-wrap min-w-0">
                                <span className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-zinc-200 truncate">
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
                                className="inline-flex items-center gap-1 text-xs font-medium text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-2 shrink-0"
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
                                {/* Datos de la Credencial */}
                                <div className="space-y-1.5 flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/80">
                                      {getTipoDatoIcon(item.tipo_dato)}
                                      {item.tipo_dato.replace(/_/g, " ")}
                                    </span>
                                    <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(item.created_at!).toLocaleDateString("es-AR")}
                                    </span>
                                  </div>

                                  <h5 className="font-medium text-sm text-slate-900 dark:text-zinc-100">
                                    {item.descripcion}
                                  </h5>
                                </div>

                                {/* Valor Desencriptado & Adjunto */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-zinc-800/60">
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
          {/* Móvil: Tarjetas (< md) */}
          <div className="md:hidden space-y-3">
            {filteredItems.length === 0 ? (
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-8 text-center text-slate-400 dark:text-zinc-500">
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
                    className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Limpiar filtros
                  </button>
                )}
              </div>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 shadow-sm space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-[10px] px-2 py-0.5 rounded-lg border border-slate-200 dark:border-zinc-700 font-medium">
                          {getTipoDatoIcon(item.tipo_dato as TipoDatoBoveda)}
                          {item.tipo_dato.replace(/_/g, " ")}
                        </span>
                        <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                          {new Date(item.created_at!).toLocaleDateString("es-AR")}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-slate-900 dark:text-zinc-100">
                        {item.proyecto?.cliente?.nombre_razon_social ||
                          item.proyectos?.clientes?.nombre_razon_social ||
                          "Desconocido"}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5">
                        {item.descripcion}
                      </p>

                      {item.proyecto_id && (
                        <div className="pt-1">
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
                    <span className="text-[10px] text-slate-400 dark:text-zinc-500 uppercase font-medium block">
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
          <div className="hidden md:block rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden shadow-sm dark:shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 dark:text-zinc-400 uppercase bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-6 py-4 font-medium">Cliente & Proyecto Ref.</th>
                    <th className="px-6 py-4 font-medium">Tipo de Dato</th>
                    <th className="px-6 py-4 font-medium">Descripción</th>
                    <th className="px-6 py-4 font-medium">Valor Desencriptado</th>
                    <th className="px-6 py-4 font-medium text-right">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-zinc-800">
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
                              className="mt-2 text-xs text-cyan-600 dark:text-cyan-400 hover:underline underline-offset-4"
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
                              <span className="font-medium text-slate-900 dark:text-zinc-100">
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
                          <div className="flex items-center text-slate-700 dark:text-zinc-300">
                            <div className="mr-2 p-1.5 bg-slate-100 dark:bg-zinc-800 rounded-md">
                              {getTipoDatoIcon(item.tipo_dato as TipoDatoBoveda)}
                            </div>
                            <span className="text-xs font-medium">
                              {item.tipo_dato.replace(/_/g, " ")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-zinc-300 font-medium">
                          {item.descripcion}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-2">
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
                        <td className="px-6 py-4 text-slate-500 dark:text-zinc-500 text-xs text-right">
                          <div className="flex items-center justify-end">
                            <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                            {new Date(item.created_at!).toLocaleDateString("es-AR")}
                          </div>
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

