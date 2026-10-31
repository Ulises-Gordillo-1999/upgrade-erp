"use server";

import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import {
  signSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getSession,
  verifyPassword,
  hashPassword,
  SessionUser,
} from "@/utils/auth";
import { redirect } from "next/navigation";

// Cache en memoria para evitar consultas repetitivas de seed
let isInitialSeedChecked = false;

// Registro en memoria de intentos de login para mitigación de fuerza bruta
interface RateLimitRecord {
  attempts: number;
  blockedUntil: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 5 * 60 * 1000; // 5 minutos

// Si la base de datos no tiene usuarios, inicializa automáticamente los SuperAdmins fundadores
async function seedInitialUsersIfEmpty() {
  if (isInitialSeedChecked) return;
  const [res] = await db.select({ count: count() }).from(usuarios);
  if (res && res.count === 0) {
    const defaultPasswordHash = await hashPassword("admin123");
    await db.insert(usuarios).values([
      {
        nombre: "Ulises",
        email: "ulises@upgrade.com",
        password_hash: defaultPasswordHash,
        rol: "SuperAdmin",
        activo: true,
      },
      {
        nombre: "Gabriel",
        email: "gabriel@upgrade.com",
        password_hash: defaultPasswordHash,
        rol: "SuperAdmin",
        activo: true,
      },
      {
        nombre: "Admin Upgrade",
        email: "admin@upgrade.com",
        password_hash: defaultPasswordHash,
        rol: "SuperAdmin",
        activo: true,
      },
    ]);
  }
  isInitialSeedChecked = true;
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor complete todos los campos." };
  }

  // 1. Verificación de Rate Limiting / Bloqueo anti-fuerza bruta
  const now = Date.now();
  const attemptRecord = loginAttempts.get(email);

  if (attemptRecord && attemptRecord.blockedUntil > now) {
    const remainingMinutes = Math.ceil((attemptRecord.blockedUntil - now) / 60000);
    return {
      error: `Demasiados intentos fallidos. Acceso bloqueado temporalmente por seguridad. Intente nuevamente en ${remainingMinutes} minuto(s).`,
    };
  }

  try {
    await seedInitialUsersIfEmpty();

    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, email),
    });

    if (!user) {
      // Registrar intento fallido
      const currentAttempts = (attemptRecord?.attempts || 0) + 1;
      const isBlocked = currentAttempts >= MAX_FAILED_ATTEMPTS;
      loginAttempts.set(email, {
        attempts: currentAttempts,
        blockedUntil: isBlocked ? now + BLOCK_DURATION_MS : 0,
      });

      return { error: "Credenciales inválidas. Verifique correo o contraseña." };
    }

    if (!user.activo) {
      return { error: "Su cuenta se encuentra inactiva. Contacte al administrador." };
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      // Registrar intento fallido
      const currentAttempts = (attemptRecord?.attempts || 0) + 1;
      const isBlocked = currentAttempts >= MAX_FAILED_ATTEMPTS;
      loginAttempts.set(email, {
        attempts: currentAttempts,
        blockedUntil: isBlocked ? now + BLOCK_DURATION_MS : 0,
      });

      if (isBlocked) {
        return {
          error: "Demasiados intentos fallidos consecutivos. Su acceso ha sido bloqueado temporalmente por 5 minutos.",
        };
      }

      const remainingAttempts = MAX_FAILED_ATTEMPTS - currentAttempts;
      return {
        error: `Credenciales inválidas. (${remainingAttempts} intento(s) restante(s)).`,
      };
    }

    // Reset de intentos fallidos ante login exitoso
    loginAttempts.delete(email);

    await db
      .update(usuarios)
      .set({ last_login_at: new Date() })
      .where(eq(usuarios.id, user.id));

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

    return { success: true };
  } catch (err: any) {
    console.error("Error en login:", err);
    return { error: "Error en el servidor al iniciar sesión. Inténtelo nuevamente." };
  }
}

export async function logoutUser() {
  await clearSessionCookie();
  redirect("/login");
}

export async function getAuthUser() {
  return await getSession();
}
