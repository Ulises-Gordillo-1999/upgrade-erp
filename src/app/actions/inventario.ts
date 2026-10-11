"use server";

import { db } from "@/db";
import { inventario } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Inventario } from "@/types/database";

export async function getInventario() {
  try {
    const data = await db
      .select()
      .from(inventario)
      .orderBy(desc(inventario.created_at));

    return data.map((item) => ({
      ...item,
      precio_unitario: Number(item.precio_unitario),
      created_at: item.created_at ? item.created_at.toISOString() : undefined,
    })) as Inventario[];
  } catch (error: any) {
    console.error("Error al obtener inventario:", error);
    throw new Error(error.message || "Error al obtener inventario");
  }
}

export async function createItemInventario(item: Omit<Inventario, "id" | "created_at">) {
  try {
    const [created] = await db
      .insert(inventario)
      .values({
        ...item,
        precio_unitario: item.precio_unitario.toString(),
      } as any)
      .returning();

    return {
      ...created,
      precio_unitario: Number(created.precio_unitario),
      created_at: created.created_at ? created.created_at.toISOString() : undefined,
    } as Inventario;
  } catch (error: any) {
    console.error("Error al crear item de inventario:", error);
    throw new Error(error.message || "Error al crear item de inventario");
  }
}

export async function updateItemInventario(id: string, item: Partial<Omit<Inventario, "id" | "created_at">>) {
  try {
    const valuesToUpdate: any = { ...item };
    if (item.precio_unitario !== undefined) {
      valuesToUpdate.precio_unitario = item.precio_unitario.toString();
    }

    const [updated] = await db
      .update(inventario)
      .set(valuesToUpdate)
      .where(eq(inventario.id, id))
      .returning();

    return {
      ...updated,
      precio_unitario: Number(updated.precio_unitario),
      created_at: updated.created_at ? updated.created_at.toISOString() : undefined,
    } as Inventario;
  } catch (error: any) {
    console.error("Error al actualizar item de inventario:", error);
    throw new Error(error.message || "Error al actualizar item de inventario");
  }
}

export async function deleteItemInventario(id: string) {
  try {
    await db.delete(inventario).where(eq(inventario.id, id));
    return true;
  } catch (error: any) {
    console.error("Error al eliminar item de inventario:", error);
    throw new Error(error.message || "Error al eliminar item de inventario");
  }
}
