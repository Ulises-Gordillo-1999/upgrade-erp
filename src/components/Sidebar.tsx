"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  FolderGit2,
  ShieldAlert,
  ShieldCheck,
  DollarSign,
  LogOut,
  UserCog,
  Menu,
  X,
} from "lucide-react";
import { logoutUser } from "@/app/actions/auth";
import { SessionUser } from "@/utils/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { ResumenNotificaciones } from "@/app/actions/notificaciones";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, superAdminOnly: false },
  { name: "Finanzas", href: "/finanzas", icon: DollarSign, superAdminOnly: false },
  { name: "Clientes", href: "/clientes", icon: Users, superAdminOnly: false },
  { name: "Inventario", href: "/inventario", icon: Package, superAdminOnly: false },
  { name: "Proyectos", href: "/proyectos", icon: FolderGit2, superAdminOnly: false },
  { name: "Bóveda Segura", href: "/boveda", icon: ShieldAlert, superAdminOnly: false },
  { name: "Usuarios / Equipo", href: "/usuarios", icon: UserCog, superAdminOnly: true },
  { name: "Auditoría", href: "/auditoria", icon: ShieldCheck, superAdminOnly: true },
];

export function Sidebar({
  user,
  notificaciones,
}: {
  user?: SessionUser | null;
  notificaciones?: ResumenNotificaciones;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const userInitials = user?.nombre
    ? user.nombre.slice(0, 2).toUpperCase()
    : "UP";

  const isSuperAdmin = user?.rol === "SuperAdmin";

  // Cerrar el drawer automáticamente al cambiar de ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Cerrar el drawer con la tecla Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsMobileOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Función auxiliar para renderizar los enlaces de navegación
  const renderNavLinks = (onItemClick?: () => void) => (
    <>
      {navigation.map((item) => {
        if (item.superAdminOnly && !isSuperAdmin) {
          return null;
        }

        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href));

        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onItemClick}
            className={`group flex items-center px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-semibold border border-cyan-500/20 shadow-sm"
                : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-100"
            }`}
          >
            <item.icon
              className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                isActive
                  ? "text-cyan-600 dark:text-cyan-400"
                  : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300"
              }`}
              aria-hidden="true"
            />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  // Footer con selector de tema, perfil de usuario y logout
  const renderUserFooter = (onItemClick?: () => void) => (
    <div className="border-t border-slate-200 dark:border-zinc-800 p-3 bg-slate-50/70 dark:bg-zinc-950/60 space-y-2.5 transition-colors">
      <ThemeToggle />

      <div className="flex items-center justify-between pt-1">
        <Link
          href="/perfil"
          onClick={onItemClick}
          className="flex items-center min-w-0 hover:opacity-85 transition-opacity group cursor-pointer"
          title="Ir a Mi Perfil"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner flex-shrink-0 group-hover:ring-2 group-hover:ring-cyan-500/50 transition-all">
            {userInitials}
          </div>
          <div className="ml-2.5 truncate">
            <p className="text-xs font-medium text-slate-800 dark:text-white truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
              {user?.nombre || "Usuario"}
            </p>
            <p className="text-[10px] font-medium text-cyan-600 dark:text-cyan-400 truncate">
              {user?.rol || "Técnico"}
            </p>
          </div>
        </Link>

        <form action={logoutUser}>
          <button
            type="submit"
            title="Cerrar sesión"
            className="p-1.5 text-slate-400 dark:text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Header Superior Móvil y Tablet (< lg) */}
      <header className="lg:hidden flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6 border-b border-slate-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shrink-0 z-30 transition-colors">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
            aria-label="Abrir menú de navegación"
          >
            <Menu className="w-6 h-6" />
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <h1 className="text-lg sm:text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 group-hover:opacity-90 transition-opacity">
              UPGRADE
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-mono font-medium">
              ERP
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <NotificationCenter initialNotificaciones={notificaciones} />
          <Link
            href="/perfil"
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-cyan-500/30 transition-all"
            title="Mi Perfil"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              {userInitials}
            </div>
          </Link>
        </div>
      </header>

      {/* 2. Backdrop Overlay para Móvil y Tablet */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* 3. Cajón Deslizante (Drawer) para Móvil y Tablet (< lg) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] flex flex-col bg-white dark:bg-zinc-950 border-r border-slate-200 dark:border-zinc-800 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Menú principal móvil"
      >
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-200 dark:border-zinc-800">
          <Link
            href="/"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center gap-2 group"
          >
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500">
              UPGRADE
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-mono font-medium">
              ERP
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-800/60 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
          {renderNavLinks(() => setIsMobileOpen(false))}
        </nav>

        {renderUserFooter(() => setIsMobileOpen(false))}
      </aside>

      {/* 4. Barra Lateral Fija para Escritorio (>= lg / 1024px) */}
      <aside className="hidden lg:flex h-full w-64 flex-col border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shrink-0 transition-colors">
        <div className="flex h-16 items-center px-6 border-b border-slate-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2 group">
            <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-400 dark:to-blue-500 group-hover:opacity-90 transition-opacity">
              UPGRADE
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 font-mono font-medium">
              ERP
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {renderNavLinks()}
        </nav>

        {renderUserFooter()}
      </aside>
    </>
  );
}
