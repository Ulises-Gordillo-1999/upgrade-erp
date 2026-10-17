"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { KeyRound, X, Loader2, Lock } from "lucide-react";
import { resetPasswordUsuario } from "@/app/actions/usuarios";

interface ResetPasswordModalProps {
  usuarioId: string;
  usuarioNombre: string;
}

export function ResetPasswordModal({ usuarioId, usuarioNombre }: ResetPasswordModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [passwordNueva, setPasswordNueva] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (passwordNueva.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.");
        setLoading(false);
        return;
      }
      await resetPasswordUsuario(usuarioId, passwordNueva);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        setSuccess(false);
        setPasswordNueva("");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Error al resetear contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-slate-400 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
        title="Resetear contraseña"
      >
        <KeyRound className="w-4 h-4" />
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-6 shadow-2xl backdrop-blur-xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                Resetear Contraseña
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Establezca una nueva clave de acceso para <strong className="text-slate-900 dark:text-white">{usuarioNombre}</strong>.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                Contraseña restablecida con éxito.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">Nueva Contraseña</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={passwordNueva}
                    onChange={(e) => setPasswordNueva(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500"
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
                  className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar Cambio
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
