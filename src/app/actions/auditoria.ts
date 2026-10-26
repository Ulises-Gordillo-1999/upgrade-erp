"use server";

import { db, ensureDatabaseSchema } from "@/db";
import { auditoria } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getSession } from "@/utils/auth";
import { LogAuditoria } from "@/types/database";

export async function registrarAuditoria(data: {
  accion: string;
  modulo: "Finanzas" | "Boveda" | "Proyectos" | "Inventario" | "Usuarios" | "Seguridad" | "General";
  detalle: string;
  ip_address?: string;
}) {
  try {
    await ensureDatabaseSchema();
    const session = await getSession();

    const usuario_id = session?.id || null;
    const usuario_nombre = session?.nombre || "Sistema / Automático";
    const usuario_rol = session?.rol || "Sistema";

    await db.insert(auditoria).values({
      usuario_id,
      usuario_nombre,
      usuario_rol,
      accion: data.accion,
      modulo: data.modulo,
      detalle: data.detalle,
      ip_address: data.ip_address || null,
    });
  } catch (error) {
    // La auditoría nunca debe romper la operación principal del usuario
    console.error("Error registrando log de auditoría:", error);
  }
}

export async function getLogsAuditoria(filtros?: {
  modulo?: string;
  limit?: number;
}): Promise<LogAuditoria[]> {
  try {
    await ensureDatabaseSchema();
    const maxLimit = filtros?.limit || 150;

    const query = db
      .select()
      .from(auditoria)
      .orderBy(desc(auditoria.created_at))
      .limit(maxLimit);

    const list = await query;

    return list.map((l) => ({
      id: l.id,
      usuario_id: l.usuario_id,
      usuario_nombre: l.usuario_nombre,
      usuario_rol: l.usuario_rol,
      accion: l.accion,
      modulo: l.modulo as any,
      detalle: l.detalle,
      ip_address: l.ip_address,
      created_at: l.created_at ? l.created_at.toISOString() : undefined,
    }));
  } catch (error: any) {
    console.error("Error obteniendo logs de auditoría:", error);
    return [];
  }
}
