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
  if (process.env.NEXT_PHASE === "phase-production-build") return;

  try {
    await conn.unsafe(`
      CREATE TABLE IF NOT EXISTS categorias_inventario (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        nombre TEXT NOT NULL UNIQUE,
        tipo_asociado TEXT NOT NULL DEFAULT 'Producto',
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      ALTER TABLE inventario ADD COLUMN IF NOT EXISTS categoria TEXT;
    `);
    globalForDb.schemaChecked = true;
  } catch (err) {
    console.warn("Aviso en ensureDatabaseSchema:", err);
  }
}

// Ejecución no bloqueante al inicio del runtime en el servidor
if (typeof window === "undefined" && process.env.NEXT_PHASE !== "phase-production-build") {
  ensureDatabaseSchema().catch(() => {});
}


