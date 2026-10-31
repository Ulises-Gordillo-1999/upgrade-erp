import { headers, cookies } from "next/headers";

const CHALLENGE_COOKIE_NAME = "upgrade_webauthn_challenge";

export interface WebAuthnConfig {
  rpName: string;
  rpID: string;
  origin: string;
}

/**
 * Obtiene la configuración del Relying Party (RP) infiriendo de forma dinámica
 * el hostname y protocolo actual (soporta localhost y dominios de producción como erp.upgrade-informatica.com)
 */
export async function getWebAuthnConfig(): Promise<WebAuthnConfig> {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const [hostname] = host.split(":");
  const proto =
    headersList.get("x-forwarded-proto") ||
    (hostname === "localhost" || hostname === "127.0.0.1" ? "http" : "https");
  
  const origin = `${proto}://${host}`;
  const rpID = process.env.RP_ID || hostname;

  return {
    rpName: "UPGRADE ERP",
    rpID,
    origin,
  };
}

/**
 * Guarda el desafío criptográfico (challenge) en una cookie HttpOnly temporal
 */
export async function setWebauthnChallenge(challenge: string, userId?: string) {
  const cookieStore = await cookies();
  const payload = JSON.stringify({
    challenge,
    userId: userId || null,
    createdAt: Date.now(),
  });

  cookieStore.set(CHALLENGE_COOKIE_NAME, payload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 300, // 5 minutos de validez
  });
}

/**
 * Recupera el desafío almacenado para validación
 */
export async function getWebauthnChallenge(): Promise<{
  challenge: string;
  userId: string | null;
} | null> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(CHALLENGE_COOKIE_NAME)?.value;
  if (!raw) return null;

  try {
    const data = JSON.parse(raw);
    // Verificar que no haya expirado (máximo 5 minutos)
    if (Date.now() - data.createdAt > 300000) {
      return null;
    }
    return { challenge: data.challenge, userId: data.userId };
  } catch {
    return null;
  }
}

/**
 * Limpia la cookie del desafío
 */
export async function clearWebauthnChallenge() {
  const cookieStore = await cookies();
  cookieStore.delete(CHALLENGE_COOKIE_NAME);
}

