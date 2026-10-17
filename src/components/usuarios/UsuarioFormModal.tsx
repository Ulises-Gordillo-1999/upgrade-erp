"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { UserPlus, Pencil, X, Loader2, User, Mail, Lock, Phone, Wrench, Shield } from "lucide-react";
import { createUsuario, updateUsuario } from "@/app/actions/usuarios";
import { Rol, Usuario } from "@/types/database";

interface UsuarioFormModalProps {
  usuarioInicial?: Usuario;
  isEdit?: boolean;
}

export function UsuarioFormModal({ usuarioInicial, isEdit = false }: UsuarioFormModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [nombre, setNombre] = useState(usuarioInicial?.nombre || "");
  const [email, setEmail] = useState(usuarioInicial?.email || "");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<Rol>(usuarioInicial?.rol || "Tecnico");
  const [telefono, setTelefono] = useState(usuarioInicial?.telefono || "");
  const [especialidad, setEspecialidad] = useState(usuarioInicial?.especialidad || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isEdit && usuarioInicial) {
        await updateUsuario(usuarioInicial.id, {
          nombre,
          email,
          rol,
          telefono,
          especialidad,
        });
      } else {
        if (!password || password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres.");
          setLoading(false);
          return;
        }
        await createUsuario({
          nombre,
          email,
          password,
          rol,
          telefono,
          especialidad,
        });
      }
      setIsOpen(false);
      if (!isEdit) {
        setNombre("");
        setEmail("");
        setPassword("");
        setTelefono("");
        setEspecialidad("");
      }
    } catch (err: any) {
      setError(err.message || "Ocurrió un error al guardar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isEdit ? (
        <button
          onClick={() => setIsOpen(true)}
          className="p-1.5 text-slate-400 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
          title="Editar usuario"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-sm font-medium rounded-xl shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          Nuevo Técnico / Usuario
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-6 sm:p-7 shadow-2xl backdrop-blur-xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isEdit ? <Pencil className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> : <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
                {isEdit ? "Editar Usuario / Técnico" : "Alta de Nuevo Técnico"}
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">Nombre Completo *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    placeholder="Ej. Lucas Gómez"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">Correo Electrónico *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="lucas@upgrade.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {!isEdit && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">Contraseña Inicial *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Mínimo 6 caracteres"
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">Rol en el Sistema *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Shield className="w-4 h-4" />
                    </div>
                    <select
                      value={rol}
                      onChange={(e) => setRol(e.target.value as Rol)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="Tecnico">Técnico</option>
                      <option value="Admin">Administrador</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">Teléfono / WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+54 9 11 ..."
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">Especialidad Técnica</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                    placeholder="Ej. Redes & Cableado, CCTV, Soporte Nivel 1"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/40 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isEdit ? "Guardar Cambios" : "Crear Usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
