"use server";

import { db } from "@/db";
import { proyectos, clientes, itemsProyecto, inventario, transacciones } from "@/db/schema";
import { desc, asc, eq, inArray } from "drizzle-orm";
import {
  EstadoProyecto,
  Proyecto,
  ItemProyecto,
  MetodoPago,
  Moneda,
  EstadoPago,
} from "@/types/database";
import { revalidatePath } from "next/cache";
import { getSession } from "@/utils/auth";
import { registrarAuditoria } from "./auditoria";

export async function getProyectos() {
  try {
    // Sincronizar automáticamente cualquier variación de precio para presupuestos aún pendientes
    await syncPreciosProyectosPendientes();

    const list = await db.query.proyectos.findMany({
      with: {
        cliente: true,
      },
      orderBy: [desc(proyectos.created_at)],
    });

    return list.map((p) => ({
      ...p,
      total_estimado: Number(p.total_estimado || 0),
      total_final: Number(p.total_final || 0),
      created_at: p.created_at ? p.created_at.toISOString() : undefined,
      clientes: p.cliente
        ? { nombre_razon_social: p.cliente.nombre_razon_social }
        : null,
    }));
  } catch (error: any) {
    console.error("Error al obtener proyectos:", error);
    throw new Error(error.message || "Error al obtener proyectos");
  }
}

export async function getProyectoById(id: string) {
  try {
    const proyectoData = await db.query.proyectos.findFirst({
      where: eq(proyectos.id, id),
      with: {
        cliente: true,
      },
    });

    if (!proyectoData) {
      throw new Error("Proyecto no encontrado");
    }

    const esPendiente =
      proyectoData.estado === "Pendiente_Aprobacion_Cliente" ||
      proyectoData.estado === "Borrador_Bot";

    let itemsData = await db.query.itemsProyecto.findMany({
      where: eq(itemsProyecto.proyecto_id, id),
      with: {
        inventario: true,
      },
      orderBy: [asc(itemsProyecto.created_at)],
    });

    // REGLA DE NEGOCIO: Si el proyecto está en estado PENDIENTE, sincronizar automáticamente
    // los precios de los ítems con el valor actual del catálogo de inventario.
    // Una vez que el proyecto pasa a "Aprobado" (o En_Ejecucion/Finalizado), los precios quedan formalmente congelados.
    if (esPendiente) {
      let huboCambios = false;
      for (const item of itemsData) {
        if (!item.inventario) continue;
        const precioCatalogo = Number(item.inventario.precio_unitario);
        const precioActual = Number(item.precio_congelado);

        if (precioCatalogo !== precioActual) {
          await db
            .update(itemsProyecto)
            .set({ precio_congelado: item.inventario.precio_unitario })
            .where(eq(itemsProyecto.id, item.id));

          item.precio_congelado = item.inventario.precio_unitario;
          huboCambios = true;
        }
      }

      if (huboCambios) {
        await recalculateProjectTotals(id);
        const refreshed = await db.query.proyectos.findFirst({
          where: eq(proyectos.id, id),
        });
        if (refreshed) {
          proyectoData.total_estimado = refreshed.total_estimado;
          proyectoData.total_final = refreshed.total_final;
        }
      }
    }

    const proyecto = {
      ...proyectoData,
      cliente_id: proyectoData.cliente_id,
      estado: proyectoData.estado,
      total_estimado: Number(proyectoData.total_estimado || 0),
      total_final: Number(proyectoData.total_final || 0),
      created_at: proyectoData.created_at ? proyectoData.created_at.toISOString() : undefined,
      clientes: proyectoData.cliente
        ? {
            ...proyectoData.cliente,
            created_at: proyectoData.cliente.created_at
              ? proyectoData.cliente.created_at.toISOString()
              : undefined,
          }
        : null,
    };

    const items = itemsData.map((item) => ({
      ...item,
      precio_congelado: Number(item.precio_congelado),
      cantidad_estimada: Number(item.cantidad_estimada),
      cantidad_real: item.cantidad_real !== null ? Number(item.cantidad_real) : null,
      created_at: item.created_at ? item.created_at.toISOString() : undefined,
      inventario: item.inventario
        ? {
            ...item.inventario,
            precio_unitario: Number(item.inventario.precio_unitario),
            created_at: item.inventario.created_at
              ? item.inventario.created_at.toISOString()
              : undefined,
          }
        : null,
    }));

    return { proyecto, items };
  } catch (error: any) {
    console.error("Error al obtener proyecto:", error);
    throw new Error(error.message || "Error al obtener proyecto");
  }
}

export async function createProyecto(data: {
  cliente_id: string;
  estado: EstadoProyecto;
  notas_tecnicas?: string;
}) {
  try {
    const [newProyecto] = await db
      .insert(proyectos)
      .values({
        cliente_id: data.cliente_id,
        estado: data.estado,
        notas_tecnicas: data.notas_tecnicas || "",
      } as any)
      .returning();

    await registrarAuditoria({
      modulo: "Proyectos",
      accion: "Crear Proyecto",
      detalle: `Creó proyecto para cliente ID ${data.cliente_id} en estado '${data.estado}'`,
    });

    return {
      ...newProyecto,
      total_estimado: Number(newProyecto.total_estimado || 0),
      total_final: Number(newProyecto.total_final || 0),
      created_at: newProyecto.created_at ? newProyecto.created_at.toISOString() : undefined,
    } as unknown as Proyecto;
  } catch (error: any) {
    console.error("Error al crear proyecto:", error);
    throw new Error(error.message || "Error al crear proyecto");
  }
}

export async function updateEstadoProyecto(id: string, estado: EstadoProyecto) {
  try {
    const proyectoData = await db.query.proyectos.findFirst({
      where: eq(proyectos.id, id),
    });

    if (!proyectoData) {
      throw new Error("Proyecto no encontrado");
    }

    const eraPendiente =
      proyectoData.estado === "Borrador_Bot" ||
      proyectoData.estado === "Pendiente_Aprobacion_Cliente";
    const pasaAAprobadoOActivo =
      estado !== "Borrador_Bot" && estado !== "Pendiente_Aprobacion_Cliente";

    // Si el proyecto pasa de Pendiente a Aprobado (o a En_Ejecucion/Finalizado),
    // se sincronizan los precios por última vez con el catálogo y quedan congelados.
    if (eraPendiente && pasaAAprobadoOActivo) {
      const items = await db.query.itemsProyecto.findMany({
        where: eq(itemsProyecto.proyecto_id, id),
        with: { inventario: true },
      });

      for (const item of items) {
        if (!item.inventario) continue;
        if (Number(item.precio_congelado) !== Number(item.inventario.precio_unitario)) {
          await db
            .update(itemsProyecto)
            .set({ precio_congelado: item.inventario.precio_unitario })
            .where(eq(itemsProyecto.id, item.id));
        }
      }

      await recalculateProjectTotals(id);
    }

    const [updated] = await db
      .update(proyectos)
      .set({ estado })
      .where(eq(proyectos.id, id))
      .returning();

    // 1. Si pasa a Finalizado y no se había descontado el stock previamente:
    if (estado === "Finalizado" && !proyectoData.stock_descontado) {
      const items = await db.query.itemsProyecto.findMany({
        where: eq(itemsProyecto.proyecto_id, id),
        with: { inventario: true },
      });

      for (const item of items) {
        if (!item.inventario || item.inventario.tipo === "Servicio") continue;

        const cantidadDescontar =
          item.cantidad_real !== null
            ? Number(item.cantidad_real)
            : Number(item.cantidad_estimada);

        const nuevoStock = (item.inventario.stock_actual || 0) - (cantidadDescontar || 0);

        await db
          .update(inventario)
          .set({ stock_actual: nuevoStock })
          .where(eq(inventario.id, item.inventario_id));
      }

      await db
        .update(proyectos)
        .set({ stock_descontado: true })
        .where(eq(proyectos.id, id));
    }
    // 2. Si se reabre un proyecto ya finalizado (pasa de Finalizado a otro estado), revertir el descuento:
    else if (estado !== "Finalizado" && proyectoData.stock_descontado) {
      const items = await db.query.itemsProyecto.findMany({
        where: eq(itemsProyecto.proyecto_id, id),
        with: { inventario: true },
      });

      for (const item of items) {
        if (!item.inventario || item.inventario.tipo === "Servicio") continue;

        const cantidadRestaurar =
          item.cantidad_real !== null
            ? Number(item.cantidad_real)
            : Number(item.cantidad_estimada);

        const nuevoStock = (item.inventario.stock_actual || 0) + (cantidadRestaurar || 0);

        await db
          .update(inventario)
          .set({ stock_actual: nuevoStock })
          .where(eq(inventario.id, item.inventario_id));
      }

      await db
        .update(proyectos)
        .set({ stock_descontado: false })
        .where(eq(proyectos.id, id));
    }

    revalidatePath(`/proyectos/${id}`);
    revalidatePath(`/proyectos`);
    revalidatePath(`/inventario`);

    await registrarAuditoria({
      modulo: "Proyectos",
      accion: "Cambio de Estado",
      detalle: `Cambió estado de proyecto ID ${id} de '${proyectoData.estado}' a '${estado}'${estado === "Finalizado" ? " (Stock físico descontado automáticamente)" : ""}`,
    });

    return {
      ...updated,
      total_estimado: Number(updated.total_estimado || 0),
      total_final: Number(updated.total_final || 0),
      created_at: updated.created_at ? updated.created_at.toISOString() : undefined,
    } as unknown as Proyecto;
  } catch (err: any) {
    console.error("Error al actualizar estado:", err);
    throw new Error(err.message || "Error al actualizar estado");
  }
}

export async function addItemToProyecto(data: {
  proyecto_id: string;
  inventario_id: string;
  cantidad_estimada: number;
}) {
  try {
    const invItem = await db.query.inventario.findFirst({
      where: eq(inventario.id, data.inventario_id),
    });

    if (!invItem) {
      throw new Error("Ítem de inventario no encontrado");
    }

    const [newItem] = await db
      .insert(itemsProyecto)
      .values({
        proyecto_id: data.proyecto_id,
        inventario_id: data.inventario_id,
        precio_congelado: invItem.precio_unitario,
        cantidad_estimada: data.cantidad_estimada.toString(),
        cantidad_real: invItem.tipo !== "Consumible" ? data.cantidad_estimada.toString() : null,
      } as any)
      .returning();

    await recalculateProjectTotals(data.proyecto_id);

    return {
      ...newItem,
      precio_congelado: Number(newItem.precio_congelado),
      cantidad_estimada: Number(newItem.cantidad_estimada),
      cantidad_real: newItem.cantidad_real !== null ? Number(newItem.cantidad_real) : null,
      created_at: newItem.created_at ? newItem.created_at.toISOString() : undefined,
    } as unknown as ItemProyecto;
  } catch (error: any) {
    console.error("Error al agregar ítem al proyecto:", error);
    throw new Error(error.message || "Error al agregar ítem al proyecto");
  }
}

export async function updateItemCantidadReal(id: string, proyecto_id: string, cantidad_real: number) {
  try {
    const [updated] = await db
      .update(itemsProyecto)
      .set({ cantidad_real: cantidad_real.toString() })
      .where(eq(itemsProyecto.id, id))
      .returning();

    await recalculateProjectTotals(proyecto_id);

    revalidatePath(`/proyectos/${proyecto_id}`);
    revalidatePath(`/proyectos`);

    return {
      ...updated,
      precio_congelado: Number(updated.precio_congelado),
      cantidad_estimada: Number(updated.cantidad_estimada),
      cantidad_real: updated.cantidad_real !== null ? Number(updated.cantidad_real) : null,
      created_at: updated.created_at ? updated.created_at.toISOString() : undefined,
    } as unknown as ItemProyecto;
  } catch (error: any) {
    console.error("Error al actualizar cantidad real:", error);
    throw new Error(error.message || "Error al actualizar cantidad real");
  }
}

export async function cerrarProyectoConLiquidacion(data: {
  proyecto_id: string;
  items_ajustados: Array<{ item_id: string; cantidad_real: number }>;
  registrar_transaccion?: boolean;
  transaccion_metodo_pago?: MetodoPago;
  transaccion_moneda?: Moneda;
  transaccion_estado?: EstadoPago;
}) {
  try {
    const proyecto = await db.query.proyectos.findFirst({
      where: eq(proyectos.id, data.proyecto_id),
      with: { cliente: true },
    });

    if (!proyecto) {
      throw new Error("Proyecto no encontrado");
    }

    // 1. Guardar las cantidades reales de cada ítem
    for (const itemAjuste of data.items_ajustados) {
      await db
        .update(itemsProyecto)
        .set({ cantidad_real: itemAjuste.cantidad_real.toString() })
        .where(eq(itemsProyecto.id, itemAjuste.item_id));
    }

    // 2. Recalcular total_estimado y total_final
    await recalculateProjectTotals(data.proyecto_id);

    // 3. Descontar del inventario físico si no se había descontado previamente
    if (!proyecto.stock_descontado) {
      const items = await db.query.itemsProyecto.findMany({
        where: eq(itemsProyecto.proyecto_id, data.proyecto_id),
        with: { inventario: true },
      });

      for (const item of items) {
        if (!item.inventario || item.inventario.tipo === "Servicio") {
          continue;
        }

        const cantidadADescontar =
          item.cantidad_real !== null
            ? Number(item.cantidad_real)
            : Number(item.cantidad_estimada);

        const stockActual = item.inventario.stock_actual || 0;
        const nuevoStock = stockActual - (cantidadADescontar || 0);

        await db
          .update(inventario)
          .set({ stock_actual: nuevoStock })
          .where(eq(inventario.id, item.inventario_id));
      }
    }

    // 4. Marcar proyecto como Finalizado y stock_descontado: true
    const [proyectoActualizado] = await db
      .update(proyectos)
      .set({
        estado: "Finalizado",
        stock_descontado: true,
      })
      .where(eq(proyectos.id, data.proyecto_id))
      .returning();

    // 5. Registrar cobro en finanzas si fue solicitado
    if (data.registrar_transaccion && Number(proyectoActualizado.total_final || 0) > 0) {
      const transaccionExistente = await db.query.transacciones.findFirst({
        where: eq(transacciones.proyecto_id, data.proyecto_id),
      });

      if (transaccionExistente) {
        await db
          .update(transacciones)
          .set({
            monto: proyectoActualizado.total_final!,
            moneda: data.transaccion_moneda || "ARS",
            metodo_pago: data.transaccion_metodo_pago || "Transferencia",
            estado: data.transaccion_estado || "Pagado",
          })
          .where(eq(transacciones.id, transaccionExistente.id));
      } else {
        await db.insert(transacciones).values({
          proyecto_id: data.proyecto_id,
          tipo: "Ingreso",
          categoria: "Hardware",
          monto: proyectoActualizado.total_final!,
          moneda: data.transaccion_moneda || "ARS",
          metodo_pago: data.transaccion_metodo_pago || "Transferencia",
          estado: data.transaccion_estado || "Pagado",
          descripcion: `Liquidación Cierre de Obra - Cliente: ${proyecto.cliente?.nombre_razon_social || "N/A"}`,
        } as any);
      }
    }

    revalidatePath(`/proyectos/${data.proyecto_id}`);
    revalidatePath(`/proyectos`);
    revalidatePath(`/inventario`);
    revalidatePath(`/finanzas`);

    await registrarAuditoria({
      modulo: "Proyectos",
      accion: "Cierre de Obra con Liquidación",
      detalle: `Finalizó y liquidó obra para '${proyecto.cliente?.nombre_razon_social || "Cliente"}' (ID: ${data.proyecto_id}). Total final: $${proyectoActualizado.total_final} ARS. Stock de insumos y consumibles descontado.${data.registrar_transaccion ? " Cobro registrado en Finanzas." : ""}`,
    });

    return {
      success: true,
      total_final: Number(proyectoActualizado.total_final),
    };
  } catch (error: any) {
    console.error("Error al liquidar obra:", error);
    throw new Error(error.message || "Error al liquidar la obra");
  }
}

export async function removeItemFromProyecto(id: string, proyecto_id: string) {
  try {
    await db.delete(itemsProyecto).where(eq(itemsProyecto.id, id));
    await recalculateProjectTotals(proyecto_id);
    return true;
  } catch (error: any) {
    console.error("Error al eliminar ítem:", error);
    throw new Error(error.message || "Error al eliminar ítem");
  }
}

async function recalculateProjectTotals(proyecto_id: string) {
  const items = await db
    .select({
      precio_congelado: itemsProyecto.precio_congelado,
      cantidad_estimada: itemsProyecto.cantidad_estimada,
      cantidad_real: itemsProyecto.cantidad_real,
    })
    .from(itemsProyecto)
    .where(eq(itemsProyecto.proyecto_id, proyecto_id));

  let total_estimado = 0;
  let total_final = 0;

  items.forEach((item) => {
    const precio = Number(item.precio_congelado);
    const cantEst = Number(item.cantidad_estimada || 0);
    const cantReal = item.cantidad_real !== null ? Number(item.cantidad_real) : cantEst;

    total_estimado += precio * cantEst;
    total_final += precio * cantReal;
  });

  await db
    .update(proyectos)
    .set({
      total_estimado: total_estimado.toFixed(2),
      total_final: total_final.toFixed(2),
    })
    .where(eq(proyectos.id, proyecto_id));
}

export async function syncPreciosProyectosPendientes(
  inventarioId?: string,
  nuevoPrecio?: string
) {
  try {
    const proyectosPendientes = await db.query.proyectos.findMany({
      where: inArray(proyectos.estado, [
        "Borrador_Bot",
        "Pendiente_Aprobacion_Cliente",
      ]),
      with: {
        items: {
          with: {
            inventario: true,
          },
        },
      },
    });

    for (const proj of proyectosPendientes) {
      let huboCambios = false;

      for (const it of proj.items) {
        if (inventarioId && it.inventario_id !== inventarioId) continue;
        if (!it.inventario) continue;

        const precioAUsar =
          inventarioId && nuevoPrecio !== undefined
            ? Number(nuevoPrecio)
            : Number(it.inventario.precio_unitario);

        if (Number(it.precio_congelado) !== precioAUsar) {
          await db
            .update(itemsProyecto)
            .set({ precio_congelado: precioAUsar.toFixed(2) })
            .where(eq(itemsProyecto.id, it.id));
          huboCambios = true;
        }
      }

      if (huboCambios) {
        await recalculateProjectTotals(proj.id);
      }
    }
  } catch (error) {
    console.error("Error al sincronizar precios en proyectos pendientes:", error);
  }
}

export async function updateProyectoDetalles(
  id: string,
  data: { cliente_id?: string; notas_tecnicas?: string }
) {
  try {
    const [updated] = await db
      .update(proyectos)
      .set(data as any)
      .where(eq(proyectos.id, id))
      .returning();

    return {
      ...updated,
      total_estimado: Number(updated.total_estimado || 0),
      total_final: Number(updated.total_final || 0),
      created_at: updated.created_at ? updated.created_at.toISOString() : undefined,
    } as unknown as Proyecto;
  } catch (error: any) {
    console.error("Error al actualizar proyecto:", error);
    throw new Error(error.message || "Error al actualizar proyecto");
  }
}

export async function deleteProyecto(id: string) {
  try {
    const session = await getSession();
    if (!session || session.rol !== "SuperAdmin") {
      throw new Error(
        "Acceso denegado. Solo los usuarios con rol SuperAdmin tienen autorización para eliminar proyectos."
      );
    }

    const proyecto = await db.query.proyectos.findFirst({
      where: eq(proyectos.id, id),
    });

    if (!proyecto) {
      throw new Error("Proyecto no encontrado");
    }

    // Validación crítica de regla de negocio:
    // Si el proyecto ya fue liquidado (Cierre de Obra con descuento de stock o estado Finalizado), no permitir eliminarlo
    if (proyecto.stock_descontado || proyecto.estado === "Finalizado") {
      throw new Error(
        "No es posible eliminar este proyecto porque ya fue finalizado y liquidado (Cierre de Obra ejecutado y stock descontado del inventario)."
      );
    }

    await db.delete(proyectos).where(eq(proyectos.id, id));

    await registrarAuditoria({
      modulo: "Proyectos",
      accion: "Eliminar Proyecto",
      detalle: `Eliminó proyecto ID ${id} (${proyecto.estado})`,
    });

    revalidatePath("/proyectos");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Error al eliminar proyecto:", error);
    throw new Error(error.message || "Error al eliminar el proyecto");
  }
}
