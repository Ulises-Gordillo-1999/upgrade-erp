"use client";

import { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, LogIn, Loader2, ShieldCheck, Fingerprint } from "lucide-react";
import { loginUser } from "@/app/actions/auth";
import {
  generateAuthenticationOptionsAction,
  verifyAuthenticationAction,
} from "@/app/actions/webauthn";
import { browserSupportsWebAuthn, startAuthentication } from "@simplewebauthn/browser";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBiometricLoading, setIsBiometricLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const ua = navigator.userAgent || "";
      const isMobile = /android|iphone|ipad|ipod|mobile/i.test(ua);
      setIsMobileDevice(isMobile);
      if (isMobile) {
        setIsBiometricSupported(browserSupportsWebAuthn());
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    try {
      const res = await loginUser(null, formData);
      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Ocurrió un error inesperado al iniciar sesión.");
      setIsLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError(null);
    setIsBiometricLoading(true);

    try {
      // 1. Obtener opciones del servidor (si ingresó email, se filtra a sus credenciales; si no, passkey residente)
      const resOptions = await generateAuthenticationOptionsAction(email || undefined);
      if (resOptions.error || !resOptions.options) {
        setError(resOptions.error || "No se pudieron obtener opciones de autenticación.");
        setIsBiometricLoading(false);
        return;
      }

      // 2. Pedir huella digital o FaceID al navegador/teléfono
      const authResponse = await startAuthentication({ optionsJSON: resOptions.options });

      // 3. Verificar criptográficamente y establecer cookie de sesión JWT
      const verifyRes = await verifyAuthenticationAction(authResponse);
      if (verifyRes.error) {
        setError(verifyRes.error);
        setIsBiometricLoading(false);
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err: any) {
      console.error("Error en login biométrico:", err);
      if (err.name === "NotAllowedError") {
        setError("Autenticación biométrica cancelada o sensor no detectado.");
      } else {
        setError(err.message || "Error al autenticar con huella digital.");
      }
      setIsBiometricLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">
            Correo Electrónico
          </label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@upgrade.com"
              required
              className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-50/70 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all duration-200"
            />
          </div>
        </div>

        {/* Input Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">
              Contraseña
            </label>
            <span className="text-[11px] text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-400 cursor-pointer transition-colors">
              ¿Olvidó su clave?
            </span>
          </div>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400 transition-colors">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
              className="w-full min-h-[44px] pl-10 pr-12 py-2.5 bg-slate-50/70 dark:bg-zinc-950/70 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/80 transition-all duration-200"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="min-w-[44px] min-h-[44px] absolute inset-y-0 right-0 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              tabIndex={-1}
              aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit Button Password */}
        <button
          type="submit"
          disabled={isLoading || isBiometricLoading}
          className="w-full min-h-[44px] mt-2 py-3 px-4 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/20 dark:shadow-cyan-950/50 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Autenticando...</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Ingresar al Sistema</span>
            </>
          )}
        </button>
      </form>

      {/* Separador & Botón Biometría (Exclusivo en Dispositivos Móviles / Celular) */}
      {isMobileDevice && isBiometricSupported && (
        <div className="space-y-4">
          <div className="relative flex items-center justify-center my-2">
            <div className="border-t border-slate-200 dark:border-zinc-800/80 w-full" />
            <span className="bg-white dark:bg-[#0c0e14] px-3 text-[10px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 font-semibold absolute">
              O con acceso biométrico
            </span>
          </div>

          <button
            type="button"
            onClick={handleBiometricLogin}
            disabled={isLoading || isBiometricLoading}
            className="w-full min-h-[44px] py-3 px-4 rounded-xl font-medium text-sm text-slate-800 dark:text-zinc-100 bg-slate-100/80 dark:bg-zinc-900/80 hover:bg-slate-200 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 hover:border-cyan-500/50 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 shadow-sm group disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {isBiometricLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                <span className="text-cyan-600 dark:text-cyan-400">Verificando Huella / FaceID...</span>
              </>
            ) : (
              <>
                <Fingerprint className="w-4 h-4 text-cyan-500 group-hover:scale-110 transition-transform" />
                <span>Acceder con Huella Digital / FaceID</span>
              </>
            )}
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-zinc-600 pt-2 border-t border-slate-200 dark:border-zinc-800/80">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500/70" />
        <span>Sesión encriptada con JWT, WebAuthn & RBAC</span>
      </div>
    </div>
  );
}

