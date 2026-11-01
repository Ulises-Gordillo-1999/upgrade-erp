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
        className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center p-2 text-slate-400 hover:text-amber-600 dark:text-zinc-400 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-lg transition-colors"
        title="Resetear contraseña"
      >
        <KeyRound className="w-4 h-4" />
      </button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/95 p-5 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4 animate-in zoom-in-95 duration-200 max-h-[90dvh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                <span>Resetear Contraseña</span>
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Establezca una nueva clave de acceso para <strong className="text-slate-900 dark:text-white">{usuarioNombre}</strong>.
            </p>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                Contraseña restablecida con éxito.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Nueva Contraseña</label>
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
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-amber-500 transition-colors"
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
                  className="min-h-[44px] flex items-center justify-center px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50 gap-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Confirmar</span>
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
