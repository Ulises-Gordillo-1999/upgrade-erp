"use client";

import { useState, useMemo } from "react";
import { LogAuditoria } from "@/types/database";
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  User,
  DollarSign,
  ShieldAlert,
  FolderGit2,
  UserCog,
  Activity,
  Layers,
  ArrowUpDown,
  Download,
} from "lucide-react";

interface AuditoriaTableProps {
  logs: LogAuditoria[];
}

type ModuloFiltro = "Todos" | "Finanzas" | "Boveda" | "Proyectos" | "Usuarios";

export function AuditoriaTable({ logs }: AuditoriaTableProps) {
  const [moduloFiltro, setModuloFiltro] = useState<ModuloFiltro>("Todos");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchModulo =
        moduloFiltro === "Todos" ? true : log.modulo === moduloFiltro;

      if (!matchModulo) return false;

      if (!searchTerm.trim()) return true;

      const term = searchTerm.toLowerCase();
      const matchUser = (log.usuario_nombre || "").toLowerCase().includes(term);
      const matchRol = (log.usuario_rol || "").toLowerCase().includes(term);
      const matchAccion = (log.accion || "").toLowerCase().includes(term);
      const matchDetalle = (log.detalle || "").toLowerCase().includes(term);
      const matchModuloName = (log.modulo || "").toLowerCase().includes(term);

      return (
        matchUser || matchRol || matchAccion || matchDetalle || matchModuloName
      );
    });
  }, [logs, moduloFiltro, searchTerm]);

  // Contadores rápidos
  const conteoModulos = useMemo(() => {
    const conteo = {
      Todos: logs.length,
      Finanzas: 0,
      Boveda: 0,
      Proyectos: 0,
      Usuarios: 0,
    };
    for (const l of logs) {
      if (l.modulo === "Finanzas") conteo.Finanzas++;
      else if (l.modulo === "Boveda") conteo.Boveda++;
      else if (l.modulo === "Proyectos") conteo.Proyectos++;
      else if (l.modulo === "Usuarios") conteo.Usuarios++;
    }
    return conteo;
  }, [logs]);

  const getModuloBadge = (modulo: string) => {
    switch (modulo) {
      case "Finanzas":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-3.5 h-3.5" />
            Finanzas
          </span>
        );
      case "Boveda":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            Bóveda
          </span>
        );
      case "Proyectos":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <FolderGit2 className="w-3.5 h-3.5" />
            Proyectos
          </span>
        );
      case "Usuarios":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
            <UserCog className="w-3.5 h-3.5" />
            Usuarios
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            <Activity className="w-3.5 h-3.5" />
            {modulo}
          </span>
        );
    }
  };

  const getRolBadge = (rol: string) => {
    switch (rol) {
      case "SuperAdmin":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            SuperAdmin
          </span>
        );
      case "Admin":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Admin
          </span>
        );
      case "Tecnico":
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            Técnico
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">
            {rol}
          </span>
        );
    }
  };

  const formatFechaHora = (fechaStr?: string): { fecha: string; hora: string } => {
    if (!fechaStr) return { fecha: "-", hora: "-" };
    const d = new Date(fechaStr);
    return {
      fecha: d.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      hora: d.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };
  };

  const exportarCSV = () => {
    const headers = [
      "Fecha y Hora",
      "Usuario",
      "Rol",
      "Módulo",
      "Acción",
      "Detalle",
    ];
    const rows = filteredLogs.map((l) => [
      l.created_at ? new Date(l.created_at).toLocaleString("es-AR") : "",
      `"${(l.usuario_nombre || "").replace(/"/g, '""')}"`,
      l.usuario_rol || "",
      l.modulo || "",
      `"${(l.accion || "").replace(/"/g, '""')}"`,
      `"${(l.detalle || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `auditoria_upgrade_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Tarjetas resumen */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-cyan-500/10 rounded-xl text-cyan-600 dark:text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Total Registros
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
              {logs.length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Finanzas
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
              {conteoModulos.Finanzas}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Bóveda Segura
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
              {conteoModulos.Boveda}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
            <UserCog className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Equipo y Proyectos
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-zinc-100">
              {conteoModulos.Usuarios + conteoModulos.Proyectos}
            </p>
          </div>
        </div>
      </div>

      {/* Controles de Filtro y Búsqueda */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Tabs por Módulo */}
          <div className="flex flex-wrap items-center gap-2">
            {(
              ["Todos", "Finanzas", "Boveda", "Proyectos", "Usuarios"] as ModuloFiltro[]
            ).map((mod) => (
              <button
                key={mod}
                onClick={() => setModuloFiltro(mod)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                  moduloFiltro === mod
                    ? "bg-slate-900 text-white dark:bg-cyan-500 dark:text-zinc-950 shadow-sm"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-700"
                }`}
              >
                <span>
                  {mod === "Boveda"
                    ? "Bóveda"
                    : mod === "Usuarios"
                    ? "Equipo"
                    : mod}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    moduloFiltro === mod
                      ? "bg-white/20 text-white dark:bg-black/20 dark:text-zinc-950"
                      : "bg-slate-200 dark:bg-zinc-700 text-slate-500 dark:text-zinc-400"
                  }`}
                >
                  {conteoModulos[mod]}
                </span>
              </button>
            ))}
          </div>

          {/* Búsqueda y Exportación */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                placeholder="Buscar por usuario, acción o detalle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              onClick={exportarCSV}
              disabled={filteredLogs.length === 0}
              className="px-3 py-1.5 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
              title="Descargar auditoría en formato CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exportar CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabla Desktop */}
      <div className="hidden md:block bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/50 text-slate-500 dark:text-zinc-400 font-semibold text-xs uppercase tracking-wider">
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Usuario</th>
                <th className="py-3 px-4">Módulo</th>
                <th className="py-3 px-4">Acción Realizada</th>
                <th className="py-3 px-4">Detalle de Operación</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center text-slate-400 dark:text-zinc-500"
                  >
                    <ShieldCheck className="w-12 h-12 mx-auto mb-2 opacity-30" />
                    <p className="text-base font-semibold">
                      Sin registros de auditoría
                    </p>
                    <p className="text-xs">
                      No se encontraron eventos coincidentes con los filtros
                      aplicados.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const fh = formatFechaHora(log.created_at);
                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                    >
                      {/* Fecha y Hora */}
                      <td className="py-3 px-4 whitespace-nowrap text-xs">
                        <div className="font-medium text-slate-900 dark:text-zinc-200">
                          {fh.fecha}
                        </div>
                        <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                          {fh.hora}
                        </div>
                      </td>

                      {/* Usuario */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-zinc-300">
                            {log.usuario_nombre.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-slate-900 dark:text-zinc-200">
                              {log.usuario_nombre}
                            </div>
                            <div className="mt-0.5">
                              {getRolBadge(log.usuario_rol)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Módulo */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getModuloBadge(log.modulo)}
                      </td>

                      {/* Acción */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-xs text-slate-800 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-700">
                          {log.accion}
                        </span>
                      </td>

                      {/* Detalle */}
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-zinc-300 max-w-md break-words">
                        {log.detalle}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tarjetas Mobile */}
      <div className="md:hidden space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-slate-400 dark:text-zinc-500">
            <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="font-semibold text-sm">Sin registros</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const fh = formatFechaHora(log.created_at);
            return (
              <div
                key={log.id}
                className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-4 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    {getModuloBadge(log.modulo)}
                    <span className="font-semibold text-xs text-slate-800 dark:text-zinc-200">
                      {log.accion}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 dark:text-zinc-500 font-mono">
                    {fh.fecha} {fh.hora}
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-zinc-300">
                  {log.detalle}
                </p>

                <div className="flex items-center justify-between text-xs pt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-zinc-200">
                      {log.usuario_nombre}
                    </span>
                    {getRolBadge(log.usuario_rol)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
