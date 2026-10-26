import { getSession } from "@/utils/auth";
import { getLogsAuditoria } from "@/app/actions/auditoria";
import { AuditoriaTable } from "@/components/auditoria/AuditoriaTable";
import { ShieldCheck, History } from "lucide-react";
import { redirect } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Auditoría & Trazabilidad | UPGRADE ERP",
  description: "Registro cronológico inmutable de actividades y operaciones críticas de seguridad",
};

export default async function AuditoriaPage() {
  const session = await getSession();

  // Protección de ruta: Solo SuperAdmin y Admin
  if (!session || (session.rol !== "SuperAdmin" && session.rol !== "Admin")) {
    redirect("/");
  }

  const logs = await getLogsAuditoria();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-slate-900 text-white dark:bg-zinc-800 dark:text-cyan-400 rounded-xl">
              <ShieldCheck className="w-6 h-6" />
            </span>
            Auditoría & Trazabilidad
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 mt-1 text-xs sm:text-sm">
            Registro cronológico inmutable de movimientos financieros, revelación de credenciales, cierres de obra y cambios administrativos.
          </p>
        </div>
      </div>

      {/* Tabla y Filtros de Auditoría */}
      <AuditoriaTable logs={logs} />
    </div>
  );
}
