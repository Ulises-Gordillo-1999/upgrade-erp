"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Wrench,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  Calendar,
  Lock,
  Fingerprint,
  Bell,
} from "lucide-react";
import { updateMiPerfil, cambiarMiEmail, cambiarMiPassword } from "@/app/actions/perfil";
import { BiometricEnrollment } from "./BiometricEnrollment";
import { PushNotificationManager } from "@/components/pwa/PushNotificationManager";

interface PerfilFormProps {
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    telefono: string;
    especialidad: string;
    last_login_at: string | null;
    created_at: string | null;
  };
}

export function PerfilForm({ usuario }: PerfilFormProps) {
  // Pestaña activa: 'personal' | 'email' | 'password' | 'biometria' | 'notificaciones'
  const [tab, setTab] = useState<"personal" | "email" | "password" | "biometria" | "notificaciones">("personal");

  // Estado pestaña personal
  const [nombre, setNombre] = useState(usuario.nombre);
  const [telefono, setTelefono] = useState(usuario.telefono);
  const [especialidad, setEspecialidad] = useState(usuario.especialidad);
  const [loadingPersonal, setLoadingPersonal] = useState(false);
  const [msgPersonal, setMsgPersonal] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estado pestaña email
  const [nuevoEmail, setNuevoEmail] = useState(usuario.email);
  const [passwordParaEmail, setPasswordParaEmail] = useState("");
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [msgEmail, setMsgEmail] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Estado pestaña password
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNueva, setPasswordNueva] = useState("");
  const [passwordConfirmar, setPasswordConfirmar] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [msgPassword, setMsgPassword] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleUpdatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPersonal(true);
    setMsgPersonal(null);

    const res = await updateMiPerfil({ nombre, telefono, especialidad });
    if (res?.error) {
      setMsgPersonal({ type: "error", text: res.error });
    } else {
      setMsgPersonal({ type: "success", text: "Datos personales actualizados correctamente." });
    }
    setLoadingPersonal(false);
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingEmail(true);
    setMsgEmail(null);

    const res = await cambiarMiEmail({ nuevoEmail, passwordActual: passwordParaEmail });
    if (res?.error) {
      setMsgEmail({ type: "error", text: res.error });
    } else {
      setMsgEmail({ type: "success", text: "Correo electrónico actualizado con éxito." });
      setPasswordParaEmail("");
    }
    setLoadingEmail(false);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPassword(true);
    setMsgPassword(null);

    const res = await cambiarMiPassword({ passwordActual, passwordNueva, passwordConfirmar });
    if (res?.error) {
      setMsgPassword({ type: "error", text: res.error });
    } else {
      setMsgPassword({ type: "success", text: "Contraseña cambiada exitosamente." });
      setPasswordActual("");
      setPasswordNueva("");
      setPasswordConfirmar("");
    }
    setLoadingPassword(false);
  };

  const initials = usuario.nombre.slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl w-full min-w-0">
      {/* Tarjeta de Identidad Superior (Hero Banner) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-zinc-800 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-900/90 dark:to-zinc-950/80 p-4 sm:p-6 lg:p-8 backdrop-blur-xl shadow-sm dark:shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[2px] shadow-xl shadow-cyan-950/20 dark:shadow-cyan-950/40 shrink-0">
            <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-zinc-950 flex items-center justify-center text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 dark:text-white tracking-wider">
              {initials}
            </div>
          </div>

          <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5 w-full">
            <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white tracking-tight truncate max-w-full">
                {usuario.nombre}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shrink-0">
                <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {usuario.rol}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 flex items-center gap-1.5 sm:gap-2 break-all">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-zinc-500 shrink-0" />
              <span className="truncate">{usuario.email}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-500 dark:text-zinc-500 pt-1 sm:pt-2">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 dark:text-zinc-600 shrink-0" />
                Alta: {usuario.created_at ? new Date(usuario.created_at).toLocaleDateString("es-AR") : "N/A"}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 dark:text-zinc-600 shrink-0" />
                Último acceso: {usuario.last_login_at ? new Date(usuario.last_login_at).toLocaleString("es-AR") : "Reciente"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas Segmentada y Desplazable (Mobile-First) */}
      <div className="p-1.5 rounded-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full min-w-0">
        <button
          type="button"
          onClick={() => setTab("personal")}
          className={`shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            tab === "personal"
              ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Datos Personales</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("email")}
          className={`shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            tab === "email"
              ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <Mail className="w-4 h-4 shrink-0" />
          <span>Correo Electrónico</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("password")}
          className={`shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            tab === "password"
              ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <KeyRound className="w-4 h-4 shrink-0" />
          <span>Seguridad & Clave</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("biometria")}
          className={`shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap active:scale-[0.98] ${
            tab === "biometria"
              ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <Fingerprint className="w-4 h-4 shrink-0" />
          <span>Huella / Passkeys</span>
        </button>

        <button
          type="button"
          onClick={() => setTab("notificaciones")}
          className={`shrink-0 min-h-[44px] px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all relative flex items-center gap-2 whitespace-nowrap active:scale-[0.98] cursor-pointer ${
            tab === "notificaciones"
              ? "bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-sm"
              : "text-slate-600 hover:text-slate-900 dark:text-zinc-400 dark:hover:text-zinc-200"
          }`}
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>Alertas Push</span>
        </button>
      </div>

      {/* Contenido Pestaña 1: Datos Personales */}
      {tab === "personal" && (
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 sm:p-6 lg:p-8 backdrop-blur-md space-y-6 shadow-sm w-full min-w-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Información del Perfil</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Actualice su nombre público, teléfono de contacto y área de especialización en UPGRADE.
            </p>
          </div>

          {msgPersonal && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                msgPersonal.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
              }`}
            >
              {msgPersonal.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msgPersonal.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePersonal} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Nombre Completo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Teléfono / WhatsApp</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                    className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Especialidad / Área Técnica</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  placeholder="Ej: Redes & Cableado Estructurado, CCTV, Soporte Nivel 2"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loadingPersonal}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 active:scale-[0.98] disabled:opacity-50"
              >
                {loadingPersonal && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Guardar Cambios</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contenido Pestaña 2: Correo Electrónico */}
      {tab === "email" && (
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 sm:p-6 lg:p-8 backdrop-blur-md space-y-6 shadow-sm w-full min-w-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Cambiar Correo Electrónico</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Este correo es utilizado para iniciar sesión en el ERP. Requiere confirmar su contraseña actual por seguridad.
            </p>
          </div>

          {msgEmail && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                msgEmail.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
              }`}
            >
              {msgEmail.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msgEmail.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateEmail} className="space-y-5 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Nuevo Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  required
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Contraseña Actual (para confirmar)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={passwordParaEmail}
                  onChange={(e) => setPasswordParaEmail(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loadingEmail}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 active:scale-[0.98] disabled:opacity-50"
              >
                {loadingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Actualizar Correo</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contenido Pestaña 3: Contraseña */}
      {tab === "password" && (
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 sm:p-6 lg:p-8 backdrop-blur-md space-y-6 shadow-sm w-full min-w-0">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">Cambiar Contraseña</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Asegúrese de usar una contraseña segura con al menos 6 caracteres.
            </p>
          </div>

          {msgPassword && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                msgPassword.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
              }`}
            >
              {msgPassword.type === "success" ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{msgPassword.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Contraseña Actual</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Nueva Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 block">Confirmar Nueva Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-zinc-500 group-focus-within:text-cyan-600 dark:group-focus-within:text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={passwordConfirmar}
                  onChange={(e) => setPasswordConfirmar(e.target.value)}
                  placeholder="Repita la nueva contraseña"
                  required
                  className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-slate-50 dark:bg-zinc-950/80 border border-slate-200 dark:border-zinc-800 rounded-xl text-base sm:text-sm text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loadingPassword}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center justify-center gap-2 shadow-md shadow-cyan-950/40 active:scale-[0.98] disabled:opacity-50"
              >
                {loadingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Actualizar Contraseña</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contenido Pestaña 4: Autenticación Biométrica & Passkeys */}
      {tab === "biometria" && <BiometricEnrollment />}

      {/* Contenido Pestaña 5: Notificaciones Web Push Nativas */}
      {tab === "notificaciones" && (
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 p-4 sm:p-6 lg:p-8 backdrop-blur-md shadow-sm w-full min-w-0">
          <PushNotificationManager />
        </div>
      )}
    </div>
  );
}
