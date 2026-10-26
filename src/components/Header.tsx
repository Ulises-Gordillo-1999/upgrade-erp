import Link from "next/link";
import { SessionUser } from "@/utils/auth";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { getNotificaciones, ResumenNotificaciones } from "@/app/actions/notificaciones";
import { ShieldCheck } from "lucide-react";

interface Props {
  user?: SessionUser | null;
  notificaciones?: ResumenNotificaciones;
}

export async function Header({ user, notificaciones: notifProp }: Props) {
  const notificaciones = notifProp || (await getNotificaciones());

  const userInitials = user?.nombre
    ? user.nombre.slice(0, 2).toUpperCase()
    : "UP";

  const todayStr = new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const formattedDate = todayStr.charAt(0).toUpperCase() + todayStr.slice(1);

  return (
    <header className="hidden lg:flex h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 lg:px-8 items-center justify-between shrink-0 transition-colors z-20">
      {/* Lado Izquierdo: Estado Operativo y Fecha */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">ERP Conectado</span>
        </div>
        <span className="text-xs text-slate-400 dark:text-zinc-500">
          {formattedDate}
        </span>
      </div>

      {/* Lado Derecho: Alertas, Tema y Perfil */}
      <div className="flex items-center gap-3">
        <NotificationCenter initialNotificaciones={notificaciones} />

        <div className="h-5 w-px bg-slate-200 dark:border-zinc-800" />

        <ThemeToggle />

        <div className="h-5 w-px bg-slate-200 dark:border-zinc-800" />

        <Link
          href="/perfil"
          className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors group cursor-pointer"
          title="Mi Perfil de Usuario"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-inner ring-1 ring-white/20">
            {userInitials}
          </div>
          <div className="text-left hidden xl:block min-w-0 max-w-[130px]">
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
              {user?.nombre || "Usuario"}
            </p>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-medium truncate">
              {user?.rol || "Técnico"}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
