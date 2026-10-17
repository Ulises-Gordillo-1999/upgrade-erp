"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Package,
  FolderGit2,
  ShieldAlert,
  DollarSign,
  LogOut,
  UserCog,
} from "lucide-react";
import { logoutUser } from "@/app/actions/auth";
import { SessionUser } from "@/utils/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard, superAdminOnly: false },
  { name: "Finanzas", href: "/finanzas", icon: DollarSign, superAdminOnly: false },
  { name: "Clientes", href: "/clientes", icon: Users, superAdminOnly: false },
  { name: "Inventario", href: "/inventario", icon: Package, superAdminOnly: false },
  { name: "Proyectos", href: "/proyectos", icon: FolderGit2, superAdminOnly: false },
  { name: "Bóveda Segura", href: "/boveda", icon: ShieldAlert, superAdminOnly: false },
  { name: "Usuarios / Equipo", href: "/usuarios", icon: UserCog, superAdminOnly: true },
];

export function Sidebar({ user }: { user?: SessionUser | null }) {
  const pathname = usePathname();

  const userInitials = user?.nombre
    ? user.nombre.slice(0, 2).toUpperCase()
    : "UP";

  const isSuperAdmin = user?.rol === "SuperAdmin";

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 transition-colors">
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
        {navigation.map((item) => {
          // Ocultar sección de usuarios si no es SuperAdmin
          if (item.superAdminOnly && !isSuperAdmin) {
            return null;
          }

          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 font-semibold border border-cyan-500/20 shadow-sm"
                  : "text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800/50 hover:text-slate-900 dark:hover:text-zinc-100"
              }`}
            >
              <item.icon
                className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200 ${
                  isActive ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 dark:text-zinc-500 group-hover:text-slate-600 dark:group-hover:text-zinc-300"
                }`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer con Selector de Tema, Mi Perfil y Logout */}
      <div className="border-t border-slate-200 dark:border-zinc-800 p-3 bg-slate-50/70 dark:bg-zinc-950/60 space-y-2.5 transition-colors">
        {/* Selector de Modo Claro / Oscuro / Sistema */}
        <ThemeToggle />

        <div className="flex items-center justify-between pt-1">
          <Link
            href="/perfil"
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
    </div>
  );
}
