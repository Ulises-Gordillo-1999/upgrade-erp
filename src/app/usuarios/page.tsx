import { getUsuarios } from "@/app/actions/usuarios";
import { getSession } from "@/utils/auth";
import { UsuariosTable } from "@/components/usuarios/UsuariosTable";
import { UsuarioFormModal } from "@/components/usuarios/UsuarioFormModal";
import { Users, Shield, Wrench } from "lucide-react";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Gestión de Usuarios | UPGRADE ERP",
  description: "Administración de técnicos, roles y accesos al sistema UPGRADE",
};

export default async function UsuariosPage() {
  const session = await getSession();

  // Protección de ruta: Solo SuperAdmin
  if (!session || session.rol !== "SuperAdmin") {
    redirect("/");
  }

  const usuarios = await getUsuarios();

  const totalUsuarios = usuarios.length;
  const totalTecnicos = usuarios.filter((u) => u.rol === "Tecnico").length;
  const activos = usuarios.filter((u) => u.activo).length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header y Botón Nuevo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Equipo & Usuarios
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-xs sm:text-sm">
            Control de roles (RBAC), altas de técnicos y administración de credenciales de acceso.
          </p>
        </div>
        <UsuarioFormModal isEdit={false} />
      </div>

      {/* Mini Métricas de Equipo */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Total Usuarios</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{totalUsuarios}</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Técnicos Registrados</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{totalTecnicos}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Wrench className="w-5 h-5" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-sm p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Cuentas Activas</p>
            <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">{activos}</p>
          </div>
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Shield className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabla Interactiva */}
      <UsuariosTable usuarios={usuarios} currentUserId={session.id} />
    </div>
  );
}
