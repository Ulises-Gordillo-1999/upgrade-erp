"use server";

import { db, ensureDatabaseSchema } from "@/db";
import { bovedaSeguridad, tiposCredencialBoveda } from "@/db/schema";
import { desc, asc, eq } from "drizzle-orm";
import { BovedaSeguridad, TipoDatoBoveda, TipoCredencialBoveda } from "@/types/database";
import { revalidatePath } from "next/cache";
import CryptoJS from "crypto-js";
import { saveVaultFile } from "@/utils/vaultStorage";
import { registrarAuditoria } from "./auditoria";

// Helper to encrypt
function encryptData(text: string) {
  const secretKey =
    process.env.ENCRYPTION_KEY || "upgrade-super-secret-jwt-key-2026-xyz!";
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

// Helper to decrypt
function decryptData(ciphertext: string) {
  const secretKey =
    process.env.ENCRYPTION_KEY || "upgrade-super-secret-jwt-key-2026-xyz!";
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secretKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Error descifrando dato:", error);
    return "[Error de Decodificación]";
  }
}

export async function uploadBovedaFile(file: File, proyectoId: string) {
  try {
    const fileUrl = await saveVaultFile(file, proyectoId);
    return fileUrl;
  } catch (error: any) {
    console.error("Error al guardar archivo en la bóveda:", error);
    throw new Error(error.message || "Error al subir archivo a la bóveda");
  }
}

export async function getFileUrl(path: string) {
  // Las URLs ahora se sirven localmente optimizadas en /api/vault/...
  return path;
}

export async function registrarRevelacionBoveda(id: string, descripcion: string, tipo_dato: string) {
  await registrarAuditoria({
    modulo: "Boveda",
    accion: "Revelar Secreto",
    detalle: `Visualizó / desocultó credencial '${tipo_dato} - ${descripcion}' (ID: ${id})`,
  });
}

export async function getBovedaData(proyecto_id?: string) {
  try {
    const list = await db.query.bovedaSeguridad.findMany({
      where: proyecto_id ? eq(bovedaSeguridad.proyecto_id, proyecto_id) : undefined,
      with: {
        proyecto: {
          with: {
            cliente: true,
          },
        },
      },
      orderBy: [desc(bovedaSeguridad.created_at)],
    });

    const decryptedData = list.map((record) => {
      const clienteData = record.proyecto?.cliente;
      return {
        id: record.id,
        proyecto_id: record.proyecto_id,
        tipo_dato: record.tipo_dato,
        descripcion: record.descripcion,
        valor_encriptado: record.valor_encriptado || undefined,
        archivo_url: record.archivo_url || undefined,
        created_at: record.created_at ? record.created_at.toISOString() : undefined,
        proyecto: record.proyecto
          ? {
              id: record.proyecto.id,
              notas_tecnicas: record.proyecto.notas_tecnicas,
              estado: record.proyecto.estado,
              created_at: record.proyecto.created_at
                ? record.proyecto.created_at.toISOString()
                : undefined,
              cliente: clienteData
                ? {
                    id: clienteData.id,
                    nombre_razon_social: clienteData.nombre_razon_social,
                    telefono: clienteData.telefono,
                    cuit_cuil: clienteData.cuit_cuil,
                  }
                : null,
            }
          : null,
        proyectos: record.proyecto
          ? {
              id: record.proyecto.id,
              notas_tecnicas: record.proyecto.notas_tecnicas,
              clientes: clienteData
                ? {
                    id: clienteData.id,
                    nombre_razon_social: clienteData.nombre_razon_social,
                  }
                : null,
            }
          : null,
        valor_desencriptado: record.valor_encriptado
          ? decryptData(record.valor_encriptado)
          : null,
      };
    });

    return decryptedData;
  } catch (error: any) {
    console.error("Error al obtener datos de bóveda:", error);
    throw new Error(error.message || "Error al obtener datos de bóveda");
  }
}

export async function createBovedaRecord(data: {
  proyecto_id: string;
  tipo_dato: TipoDatoBoveda;
  descripcion: string;
  valor_real: string;
  archivo_url?: string;
}) {
  try {
    await ensureDatabaseSchema();

    if (!data.proyecto_id) {
      return { success: false, error: "Falta el ID del proyecto vinculado" };
    }
    if (!data.valor_real) {
      return { success: false, error: "El valor secreto es obligatorio" };
    }

    const valor_encriptado = encryptData(data.valor_real);

    const [newRecord] = await db
      .insert(bovedaSeguridad)
      .values({
        proyecto_id: data.proyecto_id,
        tipo_dato: data.tipo_dato,
        descripcion: data.descripcion,
        valor_encriptado,
        archivo_url: data.archivo_url || null,
      } as any)
      .returning();

    await registrarAuditoria({
      modulo: "Boveda",
      accion: "Crear Credencial",
      detalle: `Guardó credencial '${data.tipo_dato} - ${data.descripcion}' en proyecto ${data.proyecto_id}${data.archivo_url ? " (con adjunto)" : ""}`,
    });

    revalidatePath("/boveda");
    revalidatePath("/proyectos");
    revalidatePath(`/proyectos/${data.proyecto_id}`);

    return {
      success: true,
      data: {
        ...newRecord,
        created_at: newRecord.created_at ? newRecord.created_at.toISOString() : undefined,
      } as unknown as BovedaSeguridad,
    };
  } catch (error: any) {
    console.error("Error al guardar credencial:", error);
    return {
      success: false,
      error: error.message || "Error al guardar credencial en la base de datos",
    };
  }
}

export async function updateBovedaRecord(
  id: string,
  data: {
    tipo_dato?: TipoDatoBoveda;
    descripcion?: string;
    valor_real?: string;
    archivo_url?: string | null;
  }
) {
  try {
    await ensureDatabaseSchema();
    const payload: any = {};
    if (data.tipo_dato) payload.tipo_dato = data.tipo_dato;
    if (data.descripcion) payload.descripcion = data.descripcion;
    if (data.archivo_url !== undefined) payload.archivo_url = data.archivo_url;

    if (data.valor_real) {
      payload.valor_encriptado = encryptData(data.valor_real);
    }

    const [updated] = await db
      .update(bovedaSeguridad)
      .set(payload)
      .where(eq(bovedaSeguridad.id, id))
      .returning();

    await registrarAuditoria({
      modulo: "Boveda",
      accion: "Modificar Credencial",
      detalle: `Actualizó credencial ID ${id} (${payload.tipo_dato || ""} - ${payload.descripcion || ""})`,
    });

    revalidatePath("/boveda");
    revalidatePath("/proyectos");

    return {
      success: true,
      data: {
        ...updated,
        created_at: updated.created_at ? updated.created_at.toISOString() : undefined,
      } as unknown as BovedaSeguridad,
    };
  } catch (error: any) {
    console.error("Error al actualizar credencial:", error);
    return {
      success: false,
      error: error.message || "Error al actualizar credencial",
    };
  }
}

export async function deleteBovedaRecord(id: string) {
  try {
    await ensureDatabaseSchema();
    const existing = await db.query.bovedaSeguridad.findFirst({
      where: eq(bovedaSeguridad.id, id),
    });

    await db.delete(bovedaSeguridad).where(eq(bovedaSeguridad.id, id));

    await registrarAuditoria({
      modulo: "Boveda",
      accion: "Eliminar Credencial",
      detalle: `Eliminó credencial ID ${id}${existing ? ` (${existing.tipo_dato} - ${existing.descripcion})` : ""}`,
    });

    revalidatePath("/boveda");
    revalidatePath("/proyectos");
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar credencial:", error);
    return {
      success: false,
      error: error.message || "Error al eliminar credencial",
    };
  }
}

// -----------------------------------------------------------------------------
// GESTIÓN DE TIPOS DE CREDENCIALES DINÁMICAS
// -----------------------------------------------------------------------------

const DEFAULT_TIPOS_CREDENCIAL = [
  "Contraseña / Token",
  "IP Pública / Subred",
  "ID AnyDesk / RustDesk / TeamViewer",
  "Configuración de Router / Switch",
  "Otro dato sensible",
];

export async function getTiposCredencial(): Promise<TipoCredencialBoveda[]> {
  try {
    await ensureDatabaseSchema();
    let rows = await db
      .select()
      .from(tiposCredencialBoveda)
      .orderBy(asc(tiposCredencialBoveda.nombre));

    if (rows.length === 0) {
      await db
        .insert(tiposCredencialBoveda)
        .values(DEFAULT_TIPOS_CREDENCIAL.map((nombre) => ({ nombre })) as any);

      rows = await db
        .select()
        .from(tiposCredencialBoveda)
        .orderBy(asc(tiposCredencialBoveda.nombre));
    }

    return rows.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      created_at: r.created_at ? r.created_at.toISOString() : undefined,
    }));
  } catch (error: any) {
    console.warn("Aviso al obtener tipos de credencial (fallback):", error);
    return DEFAULT_TIPOS_CREDENCIAL.map((nombre, i) => ({
      id: `default-${i}`,
      nombre,
    }));
  }
}

export async function createTipoCredencial(data: { nombre: string }) {
  try {
    await ensureDatabaseSchema();
    const nombreLimpio = data.nombre.trim();
    if (!nombreLimpio) throw new Error("El nombre no puede estar vacío");

    const [created] = await db
      .insert(tiposCredencialBoveda)
      .values({ nombre: nombreLimpio })
      .returning();

    revalidatePath("/boveda");
    revalidatePath("/proyectos");

    return {
      id: created.id,
      nombre: created.nombre,
      created_at: created.created_at ? created.created_at.toISOString() : undefined,
    } as TipoCredencialBoveda;
  } catch (error: any) {
    console.error("Error al crear tipo de credencial:", error);
    throw new Error(error.message || "Error al crear tipo de credencial");
  }
}

export async function updateTipoCredencial(id: string, data: { nombre: string }) {
  try {
    await ensureDatabaseSchema();
    const nombreLimpio = data.nombre.trim();
    if (!nombreLimpio) throw new Error("El nombre no puede estar vacío");

    const existing = await db
      .select()
      .from(tiposCredencialBoveda)
      .where(eq(tiposCredencialBoveda.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Tipo de credencial no encontrado");
    }

    const oldNombre = existing[0].nombre;

    const [updated] = await db
      .update(tiposCredencialBoveda)
      .set({ nombre: nombreLimpio })
      .where(eq(tiposCredencialBoveda.id, id))
      .returning();

    // Actualizar credenciales que usaban el nombre anterior
    if (oldNombre !== nombreLimpio) {
      await db
        .update(bovedaSeguridad)
        .set({ tipo_dato: nombreLimpio })
        .where(eq(bovedaSeguridad.tipo_dato, oldNombre));
    }

    revalidatePath("/boveda");
    revalidatePath("/proyectos");

    return {
      id: updated.id,
      nombre: updated.nombre,
      created_at: updated.created_at ? updated.created_at.toISOString() : undefined,
    } as TipoCredencialBoveda;
  } catch (error: any) {
    console.error("Error al actualizar tipo de credencial:", error);
    throw new Error(error.message || "Error al actualizar tipo de credencial");
  }
}

export async function deleteTipoCredencial(id: string) {
  try {
    await ensureDatabaseSchema();

    const existing = await db
      .select()
      .from(tiposCredencialBoveda)
      .where(eq(tiposCredencialBoveda.id, id))
      .limit(1);

    if (existing.length > 0) {
      const oldNombre = existing[0].nombre;
      await db
        .update(bovedaSeguridad)
        .set({ tipo_dato: "Otro dato sensible" })
        .where(eq(bovedaSeguridad.tipo_dato, oldNombre));
    }

    await db.delete(tiposCredencialBoveda).where(eq(tiposCredencialBoveda.id, id));
    revalidatePath("/boveda");
    revalidatePath("/proyectos");
    return true;
  } catch (error: any) {
    console.error("Error al eliminar tipo de credencial:", error);
    throw new Error(error.message || "Error al eliminar tipo de credencial");
  }
}
