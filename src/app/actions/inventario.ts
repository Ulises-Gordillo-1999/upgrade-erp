"use server";

import { db, conn, ensureDatabaseSchema } from "@/db";
import { inventario, categoriasInventario } from "@/db/schema";
import { desc, asc, eq } from "drizzle-orm";
import { Inventario, CategoriaInventario } from "@/types/database";
import { revalidatePath } from "next/cache";
import { syncPreciosProyectosPendientes } from "@/app/actions/proyectos";

const DEFAULT_CATEGORIAS: Array<{ nombre: string; tipo_asociado: "Producto" | "Servicio" | "Ambos" }> = [
  // Productos (Fijos / Consumibles)
  { nombre: "Conectividad (Routers, Switchs, APs)", tipo_asociado: "Producto" },
  { nombre: "Cámaras HD & Seguridad", tipo_asociado: "Producto" },
  { nombre: "DVR & NVR Grabadores", tipo_asociado: "Producto" },
  { nombre: "Discos SSD & Almacenamiento", tipo_asociado: "Producto" },
  { nombre: "Cables (UTP, HDMI, Patch cords)", tipo_asociado: "Producto" },
  { nombre: "Accesorios (Balunes, Fichas, Cajas Estanco)", tipo_asociado: "Producto" },
  { nombre: "Energía & Fuentes", tipo_asociado: "Producto" },
  { nombre: "Alarmas & Sensores", tipo_asociado: "Producto" },
  { nombre: "Hardware & Gabinetes", tipo_asociado: "Producto" },
  { nombre: "Domótica & Electrónica", tipo_asociado: "Producto" },

  // Servicios
  { nombre: "Mano de Obra General", tipo_asociado: "Servicio" },
  { nombre: "Instalación & Recableado", tipo_asociado: "Servicio" },
  { nombre: "Mantenimiento / Abono Mensual", tipo_asociado: "Servicio" },
  { nombre: "Configuración IT & Redes", tipo_asociado: "Servicio" },
];

export async function getCategorias(): Promise<CategoriaInventario[]> {
  try {
    await ensureDatabaseSchema();
    let rows = await db
      .select()
      .from(categoriasInventario)
      .orderBy(asc(categoriasInventario.nombre));

    // Si la tabla está vacía, sembrar las categorías por defecto
    if (rows.length === 0) {
      await db.insert(categoriasInventario).values(DEFAULT_CATEGORIAS as any);
      rows = await db
        .select()
        .from(categoriasInventario)
        .orderBy(asc(categoriasInventario.nombre));
    }

    return rows.map((cat) => ({
      id: cat.id,
      nombre: cat.nombre,
      tipo_asociado: cat.tipo_asociado as "Producto" | "Servicio" | "Ambos",
      created_at: cat.created_at ? cat.created_at.toISOString() : undefined,
    }));
  } catch (error: any) {
    console.warn("Aviso al obtener categorías (fallback activo):", error);
    return [];
  }
}

export async function createCategoria(data: {
  nombre: string;
  tipo_asociado?: "Producto" | "Servicio" | "Ambos";
}) {
  try {
    await ensureDatabaseSchema();
    const nombreLimpio = data.nombre.trim();
    if (!nombreLimpio) throw new Error("El nombre de la categoría no puede estar vacío");

    const [created] = await db
      .insert(categoriasInventario)
      .values({
        nombre: nombreLimpio,
        tipo_asociado: data.tipo_asociado || "Producto",
      } as any)
      .returning();

    revalidatePath("/inventario");
    revalidatePath("/proyectos");

    return {
      id: created.id,
      nombre: created.nombre,
      tipo_asociado: created.tipo_asociado as "Producto" | "Servicio" | "Ambos",
      created_at: created.created_at ? created.created_at.toISOString() : undefined,
    } as CategoriaInventario;
  } catch (error: any) {
    console.error("Error al crear categoría:", error);
    throw new Error(error.message || "Error al crear categoría");
  }
}

export async function deleteCategoria(id: string) {
  try {
    await ensureDatabaseSchema();
    await db.delete(categoriasInventario).where(eq(categoriasInventario.id, id));
    revalidatePath("/inventario");
    revalidatePath("/proyectos");
    return true;
  } catch (error: any) {
    console.error("Error al eliminar categoría:", error);
    throw new Error(error.message || "Error al eliminar categoría");
  }
}

export async function getInventario(): Promise<Inventario[]> {
  try {
    await ensureDatabaseSchema();
    const data = await db
      .select()
      .from(inventario)
      .orderBy(desc(inventario.created_at));

    return data.map((item) => ({
      ...item,
      categoria: item.categoria || null,
      precio_unitario: Number(item.precio_unitario),
      created_at: item.created_at ? item.created_at.toISOString() : undefined,
    })) as Inventario[];
  } catch (error: any) {
    console.warn("Aviso al obtener inventario con esquema completo, aplicando fallback:", error);
    try {
      // Fallback seguro en caso de que la columna 'categoria' aún no exista en PostgreSQL
      const fallbackData = await conn`
        SELECT id, sku, nombre, tipo, precio_unitario, stock_actual, stock_minimo, created_at
        FROM inventario
        ORDER BY created_at DESC
      `;

      return fallbackData.map((item: any) => ({
        id: item.id,
        sku: item.sku,
        nombre: item.nombre,
        tipo: item.tipo,
        categoria: null,
        precio_unitario: Number(item.precio_unitario),
        stock_actual: item.stock_actual,
        stock_minimo: item.stock_minimo,
        created_at: item.created_at ? new Date(item.created_at).toISOString() : undefined,
      })) as Inventario[];
    } catch (fallbackError) {
      console.error("Error crítico en fallback de inventario:", fallbackError);
      return [];
    }
  }
}

export async function createItemInventario(item: Omit<Inventario, "id" | "created_at">) {
  try {
    const [created] = await db
      .insert(inventario)
      .values({
        ...item,
        categoria: item.categoria ? item.categoria.trim() : null,
        precio_unitario: item.precio_unitario.toString(),
      } as any)
      .returning();

    revalidatePath("/inventario");
    revalidatePath("/proyectos");

    return {
      ...created,
      categoria: created.categoria || null,
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
    if (item.categoria !== undefined) {
      valuesToUpdate.categoria = item.categoria ? item.categoria.trim() : null;
    }

    const [updated] = await db
      .update(inventario)
      .set(valuesToUpdate)
      .where(eq(inventario.id, id))
      .returning();

    // Si el precio unitario del catálogo se modificó, sincronizar automáticamente
    // todos los presupuestos que todavía se encuentren en estado pendiente de aprobación.
    if (item.precio_unitario !== undefined) {
      await syncPreciosProyectosPendientes(id, valuesToUpdate.precio_unitario);
      revalidatePath("/proyectos");
      revalidatePath("/");
    }

    revalidatePath("/inventario");

    return {
      ...updated,
      categoria: updated.categoria || null,
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
    revalidatePath("/inventario");
    revalidatePath("/proyectos");
    return true;
  } catch (error: any) {
    console.error("Error al eliminar item de inventario:", error);
    throw new Error(error.message || "Error al eliminar item de inventario");
  }
}

