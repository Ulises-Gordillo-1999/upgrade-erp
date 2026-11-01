import webpush from "web-push";
import fs from "fs";
import path from "path";

/**
 * Lee variables de entorno con fallback dinámico a .env.local
 * para evitar requerir reinicio del servidor si el archivo fue creado recientemente.
 */
function getEnvValue(key: string): string {
  if (process.env[key]) {
    return process.env[key]!;
  }

  try {
    const envPath = path.join(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8");
      for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (trimmed.startsWith(`${key}=`)) {
          const val = trimmed.slice(key.length + 1).trim();
          process.env[key] = val;
          return val;
        }
      }
    }
  } catch (e) {
    // Silencioso si no se puede leer el archivo
  }

  return "";
}

let isVapidInitialized = false;

function ensureVapidInitialized() {
  if (isVapidInitialized) return;

  const pubKey = getEnvValue("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
  const privKey = getEnvValue("VAPID_PRIVATE_KEY");
  const subject = getEnvValue("VAPID_SUBJECT") || "mailto:soporte@upgrade-informatica.com";

  if (pubKey && privKey) {
    try {
      webpush.setVapidDetails(subject, pubKey, privKey);
      isVapidInitialized = true;
    } catch (err) {
      console.warn("[WebPush] No se pudieron configurar los detalles VAPID:", err);
    }
  }
}

// Intentar inicialización inmediata
ensureVapidInitialized();

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
    ensureVapidInitialized();

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
  ensureVapidInitialized();
  return getEnvValue("NEXT_PUBLIC_VAPID_PUBLIC_KEY");
}


