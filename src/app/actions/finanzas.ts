"use server";

import { db } from "@/db";
import { transacciones } from "@/db/schema";
import { desc, eq, gte, and } from "drizzle-orm";
import {
  Transaccion,
  TipoTransaccion,
  CategoriaTransaccion,
  Moneda,
  MetodoPago,
  EstadoPago,
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
