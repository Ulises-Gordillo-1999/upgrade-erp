import { NotificationCenter } from "@/components/notifications/NotificationCenter";
import { getNotificaciones, ResumenNotificaciones } from "@/app/actions/notificaciones";
import { SessionUser } from "@/utils/auth";
import { HeaderClock } from "@/components/HeaderClock";
import { formatFechaArgentina, formatHoraArgentina } from "@/utils/date";

interface Props {
  user?: SessionUser | null;
  notificaciones?: ResumenNotificaciones;
}

export async function Header({ notificaciones: notifProp }: Props) {
  const notificaciones = notifProp || (await getNotificaciones());

  const now = new Date();
  const initialFecha = formatFechaArgentina(now, true, false);
  const initialHora = formatHoraArgentina(now, false);

  return (
    <header className="hidden lg:flex h-16 border-b border-slate-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md px-6 lg:px-8 items-center justify-between shrink-0 transition-colors z-20">
      {/* Lado Izquierdo: Estado Operativo, Fecha y Reloj en Vivo (Argentina) */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-semibold">ERP Conectado</span>
        </div>
        <HeaderClock initialFecha={initialFecha} initialHora={initialHora} />
      </div>

      {/* Lado Derecho: Centro de Alertas y Notificaciones */}
      <div className="flex items-center gap-3">
        <NotificationCenter initialNotificaciones={notificaciones} />
      </div>
    </header>
  );
}
