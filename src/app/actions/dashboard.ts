"use server";

import { db } from "@/db";
import { clientes, proyectos, inventario, transacciones } from "@/db/schema";
import { count, ne, and, sql, gte, eq, desc, asc } from "drizzle-orm";

export interface StockCriticoItem {
  id: string;
  sku: string | null;
  nombre: string;
  tipo: "Fijo" | "Consumible";
  stock_actual: number;
  stock_minimo: number;
  deficit: number;
  quiebreTotal: boolean;
}

export interface UltimaTransaccion {
  id: string;
  tipo: "Ingreso" | "Egreso";
  categoria: string;
  monto: number;
  moneda: "ARS" | "USDT";
  metodo_pago: string;
  estado: "Pagado" | "Pendiente";
  descripcion: string | null;
  fecha_transaccion: string | null;
  clienteNombre?: string | null;
}

export interface UltimoProyecto {
  id: string;
  estado: string;
  total_estimado: number;
  total_final: number;
  created_at: string | null;
  clienteNombre: string;
}

export interface DashboardData {
  finanzasARS: {
    ingresos: number;
    egresos: number;
    neto: number;
    porCobrar: number;
    porPagar: number;
    totalOperaciones: number;
    mesNombre: string;
    margenOperativo: number; // Porcentaje de neto sobre ingresos
  };
  proyectosCounts: {
    borradorBot: number;
    enEjecucion: number;
    finalizados: number;
    pendienteAprobacion: number;
    aprobados: number;
    cancelados: number;
    total: number;
  };
  stockCritico: {
    count: number;
    items: StockCriticoItem[];
  };
  ultimasTransacciones: UltimaTransaccion[];
  ultimosProyectos: UltimoProyecto[];
  statsGenerales: {
    clientesTotales: number;
    itemsTotales: number;
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const mesNombre = `${meses[now.getMonth()]} ${now.getFullYear()}`;

  try {
    // 1. Finanzas del mes SOLO en ARS
    const txMesARS = await db
      .select({
        tipo: transacciones.tipo,
        monto: transacciones.monto,
        estado: transacciones.estado,
      })
      .from(transacciones)
      .where(
        and(
          eq(transacciones.moneda, "ARS"),
          gte(transacciones.fecha_transaccion, startOfMonth)
        )
      );

    let ingresosARS = 0;
    let egresosARS = 0;
    let porCobrarARS = 0;
    let porPagarARS = 0;

    txMesARS.forEach((tx) => {
      const monto = Number(tx.monto) || 0;
      if (tx.estado === "Pagado") {
        if (tx.tipo === "Ingreso") {
          ingresosARS += monto;
        } else if (tx.tipo === "Egreso") {
          egresosARS += monto;
        }
      } else if (tx.estado === "Pendiente") {
        if (tx.tipo === "Ingreso") {
          porCobrarARS += monto;
        } else if (tx.tipo === "Egreso") {
          porPagarARS += monto;
        }
      }
    });

    const netoARS = ingresosARS - egresosARS;
    const margenOperativo = ingresosARS > 0 ? Math.round((netoARS / ingresosARS) * 100) : 0;

    // 2. Conteo de Proyectos por Estado
    const proyectosList = await db
      .select({
        id: proyectos.id,
        estado: proyectos.estado,
      })
      .from(proyectos);

    const proyectosCounts = {
      borradorBot: proyectosList.filter((p) => p.estado === "Borrador_Bot").length,
      enEjecucion: proyectosList.filter((p) => p.estado === "En_Ejecucion").length,
      finalizados: proyectosList.filter((p) => p.estado === "Finalizado").length,
      pendienteAprobacion: proyectosList.filter((p) => p.estado === "Pendiente_Aprobacion_Cliente").length,
      aprobados: proyectosList.filter((p) => p.estado === "Aprobado").length,
      cancelados: proyectosList.filter((p) => p.estado === "Cancelado").length,
      total: proyectosList.length,
    };

    // 3. Stock Crítico
    const itemsCriticosRaw = await db
      .select({
        id: inventario.id,
        sku: inventario.sku,
        nombre: inventario.nombre,
        tipo: inventario.tipo,
        stock_actual: inventario.stock_actual,
        stock_minimo: inventario.stock_minimo,
      })
      .from(inventario)
      .where(
        and(
          ne(inventario.tipo, "Servicio"),
          sql`${inventario.stock_actual} <= ${inventario.stock_minimo}`
        )
      )
      .orderBy(asc(inventario.stock_actual));

    const stockCriticoItems: StockCriticoItem[] = itemsCriticosRaw.map((item) => {
      const actual = item.stock_actual ?? 0;
      const minimo = item.stock_minimo ?? 0;
      return {
        id: item.id,
        sku: item.sku,
        nombre: item.nombre,
        tipo: item.tipo as "Fijo" | "Consumible",
        stock_actual: actual,
        stock_minimo: minimo,
        deficit: Math.max(0, minimo - actual),
        quiebreTotal: actual <= 0,
      };
    });

    // 4. Últimas 5 Transacciones
    const ultimasTxRaw = await db.query.transacciones.findMany({
      limit: 5,
      orderBy: [desc(transacciones.fecha_transaccion)],
      with: {
        proyecto: {
          with: {
            cliente: true,
          },
        },
      },
    });

    const ultimasTransacciones: UltimaTransaccion[] = ultimasTxRaw.map((tx) => ({
      id: tx.id,
      tipo: tx.tipo as "Ingreso" | "Egreso",
      categoria: tx.categoria,
      monto: Number(tx.monto) || 0,
      moneda: tx.moneda as "ARS" | "USDT",
      metodo_pago: tx.metodo_pago,
      estado: tx.estado as "Pagado" | "Pendiente",
      descripcion: tx.descripcion,
      fecha_transaccion: tx.fecha_transaccion ? tx.fecha_transaccion.toISOString() : null,
      clienteNombre: tx.proyecto?.cliente?.nombre_razon_social || null,
    }));

    // 5. Últimos 5 Proyectos
    const ultimosProyRaw = await db.query.proyectos.findMany({
      limit: 5,
      orderBy: [desc(proyectos.created_at)],
      with: {
        cliente: true,
      },
    });

    const ultimosProyectos: UltimoProyecto[] = ultimosProyRaw.map((p) => ({
      id: p.id,
      estado: p.estado,
      total_estimado: Number(p.total_estimado) || 0,
      total_final: Number(p.total_final) || 0,
      created_at: p.created_at ? p.created_at.toISOString() : null,
      clienteNombre: p.cliente?.nombre_razon_social || "Cliente no especificado",
    }));

    // 6. Estadísticas Generales
    const [clientesCount] = await db.select({ count: count() }).from(clientes);
    const [inventarioCount] = await db.select({ count: count() }).from(inventario);

    return {
      finanzasARS: {
        ingresos: ingresosARS,
        egresos: egresosARS,
        neto: netoARS,
        porCobrar: porCobrarARS,
        porPagar: porPagarARS,
        totalOperaciones: txMesARS.length,
        mesNombre,
        margenOperativo,
      },
      proyectosCounts,
      stockCritico: {
        count: stockCriticoItems.length,
        items: stockCriticoItems,
      },
      ultimasTransacciones,
      ultimosProyectos,
      statsGenerales: {
        clientesTotales: clientesCount?.count || 0,
        itemsTotales: inventarioCount?.count || 0,
      },
    };
  } catch (error) {
    console.error("Error al obtener datos completos del dashboard:", error);
    return {
      finanzasARS: {
        ingresos: 0,
        egresos: 0,
        neto: 0,
        porCobrar: 0,
        porPagar: 0,
        totalOperaciones: 0,
        mesNombre,
        margenOperativo: 0,
      },
      proyectosCounts: {
        borradorBot: 0,
        enEjecucion: 0,
        finalizados: 0,
        pendienteAprobacion: 0,
        aprobados: 0,
        cancelados: 0,
        total: 0,
      },
      stockCritico: {
        count: 0,
        items: [],
      },
      ultimasTransacciones: [],
      ultimosProyectos: [],
      statsGenerales: {
        clientesTotales: 0,
        itemsTotales: 0,
      },
    };
  }
}

// Mantenemos getDashboardMetrics por compatibilidad retrospectiva
export async function getDashboardMetrics() {
  const data = await getDashboardData();
  return {
    clientesTotales: data.statsGenerales.clientesTotales,
    proyectosActivos: data.proyectosCounts.enEjecucion + data.proyectosCounts.aprobados,
    stockBajo: data.stockCritico.count,
  };
}
