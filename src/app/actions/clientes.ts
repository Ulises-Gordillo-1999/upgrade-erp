"use server";

import { db } from "@/db";
import { clientes } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { Cliente } from "@/types/database";

export async function getClientes() {
  try {
    const data = await db
      .select()
      .from(clientes)
      .orderBy(desc(clientes.created_at));

    return data as unknown as Cliente[];
  } catch (error: any) {
    console.error("Error al obtener clientes:", error);
    throw new Error(error.message || "Error al obtener clientes");
  }
}

export async function createCliente(cliente: Omit<Cliente, "id" | "created_at">) {
  try {
    const [created] = await db
      .insert(clientes)
      .values(cliente as any)
      .returning();

    return created as unknown as Cliente;
  } catch (error: any) {
    console.error("Error al crear cliente:", error);
    throw new Error(error.message || "Error al crear cliente");
  }
}

export async function updateCliente(id: string, cliente: Partial<Omit<Cliente, "id" | "created_at">>) {
  try {
    const [updated] = await db
      .update(clientes)
      .set(cliente as any)
      .where(eq(clientes.id, id))
      .returning();

    return updated as unknown as Cliente;
  } catch (error: any) {
    console.error("Error al actualizar cliente:", error);
    throw new Error(error.message || "Error al actualizar cliente");
  }
}

export async function deleteCliente(id: string) {
  try {
    await db.delete(clientes).where(eq(clientes.id, id));
    return true;
  } catch (error: any) {
    console.error("Error al eliminar cliente:", error);
    throw new Error(error.message || "Error al eliminar cliente");
  }
}
