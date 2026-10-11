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

// Si la base de datos no tiene usuarios, inicializa automáticamente los SuperAdmins fundadores
async function seedInitialUsersIfEmpty() {
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
}

export async function loginUser(prevState: any, formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Por favor complete todos los campos." };
  }

  try {
    await seedInitialUsersIfEmpty();

    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.email, email),
    });

    if (!user) {
      return { error: "Credenciales inválidas. Verifique correo o contraseña." };
    }

    if (!user.activo) {
      return { error: "Su cuenta se encuentra inactiva. Contacte al administrador." };
    }

    const isMatch = await verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return { error: "Credenciales inválidas. Verifique correo o contraseña." };
    }

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
