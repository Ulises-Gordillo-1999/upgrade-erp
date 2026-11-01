"use server";

import { db } from "@/db";
import { suscripcionesPush, usuarios } from "@/db/schema";
import { eq, and, inArray } from "drizzle-orm";
import { getSession } from "@/utils/auth";
import { registrarAuditoria } from "./auditoria";
import {
  sendWebPushNotification,
  getVapidPublicKey,
  PushNotificationPayload,
} from "@/lib/webpush";

export interface SubscriptionInput {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  deviceName?: string;
}

/**
 * Obtener la clave pública VAPID para que el navegador/Service Worker pueda suscribirse
 */
export async function getVapidPublicKeyAction(): Promise<{ publicKey?: string; error?: string }> {
  try {
    const key = getVapidPublicKey();
    if (!key) {
      return { error: "Clave pública VAPID no configurada en las variables de entorno del servidor." };
    }
    return { publicKey: key };
  } catch (error: any) {
    return { error: error.message || "Error al obtener clave VAPID." };
  }
}

/**
 * Guardar o actualizar una suscripción Push en la base de datos vinculada al usuario autenticado
 */
export async function saveSubscriptionAction(
  input: SubscriptionInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Sesión no autenticada." };
    }

    if (!input.endpoint || !input.keys?.p256dh || !input.keys?.auth) {
      return { success: false, error: "Datos de suscripción incompletos." };
    }

    // Verificar si el endpoint ya existe para este usuario u otro
    const existing = await db.query.suscripcionesPush.findFirst({
      where: eq(suscripcionesPush.endpoint, input.endpoint),
    });

    if (existing) {
      await db
        .update(suscripcionesPush)
        .set({
          usuario_id: session.id,
          p256dh: input.keys.p256dh,
          auth: input.keys.auth,
          user_agent: input.userAgent || existing.user_agent,
          nombre_dispositivo: input.deviceName || existing.nombre_dispositivo,
          last_used_at: new Date(),
        })
        .where(eq(suscripcionesPush.id, existing.id));
    } else {
      await db.insert(suscripcionesPush).values({
        usuario_id: session.id,
        endpoint: input.endpoint,
        p256dh: input.keys.p256dh,
        auth: input.keys.auth,
        user_agent: input.userAgent,
        nombre_dispositivo: input.deviceName || "Navegador Web",
        last_used_at: new Date(),
      });
    }

    await registrarAuditoria({
      modulo: "Seguridad",
      accion: "Activación de Notificaciones Push",
      detalle: `Dispositivo "${input.deviceName || "Navegador Web"}" vinculado exitosamente para alertas en tiempo real.`,
    });

    return { success: true };
  } catch (error: any) {
    console.error("[WebPush Action] Error al guardar suscripción:", error);
    return { success: false, error: error.message || "Error al registrar suscripción Push." };
  }
}

/**
 * Eliminar una suscripción Push de la base de datos (revocación voluntaria)
 */
export async function deleteSubscriptionAction(
  endpoint: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, error: "Sesión no autenticada." };
    }

    const sub = await db.query.suscripcionesPush.findFirst({
      where: and(
        eq(suscripcionesPush.endpoint, endpoint),
        eq(suscripcionesPush.usuario_id, session.id)
      ),
    });

    if (sub) {
      await db.delete(suscripcionesPush).where(eq(suscripcionesPush.id, sub.id));

      await registrarAuditoria({
        modulo: "Seguridad",
        accion: "Desactivación de Notificaciones Push",
        detalle: `Se revocó la recepción de alertas en "${sub.nombre_dispositivo || "Dispositivo"}".`,
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("[WebPush Action] Error al eliminar suscripción:", error);
    return { success: false, error: error.message || "Error al desuscribir dispositivo." };
  }
}

/**
 * Obtener los dispositivos suscritos para el usuario actual
 */
export async function getUserPushSubscriptionsAction() {
  try {
    const session = await getSession();
    if (!session) {
      return { subscriptions: [] };
    }

    const list = await db.query.suscripcionesPush.findMany({
      where: eq(suscripcionesPush.usuario_id, session.id),
      orderBy: (suscripciones, { desc }) => [desc(suscripciones.created_at)],
    });

    return {
      subscriptions: list.map((s) => ({
        id: s.id,
        endpoint: s.endpoint,
        nombre_dispositivo: s.nombre_dispositivo,
        created_at: s.created_at?.toISOString() || null,
        last_used_at: s.last_used_at?.toISOString() || null,
      })),
    };
  } catch (error: any) {
    console.error("[WebPush Action] Error al obtener suscripciones:", error);
    return { subscriptions: [] };
  }
}

/**
 * Enviar notificación de prueba inmediata al dispositivo actual o a todos los del usuario
 */
export async function sendTestNotificationAction(
  targetEndpoint?: string
): Promise<{ success: boolean; sentCount: number; error?: string }> {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, sentCount: 0, error: "Sesión no autenticada." };
    }

    let subs = await db.query.suscripcionesPush.findMany({
      where: eq(suscripcionesPush.usuario_id, session.id),
    });

    if (targetEndpoint) {
      subs = subs.filter((s) => s.endpoint === targetEndpoint);
    }

    if (subs.length === 0) {
      return {
        success: false,
        sentCount: 0,
        error: "No se encontraron suscripciones activas para este usuario.",
      };
    }

    const payload: PushNotificationPayload = {
      title: "🔔 UPGRADE ERP • Notificación Activa",
      body: `¡Hola ${session.nombre}! Las alertas Web Push nativas están funcionando al 100% en tu equipo.`,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      url: "/perfil",
      tag: "test-notification",
    };

    let sent = 0;
    const expiredIds: string[] = [];

    for (const sub of subs) {
      const res = await sendWebPushNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );

      if (res.success) {
        sent++;
      } else if (res.expired) {
        expiredIds.push(sub.id);
      }
    }

    // Limpiar suscripciones expiradas si el usuario desinstaló la app o revocó permisos
    if (expiredIds.length > 0) {
      await db
        .delete(suscripcionesPush)
        .where(inArray(suscripcionesPush.id, expiredIds));
    }

    return { success: sent > 0, sentCount: sent };
  } catch (error: any) {
    console.error("[WebPush Action] Error al enviar prueba:", error);
    return { success: false, sentCount: 0, error: error.message || "Error al enviar notificación de prueba." };
  }
}

/**
 * Enviar notificación push a un usuario específico del ERP
 */
export async function sendPushNotificationToUser(
  usuarioId: string,
  payload: PushNotificationPayload
): Promise<number> {
  try {
    const subs = await db.query.suscripcionesPush.findMany({
      where: eq(suscripcionesPush.usuario_id, usuarioId),
    });

    if (subs.length === 0) return 0;

    let sent = 0;
    const expiredIds: string[] = [];

    for (const sub of subs) {
      const res = await sendWebPushNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        payload
      );

      if (res.success) {
        sent++;
      } else if (res.expired) {
        expiredIds.push(sub.id);
      }
    }

    if (expiredIds.length > 0) {
      await db
        .delete(suscripcionesPush)
        .where(inArray(suscripcionesPush.id, expiredIds));
    }

    return sent;
  } catch (error) {
    console.error("[WebPush Helper] Error enviando a usuario:", error);
    return 0;
  }
}

/**
 * Enviar notificación push a todos los usuarios con roles específicos (ej. 'SuperAdmin', 'Admin')
 */
export async function sendPushNotificationToRoles(
  roles: ("SuperAdmin" | "Admin" | "Tecnico")[],
  payload: PushNotificationPayload
): Promise<number> {
  try {
    const targetUsers = await db.query.usuarios.findMany({
      where: and(inArray(usuarios.rol, roles), eq(usuarios.activo, true)),
      columns: { id: true },
    });

    if (targetUsers.length === 0) return 0;

    let totalSent = 0;
    for (const u of targetUsers) {
      const sent = await sendPushNotificationToUser(u.id, payload);
      totalSent += sent;
    }

    return totalSent;
  } catch (error) {
    console.error("[WebPush Helper] Error enviando a roles:", error);
    return 0;
  }
}
