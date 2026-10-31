"use server";

import { db } from "@/db";
import { usuarios, autenticadoresBiometricos } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession, setSessionCookie, signSessionToken, SessionUser } from "@/utils/auth";
import {
  getWebAuthnConfig,
  setWebauthnChallenge,
  getWebauthnChallenge,
  clearWebauthnChallenge,
} from "@/utils/webauthn";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from "@simplewebauthn/server";

// =========================================================================
// 1. REGISTRO DE NUEVA HUELLA DIGITAL / DISPOSITIVO BIOMÉTRICO (Desde Perfil)
// =========================================================================

export async function generateRegistrationOptionsAction() {
  const session = await getSession();
  if (!session) {
    return { error: "Debe iniciar sesión para vincular un dispositivo biométrico." };
  }

  const user = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, session.id),
  });

  if (!user || !user.activo) {
    return { error: "Usuario inválido o inactivo." };
  }

  const { rpName, rpID } = await getWebAuthnConfig();

  // Obtener credenciales existentes del usuario para evitar duplicar el mismo dispositivo
  const credsExistentes = await db.query.autenticadoresBiometricos.findMany({
    where: eq(autenticadoresBiometricos.usuario_id, user.id),
  });

  const excludeCredentials = credsExistentes.map((c) => ({
    id: c.credential_id,
    transports: c.transports ? JSON.parse(c.transports) : undefined,
  }));

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID: new TextEncoder().encode(user.id),
    userName: user.email,
    userDisplayName: user.nombre,
    attestationType: "none",
    excludeCredentials,
    authenticatorSelection: {
      authenticatorAttachment: "platform", // Sensor biométrico integrado en el teléfono/PC (TouchID/FaceID/Huella)
      residentKey: "preferred",
      userVerification: "required", // Exige validación biométrica en el dispositivo
    },
  });

  // Guardar desafío en cookie temporal
  await setWebauthnChallenge(options.challenge, user.id);

  return { options };
}

export async function verifyRegistrationAction(
  response: RegistrationResponseJSON,
  nombreDispositivo: string
) {
  const session = await getSession();
  if (!session) {
    return { error: "Sesión no válida." };
  }

  const challengeRecord = await getWebauthnChallenge();
  if (!challengeRecord || challengeRecord.userId !== session.id) {
    return { error: "El desafío biométrico ha expirado. Intente vincular de nuevo." };
  }

  const { rpID, origin } = await getWebAuthnConfig();

  try {
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return { error: "No se pudo verificar la huella digital en el dispositivo." };
    }

    const { credential, credentialDeviceType, credentialBackedUp } =
      verification.registrationInfo;

    const publicKeyBase64 = Buffer.from(credential.publicKey).toString("base64url");
    const transportsJSON = response.response.transports
      ? JSON.stringify(response.response.transports)
      : null;

    // Guardar credencial biométrica en base de datos
    await db.insert(autenticadoresBiometricos).values({
      usuario_id: session.id,
      credential_id: credential.id,
      public_key: publicKeyBase64,
      counter: credential.counter,
      device_type: credentialDeviceType,
      backed_up: credentialBackedUp,
      transports: transportsJSON,
      nombre_dispositivo: nombreDispositivo.trim() || "Dispositivo Móvil",
    });

    await clearWebauthnChallenge();

    return { success: true };
  } catch (err: any) {
    console.error("Error en verifyRegistration:", err);
    return { error: err.message || "Error al registrar la credencial biométrica." };
  }
}

// =========================================================================
// 2. AUTENTICACIÓN / LOGIN CON HUELLA DIGITAL (Desde Login)
// =========================================================================

export async function generateAuthenticationOptionsAction(email?: string) {
  try {
    const { rpID } = await getWebAuthnConfig();

    let allowCredentials: { id: string; transports?: any }[] | undefined = undefined;

    if (email) {
      const cleanEmail = email.trim().toLowerCase();
      const user = await db.query.usuarios.findFirst({
        where: eq(usuarios.email, cleanEmail),
      });

      if (user) {
        const creds = await db.query.autenticadoresBiometricos.findMany({
          where: eq(autenticadoresBiometricos.usuario_id, user.id),
        });

        if (creds.length > 0) {
          allowCredentials = creds.map((c) => ({
            id: c.credential_id,
            transports: c.transports ? JSON.parse(c.transports) : undefined,
          }));
        }
      }
    }

    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: "required", // Obliga huella digital o FaceID
      allowCredentials,
    });

    await setWebauthnChallenge(options.challenge);

    return { options };
  } catch (err: any) {
    console.error("Error en generateAuthenticationOptionsAction:", err);
    return { error: err.message || "Error al preparar la autenticación biométrica." };
  }
}

export async function verifyAuthenticationAction(response: AuthenticationResponseJSON) {
  const challengeRecord = await getWebauthnChallenge();
  if (!challengeRecord) {
    return { error: "El tiempo de validación biométrica expiró. Intente de nuevo." };
  }

  const { rpID, origin } = await getWebAuthnConfig();

  // Buscar el autenticador en la base de datos por el credential_id devuelto por el teléfono
  const authRecord = await db.query.autenticadoresBiometricos.findFirst({
    where: eq(autenticadoresBiometricos.credential_id, response.id),
    with: {
      usuario: true,
    },
  });

  if (!authRecord || !authRecord.usuario) {
    return { error: "Este dispositivo no está vinculado a ninguna cuenta del sistema." };
  }

  const user = authRecord.usuario;
  if (!user.activo) {
    return { error: "La cuenta asociada se encuentra inactiva." };
  }

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challengeRecord.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      credential: {
        id: authRecord.credential_id,
        publicKey: Buffer.from(authRecord.public_key, "base64url"),
        counter: authRecord.counter,
        transports: authRecord.transports ? JSON.parse(authRecord.transports) : undefined,
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return { error: "Firma biométrica no válida." };
    }

    // Actualizar contador y fecha de último uso para protección anti-clonación
    await db
      .update(autenticadoresBiometricos)
      .set({
        counter: verification.authenticationInfo.newCounter,
        last_used_at: new Date(),
      })
      .where(eq(autenticadoresBiometricos.id, authRecord.id));

    // Actualizar last_login_at del usuario
    await db
      .update(usuarios)
      .set({ last_login_at: new Date() })
      .where(eq(usuarios.id, user.id));

    // Generar sesión JWT
    const sessionPayload: SessionUser = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      telefono: user.telefono || null,
      especialidad: user.especialidad || null,
    };

    const token = await signSessionToken(sessionPayload);
    await setSessionCookie(token);
    await clearWebauthnChallenge();

    return { success: true };
  } catch (err: any) {
    console.error("Error en verifyAuthentication:", err);
    return { error: err.message || "Error en la validación biométrica." };
  }
}

// =========================================================================
// 3. GESTIÓN DE DISPOSITIVOS VINCULADOS
// =========================================================================

export async function getMisDispositivosBiometricosAction() {
  const session = await getSession();
  if (!session) return [];

  const creds = await db.query.autenticadoresBiometricos.findMany({
    where: eq(autenticadoresBiometricos.usuario_id, session.id),
    orderBy: (creds, { desc }) => [desc(creds.created_at)],
  });

  return creds.map((c) => ({
    id: c.id,
    nombre: c.nombre_dispositivo,
    creado: c.created_at ? c.created_at.toISOString() : null,
    ultimoUso: c.last_used_at ? c.last_used_at.toISOString() : null,
  }));
}

export async function eliminarDispositivoBiometricoAction(id: string) {
  const session = await getSession();
  if (!session) {
    return { error: "No autorizado." };
  }

  await db
    .delete(autenticadoresBiometricos)
    .where(
      and(
        eq(autenticadoresBiometricos.id, id),
        eq(autenticadoresBiometricos.usuario_id, session.id)
      )
    );

  return { success: true };
}
