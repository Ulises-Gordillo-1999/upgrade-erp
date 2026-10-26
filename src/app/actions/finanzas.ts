"use server";

import { db, ensureDatabaseSchema } from "@/db";
import { transacciones, proyectos, categoriasFinanzas } from "@/db/schema";
import { desc, eq, gte, and, asc, ilike } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  Transaccion,
  TipoTransaccion,
  CategoriaTransaccion,
  CategoriaFinanzas,
  Moneda,
  MetodoPago,
  EstadoPago,
  RentabilidadProyecto,
} from "@/types/database";

export async function getTransacciones() {
  try {
    const list = await db.query.transacciones.findMany({
      with: {
        proyecto: {
          with: {
            cliente: true,
          },
        },
      },
      orderBy: [desc(transacciones.fecha_transaccion)],
    });

    return list.map((t) => ({
      ...t,
      monto: Number(t.monto),
      fecha_transaccion: t.fecha_transaccion ? t.fecha_transaccion.toISOString() : undefined,
      created_at: t.created_at ? t.created_at.toISOString() : undefined,
      proyectos: t.proyecto
        ? {
            clientes: t.proyecto.cliente
              ? { nombre_razon_social: t.proyecto.cliente.nombre_razon_social }
              : null,
          }
        : null,
    }));
  } catch (error: any) {
    console.error("Error al obtener transacciones:", error);
    throw new Error(error.message || "Error al obtener transacciones");
  }
}

export async function createTransaccion(data: {
  tipo: TipoTransaccion;
  categoria: CategoriaTransaccion;
  monto: number;
  moneda: Moneda;
  metodo_pago: MetodoPago;
  estado: EstadoPago;
  descripcion?: string;
  proyecto_id?: string;
  fecha_transaccion?: string;
}) {
  try {
    const payload: any = {
      tipo: data.tipo,
      categoria: data.categoria,
      monto: data.monto.toString(),
      moneda: data.moneda,
      metodo_pago: data.metodo_pago,
      estado: data.estado,
      descripcion: data.descripcion || null,
      proyecto_id: data.proyecto_id || null,
    };

    if (data.fecha_transaccion) {
      payload.fecha_transaccion = new Date(data.fecha_transaccion);
    }

    const [newRecord] = await db
      .insert(transacciones)
      .values(payload)
      .returning();

    return {
      ...newRecord,
      monto: Number(newRecord.monto),
      fecha_transaccion: newRecord.fecha_transaccion ? newRecord.fecha_transaccion.toISOString() : undefined,
      created_at: newRecord.created_at ? newRecord.created_at.toISOString() : undefined,
    } as unknown as Transaccion;
  } catch (error: any) {
    console.error("Error al crear transacción:", error);
    throw new Error(error.message || "Error al crear transacción");
  }
}

export async function getBalanceMensual() {
  const balance = {
    ARS: { ingresos: 0, egresos: 0, neto: 0 },
    USDT: { ingresos: 0, egresos: 0, neto: 0 },
  };

  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const rows = await db
      .select({
        tipo: transacciones.tipo,
        monto: transacciones.monto,
        moneda: transacciones.moneda,
      })
      .from(transacciones)
      .where(
        and(
          gte(transacciones.fecha_transaccion, startOfMonth),
          eq(transacciones.estado, "Pagado")
        )
      );

    if (rows) {
      rows.forEach((t) => {
        if (t.moneda === "ARS" || t.moneda === "USDT") {
          const monto = Number(t.monto);
          const moneda = t.moneda as "ARS" | "USDT";
          if (t.tipo === "Ingreso") {
            balance[moneda].ingresos += monto;
          } else if (t.tipo === "Egreso") {
            balance[moneda].egresos += monto;
          }
        }
      });
    }

    balance.ARS.neto = balance.ARS.ingresos - balance.ARS.egresos;
    balance.USDT.neto = balance.USDT.ingresos - balance.USDT.egresos;

    return balance;
  } catch (err) {
    console.error("Error al calcular balance:", err);
    return balance;
  }
}

export async function updateTransaccion(
  id: string,
  data: Partial<{
    tipo: TipoTransaccion;
    categoria: CategoriaTransaccion;
    monto: number;
    moneda: Moneda;
    metodo_pago: MetodoPago;
    estado: EstadoPago;
    descripcion?: string;
    proyecto_id?: string | null;
    fecha_transaccion?: string;
  }>
) {
  try {
    const payload: any = { ...data };
    if (payload.monto !== undefined) payload.monto = payload.monto.toString();
    if (payload.descripcion === "") payload.descripcion = null;
    if (payload.proyecto_id === "") payload.proyecto_id = null;
    if (payload.fecha_transaccion) {
      payload.fecha_transaccion = new Date(payload.fecha_transaccion);
    }

    const [updatedRecord] = await db
      .update(transacciones)
      .set(payload)
      .where(eq(transacciones.id, id))
      .returning();

    return {
      ...updatedRecord,
      monto: Number(updatedRecord.monto),
      fecha_transaccion: updatedRecord.fecha_transaccion
        ? updatedRecord.fecha_transaccion.toISOString()
        : undefined,
      created_at: updatedRecord.created_at
        ? updatedRecord.created_at.toISOString()
        : undefined,
    } as unknown as Transaccion;
  } catch (error: any) {
    console.error("Error al actualizar transacción:", error);
    throw new Error(error.message || "Error al actualizar transacción");
  }
}

export async function deleteTransaccion(id: string) {
  try {
    await db.delete(transacciones).where(eq(transacciones.id, id));
    return true;
  } catch (error: any) {
    console.error("Error al eliminar transacción:", error);
    throw new Error(error.message || "Error al eliminar transacción");
  }
}

export async function getRentabilidadProyectos(): Promise<RentabilidadProyecto[]> {
  try {
    const list = await db.query.proyectos.findMany({
      with: {
        cliente: true,
        transacciones: true,
      },
      orderBy: [desc(proyectos.created_at)],
    });

    return list.map((p) => {
      let ingresosARS = 0;
      let egresosARS = 0;
      let ingresosUSDT = 0;
      let egresosUSDT = 0;

      if (p.transacciones && Array.isArray(p.transacciones)) {
        p.transacciones.forEach((t) => {
          const monto = Number(t.monto) || 0;
          if (t.moneda === "ARS") {
            if (t.tipo === "Ingreso") ingresosARS += monto;
            else if (t.tipo === "Egreso") egresosARS += monto;
          } else if (t.moneda === "USDT") {
            if (t.tipo === "Ingreso") ingresosUSDT += monto;
            else if (t.tipo === "Egreso") egresosUSDT += monto;
          }
        });
      }

      const netoARS = ingresosARS - egresosARS;
      const margenARS = ingresosARS > 0 ? (netoARS / ingresosARS) * 100 : 0;
      const netoUSDT = ingresosUSDT - egresosUSDT;

      return {
        id: p.id,
        clienteNombre: p.cliente?.nombre_razon_social || "Cliente sin nombre",
        estado: p.estado,
        totalEstimado: Number(p.total_estimado) || 0,
        totalFinal: Number(p.total_final) || 0,
        stockDescontado: Boolean(p.stock_descontado),
        fechaCreacion: p.created_at ? p.created_at.toISOString() : new Date().toISOString(),
        ingresosARS,
        egresosARS,
        netoARS,
        margenARS: Number(margenARS.toFixed(1)),
        ingresosUSDT,
        egresosUSDT,
        netoUSDT,
        totalMovimientos: p.transacciones ? p.transacciones.length : 0,
      };
    });
  } catch (error: any) {
    console.error("Error al calcular rentabilidad de proyectos:", error);
    throw new Error(error.message || "Error al calcular rentabilidad de proyectos");
  }
}

const DEFAULT_CATEGORIAS_FINANZAS = [
  { nombre: "Hardware / Materiales", tipo_asociado: "Ambos" as const },
  { nombre: "Servicios Cloud", tipo_asociado: "Egreso" as const },
  { nombre: "Movilidad / Viáticos", tipo_asociado: "Egreso" as const },
  { nombre: "Honorarios", tipo_asociado: "Ambos" as const },
  { nombre: "Abono Mensual", tipo_asociado: "Ingreso" as const },
  { nombre: "Instalaciones & Proyectos", tipo_asociado: "Ingreso" as const },
  { nombre: "Infraestructura & Herramientas", tipo_asociado: "Egreso" as const },
  { nombre: "Impuestos & Servicios", tipo_asociado: "Egreso" as const },
  { nombre: "Otros", tipo_asociado: "Ambos" as const },
];

export async function getCategoriasFinanzas(): Promise<CategoriaFinanzas[]> {
  try {
    await ensureDatabaseSchema();
    const data = await db
      .select()
      .from(categoriasFinanzas)
      .orderBy(asc(categoriasFinanzas.nombre));

    if (data.length === 0) {
      const seeded = await db
        .insert(categoriasFinanzas)
        .values(
          DEFAULT_CATEGORIAS_FINANZAS.map((c) => ({
            nombre: c.nombre,
            tipo_asociado: c.tipo_asociado,
          }))
        )
        .returning();

      return seeded.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        tipo_asociado: c.tipo_asociado as "Ingreso" | "Egreso" | "Ambos",
        created_at: c.created_at ? c.created_at.toISOString() : undefined,
      }));
    }

    return data.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      tipo_asociado: c.tipo_asociado as "Ingreso" | "Egreso" | "Ambos",
      created_at: c.created_at ? c.created_at.toISOString() : undefined,
    }));
  } catch (error: any) {
    console.error("Error al obtener categorías de finanzas:", error);
    return DEFAULT_CATEGORIAS_FINANZAS.map((c, index) => ({
      id: `fallback-${index}`,
      nombre: c.nombre,
      tipo_asociado: c.tipo_asociado,
    }));
  }
}

export async function createCategoriaFinanzas(data: {
  nombre: string;
  tipo_asociado?: "Ingreso" | "Egreso" | "Ambos";
}) {
  try {
    await ensureDatabaseSchema();
    const nombreLimpio = data.nombre.trim();
    if (!nombreLimpio) throw new Error("El nombre de la categoría es obligatorio");

    // Verificar si ya existe una con el mismo nombre (case insensitive)
    const existing = await db
      .select()
      .from(categoriasFinanzas)
      .where(ilike(categoriasFinanzas.nombre, nombreLimpio))
      .limit(1);

    if (existing.length > 0) {
      throw new Error(`Ya existe una categoría llamada "${existing[0].nombre}"`);
    }

    const [nueva] = await db
      .insert(categoriasFinanzas)
      .values({
        nombre: nombreLimpio,
        tipo_asociado: data.tipo_asociado || "Ambos",
      })
      .returning();

    revalidatePath("/finanzas");

    return {
      id: nueva.id,
      nombre: nueva.nombre,
      tipo_asociado: nueva.tipo_asociado as "Ingreso" | "Egreso" | "Ambos",
      created_at: nueva.created_at ? nueva.created_at.toISOString() : undefined,
    } as CategoriaFinanzas;
  } catch (error: any) {
    console.error("Error al crear categoría de finanzas:", error);
    throw new Error(error.message || "Error al crear la categoría");
  }
}

export async function updateCategoriaFinanzas(
  id: string,
  data: {
    nombre: string;
    tipo_asociado?: "Ingreso" | "Egreso" | "Ambos";
  }
) {
  try {
    await ensureDatabaseSchema();
    const nombreLimpio = data.nombre.trim();
    if (!nombreLimpio) throw new Error("El nombre de la categoría es obligatorio");

    const existing = await db
      .select()
      .from(categoriasFinanzas)
      .where(eq(categoriasFinanzas.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Categoría no encontrada");
    }

    const oldNombre = existing[0].nombre;

    // Verificar colisión con otra categoría
    const duplicate = await db
      .select()
      .from(categoriasFinanzas)
      .where(ilike(categoriasFinanzas.nombre, nombreLimpio))
      .limit(1);

    if (duplicate.length > 0 && duplicate[0].id !== id) {
      throw new Error(`Ya existe otra categoría llamada "${duplicate[0].nombre}"`);
    }

    const [updated] = await db
      .update(categoriasFinanzas)
      .set({
        nombre: nombreLimpio,
        tipo_asociado: data.tipo_asociado || existing[0].tipo_asociado,
      })
      .where(eq(categoriasFinanzas.id, id))
      .returning();

    // Si el nombre cambió, migrar todas las transacciones históricas que tenían el nombre anterior
    if (oldNombre !== nombreLimpio) {
      await db
        .update(transacciones)
        .set({ categoria: nombreLimpio })
        .where(eq(transacciones.categoria, oldNombre));
    }

    revalidatePath("/finanzas");

    return {
      id: updated.id,
      nombre: updated.nombre,
      tipo_asociado: updated.tipo_asociado as "Ingreso" | "Egreso" | "Ambos",
      created_at: updated.created_at ? updated.created_at.toISOString() : undefined,
    } as CategoriaFinanzas;
  } catch (error: any) {
    console.error("Error al actualizar categoría de finanzas:", error);
    throw new Error(error.message || "Error al actualizar la categoría");
  }
}

export async function deleteCategoriaFinanzas(id: string) {
  try {
    await ensureDatabaseSchema();

    const existing = await db
      .select()
      .from(categoriasFinanzas)
      .where(eq(categoriasFinanzas.id, id))
      .limit(1);

    if (existing.length === 0) {
      throw new Error("Categoría no encontrada");
    }

    const catNombre = existing[0].nombre;

    // Reclasificar transacciones asociadas a "Otros" para no perder información financiera ni romper balances
    await db
      .update(transacciones)
      .set({ categoria: "Otros" })
      .where(eq(transacciones.categoria, catNombre));

    await db.delete(categoriasFinanzas).where(eq(categoriasFinanzas.id, id));

    revalidatePath("/finanzas");
    return true;
  } catch (error: any) {
    console.error("Error al eliminar categoría de finanzas:", error);
    throw new Error(error.message || "Error al eliminar la categoría");
  }
}


