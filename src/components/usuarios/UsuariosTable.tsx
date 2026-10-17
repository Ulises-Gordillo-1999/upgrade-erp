"use client";

import { Usuario } from "@/types/database";
import { UsuarioFormModal } from "./UsuarioFormModal";
import { ResetPasswordModal } from "./ResetPasswordModal";
import { DeleteUsuarioButton } from "./DeleteUsuarioButton";
import { ToggleEstadoButton } from "./ToggleEstadoButton";
import { Shield, Phone, Wrench, Clock } from "lucide-react";

interface UsuariosTableProps {
  usuarios: Usuario[];
  currentUserId: string;
}

export function UsuariosTable({ usuarios, currentUserId }: UsuariosTableProps) {
  const getRolBadge = (rol: string) => {
    switch (rol) {
      case "SuperAdmin":
        return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "Admin":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 backdrop-blur-sm shadow-sm dark:shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700 dark:text-zinc-300">
          <thead className="bg-slate-50 dark:bg-zinc-950/60 text-xs uppercase text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-800 tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Usuario</th>
              <th scope="col" className="px-6 py-4 font-semibold">Rol</th>
              <th scope="col" className="px-6 py-4 font-semibold">Contacto & Especialidad</th>
              <th scope="col" className="px-6 py-4 font-semibold">Estado</th>
              <th scope="col" className="px-6 py-4 font-semibold">Último Acceso</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60">
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400 dark:text-zinc-500">
                  No hay usuarios registrados.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => {
                const initials = u.nombre.slice(0, 2).toUpperCase();
                const isSelf = u.id === currentUserId;

                return (
                  <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-zinc-800/40 transition-colors">
                    {/* Usuario info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-800 to-blue-800 flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 dark:text-white truncate flex items-center gap-2">
                            {u.nombre}
                            {isSelf && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700 font-mono">
                                Tú
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-zinc-500 truncate">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRolBadge(
                          u.rol
                        )}`}
                      >
                        <Shield className="w-3 h-3" />
                        {u.rol}
                      </span>
                    </td>

                    {/* Contacto & Especialidad */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {u.especialidad ? (
                          <p className="text-xs text-slate-800 dark:text-zinc-200 flex items-center gap-1.5">
                            <Wrench className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                            {u.especialidad}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-400 dark:text-zinc-500 italic">Sin especialidad</p>
                        )}
                        {u.telefono && (
                          <p className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
                            {u.telefono}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Estado con Toggle */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ToggleEstadoButton id={u.id} activo={u.activo} isSelf={isSelf} />
                        <span
                          className={`text-xs font-medium ${
                            u.activo ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400 dark:text-zinc-500"
                          }`}
                        >
                          {u.activo ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                    </td>

                    {/* Último Acceso */}
                    <td className="px-6 py-4 text-xs text-slate-500 dark:text-zinc-400">
                      {u.last_login_at ? (
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600" />
                          {new Date(u.last_login_at).toLocaleString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-400 dark:text-zinc-600">Nunca</span>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <UsuarioFormModal usuarioInicial={u} isEdit={true} />
                        <ResetPasswordModal usuarioId={u.id} usuarioNombre={u.nombre} />
                        <DeleteUsuarioButton id={u.id} nombre={u.nombre} isSelf={isSelf} />
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
  );
}
