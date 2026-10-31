"use client";

import { useState, useEffect } from "react";
import {
  Fingerprint,
  Smartphone,
  Laptop,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";
import {
  browserSupportsWebAuthn,
  platformAuthenticatorIsAvailable,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  generateRegistrationOptionsAction,
  verifyRegistrationAction,
  getMisDispositivosBiometricosAction,
  eliminarDispositivoBiometricoAction,
} from "@/app/actions/webauthn";

interface DispositivoBiometrico {
  id: string;
  nombre: string;
  creado: string | null;
  ultimoUso: string | null;
}

export function BiometricEnrollment() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [hasPlatformAuthenticator, setHasPlatformAuthenticator] = useState<boolean | null>(null);
  const [dispositivos, setDispositivos] = useState<DispositivoBiometrico[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [nombreDispositivo, setNombreDispositivo] = useState("");
  const [mensaje, setMensaje] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Detectar soporte del navegador y autenticador de plataforma (Huella / FaceID)
  useEffect(() => {
    async function checkCapabilities() {
      const supported = browserSupportsWebAuthn();
      setIsSupported(supported);

      if (supported) {
        try {
          const available = await platformAuthenticatorIsAvailable();
          setHasPlatformAuthenticator(available);
        } catch {
          setHasPlatformAuthenticator(false);
        }
      } else {
        setHasPlatformAuthenticator(false);
      }

      // Nombre de dispositivo sugerido según el User Agent
      if (typeof window !== "undefined") {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) setNombreDispositivo("Android Phone (Huella)");
        else if (/iphone|ipad/i.test(ua)) setNombreDispositivo("iPhone / iPad (FaceID)");
        else if (/macintosh/i.test(ua)) setNombreDispositivo("MacBook (TouchID)");
        else if (/windows/i.test(ua)) setNombreDispositivo("PC Windows (Windows Hello)");
        else setNombreDispositivo("Dispositivo Personal");
      }

      cargarDispositivos();
    }

    checkCapabilities();
  }, []);

  const cargarDispositivos = async () => {
    setLoadingList(true);
    try {
      const items = await getMisDispositivosBiometricosAction();
      setDispositivos(items);
    } catch (e) {
      console.error("Error al cargar dispositivos:", e);
    } finally {
      setLoadingList(false);
    }
  };

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(null);
    setIsEnrolling(true);

    try {
      // 1. Solicitar opciones de registro al servidor
      const resOptions = await generateRegistrationOptionsAction();
      if (resOptions.error || !resOptions.options) {
        setMensaje({ type: "error", text: resOptions.error || "No se pudieron obtener las opciones de registro." });
        setIsEnrolling(false);
        return;
      }

      // 2. Invocar el sensor biométrico del dispositivo (TouchID, FaceID, Huella)
      const regResponse = await startRegistration({ optionsJSON: resOptions.options });

      // 3. Enviar la respuesta criptográfica para validación y almacenamiento
      const verifyRes = await verifyRegistrationAction(
        regResponse,
        nombreDispositivo.trim() || "Dispositivo Biométrico"
      );

      if (verifyRes.error) {
        setMensaje({ type: "error", text: verifyRes.error });
      } else {
        setMensaje({
          type: "success",
          text: `¡Dispositivo "${nombreDispositivo}" vinculado con éxito! Ahora puedes iniciar sesión con tu huella digital o FaceID.`,
        });
        await cargarDispositivos();
      }
    } catch (err: any) {
      console.error("Error en registro biométrico:", err);
      if (err.name === "NotAllowedError") {
        setMensaje({
          type: "error",
          text: "Operación cancelada o tiempo de espera agotado en el sensor biométrico.",
        });
      } else {
        setMensaje({
          type: "error",
          text: err.message || "Error al comunicarse con el sensor biométrico.",
        });
      }
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleEliminar = async (id: string, nombre: string) => {
    if (!confirm(`¿Deseas desvincular el dispositivo "${nombre}"? Ya no podrás usar su huella para ingresar.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await eliminarDispositivoBiometricoAction(id);
      if (res.error) {
        setMensaje({ type: "error", text: res.error });
      } else {
        setMensaje({ type: "success", text: `Dispositivo "${nombre}" desvinculado correctamente.` });
        await cargarDispositivos();
      }
    } catch {
      setMensaje({ type: "error", text: "Error al eliminar el dispositivo." });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-md space-y-6 shadow-sm">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-500">
              <Fingerprint className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Autenticación Biométrica & Passkeys
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            Inicia sesión al instante desde tu teléfono o computadora utilizando tu huella digital, Face ID o Windows Hello, sin necesidad de escribir tu contraseña.
          </p>
        </div>

        {/* Badge de estado del sensor en este equipo */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isSupported && hasPlatformAuthenticator ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Sensor Biométrico Disponible
            </span>
          ) : isSupported === false || hasPlatformAuthenticator === false ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400">
              <Info className="w-3.5 h-3.5" />
              Sensor no detectado en este navegador
            </span>
          ) : null}
        </div>
      </div>

      {/* Alerta de mensajes */}
      {mensaje && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 animate-in fade-in ${
            mensaje.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
          }`}
        >
          {mensaje.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{mensaje.text}</span>
        </div>
      )}

      {/* Formulario de Vinculación de Nuevo Dispositivo */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 via-zinc-900/60 to-zinc-950/80 p-5 sm:p-6 backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative space-y-4">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            Vincular este dispositivo actual
          </div>

          <form onSubmit={handleEnroll} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block">
                Nombre para identificar este dispositivo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                  <Smartphone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={nombreDispositivo}
                  onChange={(e) => setNombreDispositivo(e.target.value)}
                  placeholder="Ej: Mi Celular Samsung / iPhone / PC Taller"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-500">
                Al hacer clic en vincular, tu navegador te pedirá confirmar con tu huella digital, Face ID o PIN de seguridad.
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isEnrolling || isSupported === false}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/40 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Esperando sensor biométrico...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Registrar Huella / FaceID de este Equipo</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Lista de Dispositivos Registrados */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            Dispositivos biométricos vinculados ({dispositivos.length})
          </h4>
        </div>

        {loadingList ? (
          <div className="py-8 flex items-center justify-center text-xs text-slate-500 dark:text-zinc-500 gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
            Cargando dispositivos...
          </div>
        ) : dispositivos.length === 0 ? (
          <div className="p-6 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center space-y-2">
            <Fingerprint className="w-8 h-8 text-slate-400 dark:text-zinc-600 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-zinc-400 font-medium">
              No tienes ningún dispositivo biométrico registrado todavía.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-zinc-500">
              Registra tu teléfono o laptop para iniciar sesión con un solo toque sin ingresar contraseña.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dispositivos.map((d) => (
              <div
                key={d.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-zinc-950/60 flex items-center justify-between gap-3 group hover:border-cyan-500/30 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shrink-0">
                    {d.nombre.toLowerCase().includes("pc") || d.nombre.toLowerCase().includes("mac") ? (
                      <Laptop className="w-4 h-4" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-zinc-100 truncate">
                      {d.nombre}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-zinc-500 font-mono">
                      <span>
                        Alta: {d.creado ? new Date(d.creado).toLocaleDateString("es-AR") : "N/A"}
                      </span>
                      <span>•</span>
                      <span>
                        {d.ultimoUso
                          ? `Uso: ${new Date(d.ultimoUso).toLocaleDateString("es-AR")}`
                          : "Sin uso aún"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleEliminar(d.id, d.nombre)}
                  disabled={deletingId === d.id}
                  title="Desvincular dispositivo"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0 disabled:opacity-50"
                >
                  {deletingId === d.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
