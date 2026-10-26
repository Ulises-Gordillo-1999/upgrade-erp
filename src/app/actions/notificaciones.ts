"use server";

import { db, ensureDatabaseSchema } from "@/db";
import { inventario, proyectos } from "@/db/schema";
import { and, ne, lte, or, eq, asc, desc } from "drizzle-orm";

export interface NotificacionItem {
  id: string;
  tipo: "stock_agotado" | "stock_critico" | "proyecto_demorado" | "borrador_bot" | "presupuesto_pendiente";
  titulo: string;
  descripcion: string;
  detalle?: string;
  enlace: string;
  severidad: "alta" | "media" | "baja";
  categoria: "inventario" | "proyectos";
  fecha?: string;
}

export interface ResumenNotificaciones {
  total: number;
  totalCriticas: number;
  totalStock: number;
  totalProyectos: number;
  items: NotificacionItem[];
}

export async function getNotificaciones(): Promise<ResumenNotificaciones> {
  try {
    await ensureDatabaseSchema();

    // 1. Alertas de Inventario Físico / Consumibles en Stock Crítico o Agotado
    const itemsInventario = await db.query.inventario.findMany({
      where: and(
        ne(inventario.tipo, "Servicio"),
        lte(inventario.stock_actual, inventario.stock_minimo)
      ),
      orderBy: [asc(inventario.stock_actual)],
    });

    const notificacionesStock: NotificacionItem[] = itemsInventario.map((item) => {
      const stockActual = item.stock_actual ?? 0;
      const stockMinimo = item.stock_minimo ?? 0;
      const esAgotado = stockActual === 0;

      return {
        id: `stock-${item.id}`,
        tipo: esAgotado ? "stock_agotado" : "stock_critico",
        titulo: esAgotado ? `Stock Agotado: ${item.nombre}` : `Stock Crítico: ${item.nombre}`,
        descripcion: esAgotado
          ? `El ítem se encuentra sin existencias físicas (0/${stockMinimo} unidades).`
          : `Quedan solo ${stockActual} de ${stockMinimo} unidades mínimas requeridas.`,
        detalle: item.categoria ? `Categoría: ${item.categoria}` : item.sku ? `SKU: ${item.sku}` : undefined,
        enlace: "/inventario",
        severidad: esAgotado ? "alta" : "media",
        categoria: "inventario",
        fecha: item.created_at ? item.created_at.toISOString() : undefined,
      };
    });

    // 2. Alertas de Proyectos: Obras Demoradas, Borradores de Bot y Pendientes
    const proyectosActivos = await db.query.proyectos.findMany({
      where: or(
        eq(proyectos.estado, "Borrador_Bot"),
        eq(proyectos.estado, "En_Ejecucion"),
        eq(proyectos.estado, "Pendiente_Aprobacion_Cliente")
      ),
      with: {
        cliente: true,
      },
      orderBy: [asc(proyectos.created_at)],
    });

    const now = new Date();
    const notificacionesProyectos: NotificacionItem[] = [];

    proyectosActivos.forEach((p) => {
      const clienteNombre = p.cliente?.nombre_razon_social || "Cliente sin identificar";
      const fechaCreacion = p.created_at ? new Date(p.created_at) : now;
      const diffDias = Math.floor((now.getTime() - fechaCreacion.getTime()) / (1000 * 60 * 60 * 24));

      if (p.estado === "Borrador_Bot") {
        notificacionesProyectos.push({
          id: `bot-${p.id}`,
          tipo: "borrador_bot",
          titulo: `Borrador Bot: ${clienteNombre}`,
          descripcion: "Cotización automática generada por bot pendiente de revisión y aprobación.",
          detalle: `Creado hace ${diffDias} días • Total: $${Number(p.total_estimado || 0).toLocaleString("es-AR")}`,
          enlace: `/proyectos/${p.id}`,
          severidad: "media",
          categoria: "proyectos",
          fecha: p.created_at ? p.created_at.toISOString() : undefined,
        });
      } else if (p.estado === "En_Ejecucion" && diffDias >= 14) {
        notificacionesProyectos.push({
          id: `obra-${p.id}`,
          tipo: "proyecto_demorado",
          titulo: `Obra Demorada: ${clienteNombre}`,
          descripcion: `Lleva ${diffDias} días en ejecución. Requiere seguimiento técnico o cierre de obra con liquidación de cable/stock.`,
          detalle: `Estado: En Ejecución • Inicio: ${fechaCreacion.toLocaleDateString("es-AR")}`,
          enlace: `/proyectos/${p.id}`,
          severidad: diffDias >= 30 ? "alta" : "media",
          categoria: "proyectos",
          fecha: p.created_at ? p.created_at.toISOString() : undefined,
        });
      } else if (p.estado === "Pendiente_Aprobacion_Cliente" && diffDias >= 7) {
        notificacionesProyectos.push({
          id: `presupuesto-${p.id}`,
          tipo: "presupuesto_pendiente",
          titulo: `Presupuesto sin respuesta: ${clienteNombre}`,
          descripcion: `Cotización enviada hace ${diffDias} días sin confirmación del cliente.`,
          detalle: `Total estimado: $${Number(p.total_estimado || 0).toLocaleString("es-AR")}`,
          enlace: `/proyectos/${p.id}`,
          severidad: "baja",
          categoria: "proyectos",
          fecha: p.created_at ? p.created_at.toISOString() : undefined,
        });
      }
    });

    const todas = [...notificacionesStock, ...notificacionesProyectos].sort((a, b) => {
      // Priorizar severidad alta, luego media, luego baja
      const pesoSeveridad = { alta: 3, media: 2, baja: 1 };
      return pesoSeveridad[b.severidad] - pesoSeveridad[a.severidad];
    });

    return {
      total: todas.length,
      totalCriticas: todas.filter((n) => n.severidad === "alta").length,
      totalStock: notificacionesStock.length,
      totalProyectos: notificacionesProyectos.length,
      items: todas,
    };
  } catch (error: any) {
    console.error("Error al obtener notificaciones:", error);
    return {
      total: 0,
      totalCriticas: 0,
      totalStock: 0,
      totalProyectos: 0,
      items: [],
    };
  }
}
