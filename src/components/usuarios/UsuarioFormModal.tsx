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
          className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center p-2 text-slate-400 hover:text-cyan-600 dark:text-zinc-400 dark:hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
          title="Editar usuario"
        >
          <Pencil className="w-4 h-4" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full sm:w-auto min-h-[44px] flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-md shadow-cyan-950/20 active:scale-[0.98] transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Técnico / Usuario</span>
        </button>
      )}

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isEdit ? <Pencil className="w-5 h-5 text-cyan-600 dark:text-cyan-400" /> : <UserPlus className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />}
                <span>{isEdit ? "Editar Usuario / Técnico" : "Alta de Nuevo Técnico"}</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Nombre Completo *</label>
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
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Correo Electrónico *</label>
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
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              {!isEdit && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Contraseña Inicial *</label>
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
                      className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Rol en el Sistema *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Shield className="w-4 h-4" />
                    </div>
                    <select
                      value={rol}
                      onChange={(e) => setRol(e.target.value as Rol)}
                      className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-cyan-500 [color-scheme:light] dark:[color-scheme:dark]"
                    >
                      <option value="Tecnico">Técnico</option>
                      <option value="Admin">Administrador</option>
                      <option value="SuperAdmin">SuperAdmin</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Teléfono / WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+54 9 11 ..."
                      className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 font-mono transition-colors"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Especialidad Técnica</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                    placeholder="Ej. Redes & Cableado, CCTV, Soporte Nivel 1"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-3 grid grid-cols-2 gap-2 sm:flex sm:justify-end border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="min-h-[44px] flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-white transition-colors rounded-xl border border-slate-200 dark:border-zinc-800 sm:border-0"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="min-h-[44px] flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl shadow-md shadow-cyan-950/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>{isEdit ? "Guardar Cambios" : "Crear Usuario"}</span>
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
