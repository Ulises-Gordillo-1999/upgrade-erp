import webpush from "web-push";

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:soporte@upgrade-informatica.com";

if (vapidPublicKey && vapidPrivateKey) {
  try {
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  } catch (err) {
    console.warn("[WebPush] No se pudieron configurar los detalles VAPID:", err);
  }
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  data?: Record<string, any>;
}

export async function sendWebPushNotification(
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  },
  payload: PushNotificationPayload
) {
  try {
    const payloadString = JSON.stringify({
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icons/icon-192.png",
      badge: payload.badge || "/icons/icon-192.png",
      url: payload.url || "/",
      tag: payload.tag || "upgrade-alert",
      ...payload.data,
    });

    const result = await webpush.sendNotification(subscription, payloadString);
    return { success: true, result };
  } catch (error: any) {
    // 410 Gone o 404 Not Found indica que el endpoint expiró o fue desuscrito por el navegador
    if (error.statusCode === 410 || error.statusCode === 404) {
      return { expired: true, error };
    }
    console.error("[WebPush] Error al enviar notificación:", error);
    return { success: false, error };
  }
}

export function getVapidPublicKey(): string {
  return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
}
