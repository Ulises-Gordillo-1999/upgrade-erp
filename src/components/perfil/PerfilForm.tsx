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
} from "lucide-react";
import { updateMiPerfil, cambiarMiEmail, cambiarMiPassword } from "@/app/actions/perfil";

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
  // Pestaña activa: 'personal' | 'email' | 'password'
  const [tab, setTab] = useState<"personal" | "email" | "password">("personal");

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
    <div className="space-y-8 max-w-4xl">
      {/* Tarjeta de Identidad Superior (Hero Banner) */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 p-[2px] shadow-xl shadow-cyan-950/40">
            <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-white tracking-wider">
              {initials}
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                {usuario.nombre}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                <Shield className="w-3.5 h-3.5" />
                {usuario.rol}
              </span>
            </div>

            <p className="text-sm text-zinc-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-zinc-500" />
              {usuario.email}
            </p>

            <div className="flex items-center gap-4 text-xs text-zinc-500 pt-2 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-zinc-600" />
                Alta: {usuario.created_at ? new Date(usuario.created_at).toLocaleDateString("es-AR") : "N/A"}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-600" />
                Último acceso: {usuario.last_login_at ? new Date(usuario.last_login_at).toLocaleString("es-AR") : "Reciente"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navegación por Pestañas */}
      <div className="flex border-b border-zinc-800 space-x-2">
        <button
          onClick={() => setTab("personal")}
          className={`pb-3 px-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
            tab === "personal" ? "text-cyan-400" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <User className="w-4 h-4" />
          Datos Personales
          {tab === "personal" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          )}
        </button>

        <button
          onClick={() => setTab("email")}
          className={`pb-3 px-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
            tab === "email" ? "text-cyan-400" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Mail className="w-4 h-4" />
          Correo Electrónico
          {tab === "email" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          )}
        </button>

        <button
          onClick={() => setTab("password")}
          className={`pb-3 px-4 text-sm font-medium transition-all relative flex items-center gap-2 ${
            tab === "password" ? "text-cyan-400" : "text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <KeyRound className="w-4 h-4" />
          Seguridad & Contraseña
          {tab === "password" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          )}
        </button>
      </div>

      {/* Contenido Pestaña 1: Datos Personales */}
      {tab === "personal" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Información del Perfil</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Actualice su nombre público, teléfono de contacto y área de especialización en UPGRADE.
            </p>
          </div>

          {msgPersonal && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                msgPersonal.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
              }`}
            >
              {msgPersonal.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msgPersonal.text}
            </div>
          )}

          <form onSubmit={handleUpdatePersonal} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Nombre Completo</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 block">Teléfono / WhatsApp</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="+54 9 11 1234-5678"
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Especialidad / Área Técnica</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400">
                  <Wrench className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={especialidad}
                  onChange={(e) => setEspecialidad(e.target.value)}
                  placeholder="Ej: Redes & Cableado Estructurado, CCTV, Soporte Nivel 2"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loadingPersonal}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/40 disabled:opacity-50"
              >
                {loadingPersonal && <Loader2 className="w-4 h-4 animate-spin" />}
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contenido Pestaña 2: Correo Electrónico */}
      {tab === "email" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Cambiar Correo Electrónico</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Este correo es utilizado para iniciar sesión en el ERP. Requiere confirmar su contraseña actual por seguridad.
            </p>
          </div>

          {msgEmail && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                msgEmail.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
              }`}
            >
              {msgEmail.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msgEmail.text}
            </div>
          )}

          <form onSubmit={handleUpdateEmail} className="space-y-5 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Nuevo Correo Electrónico</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={nuevoEmail}
                  onChange={(e) => setNuevoEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Contraseña Actual (para confirmar)</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={passwordParaEmail}
                  onChange={(e) => setPasswordParaEmail(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loadingEmail}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/40 disabled:opacity-50"
              >
                {loadingEmail && <Loader2 className="w-4 h-4 animate-spin" />}
                Actualizar Correo
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contenido Pestaña 3: Contraseña */}
      {tab === "password" && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 backdrop-blur-md space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white">Cambiar Contraseña</h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Asegúrese de usar una contraseña segura con al menos 6 caracteres.
            </p>
          </div>

          {msgPassword && (
            <div
              className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
                msgPassword.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
              }`}
            >
              {msgPassword.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              {msgPassword.text}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-5 max-w-lg">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Contraseña Actual</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Nueva Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={passwordNueva}
                  onChange={(e) => setPasswordNueva(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 block">Confirmar Nueva Contraseña</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-cyan-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={passwordConfirmar}
                  onChange={(e) => setPasswordConfirmar(e.target.value)}
                  placeholder="Repita la nueva contraseña"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/80 border border-zinc-800 rounded-xl text-sm text-zinc-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loadingPassword}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all flex items-center gap-2 shadow-lg shadow-cyan-950/40 disabled:opacity-50"
              >
                {loadingPassword && <Loader2 className="w-4 h-4 animate-spin" />}
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
