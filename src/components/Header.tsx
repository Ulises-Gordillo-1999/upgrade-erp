import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { getNotificaciones, ResumenNotificaciones } from "@/app/actions/notificaciones";
import { SessionUser } from "@/utils/auth";

interface Props {
  user?: SessionUser | null;
  notificaciones?: ResumenNotificaciones;
}

export async function Header({ notificaciones: notifProp }: Props) {
  const notificaciones = notifProp || (await getNotificaciones());

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

      {/* Lado Derecho: Centro de Alertas y Notificaciones */}
      <div className="flex items-center gap-3">
        <NotificationCenter initialNotificaciones={notificaciones} />
      </div>
    </header>
  );
}
