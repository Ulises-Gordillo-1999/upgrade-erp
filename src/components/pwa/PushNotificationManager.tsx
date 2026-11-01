"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  BellRing,
  BellOff,
  Smartphone,
  Laptop,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Send,
  ShieldCheck,
  Radio,
} from "lucide-react";
import {
  getVapidPublicKeyAction,
  saveSubscriptionAction,
  deleteSubscriptionAction,
  getUserPushSubscriptionsAction,
  sendTestNotificationAction,
} from "@/app/actions/webpush";

interface DeviceSubscription {
  id: string;
  endpoint: string;
  nombre_dispositivo: string | null;
  created_at: string | null;
  last_used_at: string | null;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function detectDeviceName(): string {
  if (typeof window === "undefined") return "Dispositivo Desconocido";

  const ua = navigator.userAgent;
  let os = "PC";
  if (/Android/i.test(ua)) os = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS (Apple)";
  else if (/Windows/i.test(ua)) os = "Windows PC";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "Mac";
  else if (/Linux/i.test(ua)) os = "Linux";

  let browser = "Navegador";
  if (/Chrome/i.test(ua) && !/Edge|OPR/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  else if (/Edg/i.test(ua)) browser = "Edge";

  return `${os} (${browser})`;
}

export function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<string | null>(null);
  const [deviceName, setDeviceName] = useState("");
  const [subscriptionsList, setSubscriptionsList] = useState<DeviceSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  // 1. Diagnóstico de capacidades y suscripción actual
  useEffect(() => {
    checkSupportAndSubscription();
    loadSubscriptionsList();
  }, []);

  const checkSupportAndSubscription = async () => {
    if (
      typeof window === "undefined" ||
      !("serviceWorker" in navigator) ||
      !("PushManager" in window) ||
      !("Notification" in window)
    ) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    setPermission(Notification.permission);
    setDeviceName(detectDeviceName());

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();

      if (sub) {
        setIsSubscribed(true);
        setCurrentEndpoint(sub.endpoint);
      } else {
        setIsSubscribed(false);
        setCurrentEndpoint(null);
      }
    } catch (err) {
      console.warn("[PushManager] Error al verificar suscripción:", err);
    }
  };

  const loadSubscriptionsList = async () => {
    const res = await getUserPushSubscriptionsAction();
    if (res?.subscriptions) {
      setSubscriptionsList(res.subscriptions);
    }
  };

  // 2. Suscribir este dispositivo a Web Push
  const handleSubscribe = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      // Pedir permiso explícito al usuario
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setMessage({
          type: "error",
          text: "Permiso denegado por el navegador. Habilita las notificaciones en la configuración del sitio para continuar.",
        });
        setIsLoading(false);
        return;
      }

      // Obtener clave pública VAPID
      const vapidRes = await getVapidPublicKeyAction();
      if (!vapidRes.publicKey) {
        throw new Error(vapidRes.error || "No se pudo obtener la clave VAPID pública.");
      }

      const reg = await navigator.serviceWorker.ready;
      const convertedVapidKey = urlBase64ToUint8Array(vapidRes.publicKey);

      // Crear suscripción en el navegador
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });

      const subJSON = subscription.toJSON();
      if (!subJSON.endpoint || !subJSON.keys?.p256dh || !subJSON.keys?.auth) {
        throw new Error("Datos de suscripción criptográfica incompletos generados por el navegador.");
      }

      // Persistir en PostgreSQL
      const saveRes = await saveSubscriptionAction({
        endpoint: subJSON.endpoint,
        keys: {
          p256dh: subJSON.keys.p256dh,
          auth: subJSON.keys.auth,
        },
        userAgent: navigator.userAgent,
        deviceName: deviceName.trim() || detectDeviceName(),
      });

      if (!saveRes.success) {
        throw new Error(saveRes.error || "Error al registrar suscripción en la base de datos.");
      }

      setIsSubscribed(true);
      setCurrentEndpoint(subJSON.endpoint);
      setMessage({
        type: "success",
        text: "¡Notificaciones Push activadas con éxito! Ahora recibirás alertas en tiempo real en este equipo.",
      });

      await loadSubscriptionsList();
    } catch (err: any) {
      console.error("[PushManager] Error al suscribir:", err);
      setMessage({
        type: "error",
        text: err.message || "Ocurrió un error al activar las notificaciones.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Desuscribir este dispositivo
  const handleUnsubscribe = async (endpointToUnsubscribe?: string) => {
    setIsLoading(true);
    setMessage(null);

    try {
      const targetEndpoint = endpointToUnsubscribe || currentEndpoint;

      // Si es el dispositivo actual, desuscribir del navegador
      if (!endpointToUnsubscribe || endpointToUnsubscribe === currentEndpoint) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await sub.unsubscribe();
        }
        setIsSubscribed(false);
        setCurrentEndpoint(null);
      }

      // Eliminar de PostgreSQL
      if (targetEndpoint) {
        await deleteSubscriptionAction(targetEndpoint);
      }

      setMessage({
        type: "info",
        text: "Dispositivo desvinculado de las alertas push.",
      });

      await loadSubscriptionsList();
    } catch (err: any) {
      console.error("[PushManager] Error al desuscribir:", err);
      setMessage({
        type: "error",
        text: err.message || "Error al desvincular dispositivo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Enviar notificación de prueba inmediata
  const handleSendTest = async (endpoint?: string) => {
    setIsTesting(true);
    setMessage(null);

    try {
      const res = await sendTestNotificationAction(endpoint || currentEndpoint || undefined);
      if (res.success) {
        setMessage({
          type: "success",
          text: `¡Notificación enviada! Deberías verla en la barra de estado de tu pantalla (${res.sentCount} dispositivo notificado).`,
        });
      } else {
        setMessage({
          type: "error",
          text: res.error || "No se pudo entregar la notificación de prueba.",
        });
      }
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.message || "Error al enviar prueba.",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isSupported === false) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 sm:p-6 text-amber-700 dark:text-amber-400 space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <h4 className="font-semibold text-sm">Navegador no compatible</h4>
        </div>
        <p className="text-xs">
          Tu navegador actual no soporta el estándar Web Push (PushManager / ServiceWorker). Para recibir notificaciones nativas, utiliza Google Chrome, Microsoft Edge, o Safari en iOS 16.4+ agregado a la pantalla de inicio.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header del módulo */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            <BellRing className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Notificaciones Web Push Nativas
            </h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400">
              Reciba avisos de stock crítico, asignación de proyectos y cambios de estado directamente en su celular y PC.
            </p>
          </div>
        </div>
      </div>

      {/* Feedback contextual */}
      {message && (
        <div
          className={`p-3.5 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
            message.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
              : message.type === "error"
              ? "bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400"
              : "bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400"
          }`}
        >
          {message.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {message.type === "error" && <AlertTriangle className="w-4 h-4 shrink-0" />}
          {message.type === "info" && <Radio className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tarjeta de Estado del Dispositivo Actual */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950/40 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 shrink-0">
              {/Android|iOS/i.test(deviceName) ? (
                <Smartphone className="w-5 h-5" />
              ) : (
                <Laptop className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {deviceName || "Este Dispositivo"}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-semibold ${
                    isSubscribed
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border-slate-300 dark:border-zinc-700"
                  }`}
                >
                  {isSubscribed ? "● ACTIVO" : "○ INACTIVO"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                {isSubscribed
                  ? "Este navegador está recibiendo notificaciones en tiempo real."
                  : "Activa el receptor para recibir alertas aunque tengas la ventana cerrada."}
              </p>
            </div>
          </div>

          {/* Botones de Acción para este Dispositivo */}
          <div className="flex items-center gap-2 pt-2 sm:pt-0">
            {isSubscribed ? (
              <>
                <button
                  type="button"
                  onClick={() => handleSendTest()}
                  disabled={isTesting || isLoading}
                  className="flex-1 sm:flex-initial min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border border-cyan-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Enviar notificación de prueba a este dispositivo"
                >
                  {isTesting ? (
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-500" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Probar Alerta</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleUnsubscribe()}
                  disabled={isLoading}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Desactivar notificaciones en este equipo"
                >
                  <BellOff className="w-4 h-4" />
                  <span className="hidden sm:inline">Desactivar</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleSubscribe}
                disabled={isLoading}
                className="w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4" />
                    <span>Activar en este Equipo</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Input para personalizar nombre del equipo al suscribirse */}
        {!isSubscribed && (
          <div className="pt-2 border-t border-slate-200 dark:border-zinc-800">
            <label className="text-xs font-medium text-slate-700 dark:text-zinc-300 block mb-1">
              Nombre descriptivo de este equipo:
            </label>
            <input
              type="text"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="Ej: Celular Samsung Ulises, Laptop Taller..."
              className="w-full min-h-[44px] px-3.5 py-2 text-base sm:text-xs bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-slate-900 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        )}
      </div>

      {/* Lista de Dispositivos Registrados para este Usuario */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Dispositivos Vinculados ({subscriptionsList.length})</span>
          </h4>
          {subscriptionsList.length > 0 && (
            <button
              type="button"
              onClick={() => handleSendTest()}
              disabled={isTesting}
              className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3 h-3" />
              <span>Notificar a todos</span>
            </button>
          )}
        </div>

        {subscriptionsList.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 p-6 text-center text-slate-400 dark:text-zinc-500">
            <BellOff className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs font-medium">No hay dispositivos vinculados aún.</p>
            <p className="text-[11px] mt-0.5">
              Haz clic en "Activar en este Equipo" arriba para recibir alertas automáticas.
            </p>
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {subscriptionsList.map((sub) => {
              const isCurrent = sub.endpoint === currentEndpoint;
              return (
                <div
                  key={sub.id}
                  className={`rounded-2xl border p-3.5 flex items-center justify-between gap-3 transition-colors ${
                    isCurrent
                      ? "border-cyan-500/40 bg-cyan-500/5 dark:bg-cyan-500/5"
                      : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 shrink-0">
                      {/Android|iOS/i.test(sub.nombre_dispositivo || "") ? (
                        <Smartphone className="w-4 h-4 text-cyan-500" />
                      ) : (
                        <Laptop className="w-4 h-4 text-cyan-500" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate">
                          {sub.nombre_dispositivo || "Dispositivo Web"}
                        </p>
                        {isCurrent && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-700 dark:text-cyan-300">
                            Actual
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 mt-0.5">
                        Vinculado: {sub.created_at ? new Date(sub.created_at).toLocaleDateString("es-AR") : "Reciente"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSendTest(sub.endpoint)}
                      disabled={isTesting}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Enviar alerta de prueba a este dispositivo"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUnsubscribe(sub.endpoint)}
                      disabled={isLoading}
                      className="min-h-[36px] min-w-[36px] flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Eliminar este dispositivo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
