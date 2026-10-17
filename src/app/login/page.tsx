import { LoginForm } from "@/components/auth/LoginForm";
import { Server, Shield } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceso al Sistema | UPGRADE ERP",
  description: "Portal seguro de autenticación para UPGRADE IT Infrastructure",
};

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-slate-50 dark:bg-zinc-950 transition-colors">
      {/* Luces ambientales / Glow decorativo */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-600/10 dark:bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-900/5 rounded-full blur-[180px] pointer-events-none" />

      {/* Grid pattern sutil de fondo */}
      <div 
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.03] pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />

      <div className="relative z-10 w-full max-w-[440px]">
        {/* Tarjeta de Login Glassmorphic */}
        <div className="backdrop-blur-2xl bg-white/80 dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800/80 rounded-3xl p-7 sm:p-9 shadow-2xl shadow-slate-300/40 dark:shadow-black/80 ring-1 ring-black/5 dark:ring-white/5">
          {/* Header con Isotipo y Marca */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 p-[1px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full rounded-2xl bg-slate-100 dark:bg-zinc-950 flex items-center justify-center">
                  <Server className="w-7 h-7 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-zinc-950 flex items-center justify-center">
                <Shield className="w-2.5 h-2.5 text-white dark:text-zinc-950" />
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-700/60 text-[11px] font-medium text-cyan-700 dark:text-cyan-400 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-600 dark:bg-cyan-400 animate-pulse" />
              UPGRADE • Enterprise ERP
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Iniciar Sesión
            </h1>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-[280px]">
              Plataforma de gestión de infraestructura IT y administración de proyectos.
            </p>
          </div>

          {/* Formulario Interactivo */}
          <LoginForm />
        </div>

        {/* Footer corporativo */}
        <div className="text-center mt-6 text-[11px] text-slate-400 dark:text-zinc-600 space-y-1">
          <p>© {new Date().getFullYear()} UPGRADE IT Services. Todos los derechos reservados.</p>
          <p className="text-[10px] text-slate-400 dark:text-zinc-700">Autenticación local segura con PostgreSQL & JWT</p>
        </div>
      </div>
    </div>
  );
}
