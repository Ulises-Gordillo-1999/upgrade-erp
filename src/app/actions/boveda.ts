"use server";

import { db } from "@/db";
import { bovedaSeguridad } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { BovedaSeguridad, TipoDatoBoveda } from "@/types/database";
import CryptoJS from "crypto-js";
import { saveVaultFile } from "@/utils/vaultStorage";

// Helper to encrypt
function encryptData(text: string) {
  const secretKey = process.env.ENCRYPTION_KEY;
  if (!secretKey) throw new Error("ENCRYPTION_KEY no está configurada");
  return CryptoJS.AES.encrypt(text, secretKey).toString();
}

// Helper to decrypt
function decryptData(ciphertext: string) {
  const secretKey = process.env.ENCRYPTION_KEY;
  if (!secretKey) throw new Error("ENCRYPTION_KEY no está configurada");
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
      return {
        id: record.id,
        proyecto_id: record.proyecto_id,
        tipo_dato: record.tipo_dato,
        descripcion: record.descripcion,
        valor_encriptado: record.valor_encriptado || undefined,
        archivo_url: record.archivo_url || undefined,
        created_at: record.created_at ? record.created_at.toISOString() : undefined,
        proyectos: record.proyecto
          ? {
              clientes: record.proyecto.cliente
                ? { nombre_razon_social: record.proyecto.cliente.nombre_razon_social }
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

    return {
      ...newRecord,
      created_at: newRecord.created_at ? newRecord.created_at.toISOString() : undefined,
    } as unknown as BovedaSeguridad;
  } catch (error: any) {
    console.error("Error al guardar credencial:", error);
    throw new Error(error.message || "Error al guardar credencial");
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

    return {
      ...updated,
      created_at: updated.created_at ? updated.created_at.toISOString() : undefined,
    } as unknown as BovedaSeguridad;
  } catch (error: any) {
    console.error("Error al actualizar credencial:", error);
    throw new Error(error.message || "Error al actualizar credencial");
  }
}

export async function deleteBovedaRecord(id: string) {
  try {
    await db.delete(bovedaSeguridad).where(eq(bovedaSeguridad.id, id));
    return true;
  } catch (error: any) {
    console.error("Error al eliminar credencial:", error);
    throw new Error(error.message || "Error al eliminar credencial");
  }
}
