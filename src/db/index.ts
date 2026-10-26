import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgrespassword@127.0.0.1:5432/upgrade_db";

const globalForDb = globalThis as unknown as {
  conn: postgres.Sql | undefined;
  schemaChecked?: boolean;
};

export const conn = globalForDb.conn ?? postgres(connectionString, { max: 10 });
if (process.env.NODE_ENV !== "production") globalForDb.conn = conn;

export const db = drizzle(conn, { schema });

/**
 * Auto-migración idempotente y resiliente:
 * Asegura que las tablas y columnas añadidas en nuevas versiones existan en la base de datos de producción
 * sin necesidad de ejecutar comandos DDL manuales por SSH o arriesgar caídas por falta de migraciones.
 */
export async function ensureDatabaseSchema() {
  if (globalForDb.schemaChecked) return;

  const queries = [
    `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`,
    `CREATE TABLE IF NOT EXISTS categorias_inventario (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre TEXT NOT NULL UNIQUE,
      tipo_asociado TEXT NOT NULL DEFAULT 'Producto',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `ALTER TABLE inventario ADD COLUMN IF NOT EXISTS categoria TEXT;`,
    `ALTER TABLE boveda_seguridad ALTER COLUMN tipo_dato TYPE TEXT;`,
    `CREATE TABLE IF NOT EXISTS tipos_credencial_boveda (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre TEXT NOT NULL UNIQUE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `ALTER TABLE transacciones ALTER COLUMN categoria TYPE TEXT;`,
    `CREATE TABLE IF NOT EXISTS categorias_finanzas (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      nombre TEXT NOT NULL UNIQUE,
      tipo_asociado TEXT NOT NULL DEFAULT 'Ambos',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );`,
    `UPDATE transacciones SET categoria = 'Hardware / Materiales' WHERE categoria = 'Hardware';`,
    `UPDATE transacciones SET categoria = 'Servicios Cloud' WHERE categoria = 'Cloud';`,
    `UPDATE transacciones SET categoria = 'Movilidad / Viáticos' WHERE categoria = 'Movilidad';`,
    `UPDATE transacciones SET categoria = 'Abono Mensual' WHERE categoria = 'Abono';`,
  ];

  for (const q of queries) {
    try {
      await conn.unsafe(q);
    } catch (err) {
      // Ignorar si ya está aplicada
    }
  }

  globalForDb.schemaChecked = true;
}

// Ejecución no bloqueante al inicio del runtime en el servidor
if (typeof window === "undefined" && process.env.NEXT_PHASE !== "phase-production-build") {
  ensureDatabaseSchema().catch(() => {});
}


