"use server";

import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { eq, and, ne } from "drizzle-orm";
import {
  getSession,
  verifyPassword,
  hashPassword,
  signSessionToken,
  setSessionCookie,
  SessionUser,
} from "@/utils/auth";
import { revalidatePath } from "next/cache";

export async function getMiPerfil() {
  const session = await getSession();
  if (!session) {
    throw new Error("No autenticado");
  }

  const user = await db.query.usuarios.findFirst({
    where: eq(usuarios.id, session.id),
  });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  return {
    id: user.id,
    nombre: user.nombre,
    email: user.email,
    rol: user.rol,
    telefono: user.telefono || "",
    especialidad: user.especialidad || "",
    activo: user.activo,
    last_login_at: user.last_login_at ? user.last_login_at.toISOString() : null,
    created_at: user.created_at ? user.created_at.toISOString() : null,
  };
}

export async function updateMiPerfil(data: {
  nombre: string;
  telefono?: string;
  especialidad?: string;
}) {
  const session = await getSession();
  if (!session) {
    return { error: "No autorizado." };
  }

  if (!data.nombre || data.nombre.trim().length === 0) {
    return { error: "El nombre es obligatorio." };
  }

  try {
    const [updated] = await db
      .update(usuarios)
      .set({
        nombre: data.nombre.trim(),
        telefono: data.telefono?.trim() || null,
        especialidad: data.especialidad?.trim() || null,
      })
      .where(eq(usuarios.id, session.id))
      .returning();

    // Actualizar cookie de sesión con el nuevo nombre
    const updatedSession: SessionUser = {
      ...session,
      nombre: updated.nombre,
      telefono: updated.telefono,
      especialidad: updated.especialidad,
    };
    const newToken = await signSessionToken(updatedSession);
    await setSessionCookie(newToken);

    revalidatePath("/perfil");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Error al actualizar perfil:", err);
    return { error: "Error al actualizar perfil. Intente nuevamente." };
  }
}

export async function cambiarMiEmail(data: {
  nuevoEmail: string;
  passwordActual: string;
}) {
  const session = await getSession();
  if (!session) {
    return { error: "No autorizado." };
  }

  const emailLimpio = data.nuevoEmail.trim().toLowerCase();
  if (!emailLimpio || !data.passwordActual) {
    return { error: "Complete todos los campos requeridos." };
  }

  try {
    // Verificar si el nuevo email ya está en uso por otro usuario
    const existente = await db.query.usuarios.findFirst({
      where: and(eq(usuarios.email, emailLimpio), ne(usuarios.id, session.id)),
    });

    if (existente) {
      return { error: "Este correo electrónico ya se encuentra registrado por otro usuario." };
    }

    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, session.id),
    });

    if (!user) {
      return { error: "Usuario no encontrado." };
    }

    const isValid = await verifyPassword(data.passwordActual, user.password_hash);
    if (!isValid) {
      return { error: "La contraseña actual es incorrecta." };
    }

    const [updated] = await db
      .update(usuarios)
      .set({ email: emailLimpio })
      .where(eq(usuarios.id, session.id))
      .returning();

    // Actualizar token de sesión con el nuevo correo
    const updatedSession: SessionUser = {
      ...session,
      email: updated.email,
    };
    const newToken = await signSessionToken(updatedSession);
    await setSessionCookie(newToken);

    revalidatePath("/perfil");
    revalidatePath("/");
    return { success: true };
  } catch (err: any) {
    console.error("Error al cambiar email:", err);
    return { error: "Error al cambiar correo electrónico." };
  }
}

export async function cambiarMiPassword(data: {
  passwordActual: string;
  passwordNueva: string;
  passwordConfirmar: string;
}) {
  const session = await getSession();
  if (!session) {
    return { error: "No autorizado." };
  }

  if (!data.passwordActual || !data.passwordNueva || !data.passwordConfirmar) {
    return { error: "Complete todos los campos de contraseña." };
  }

  if (data.passwordNueva.length < 6) {
    return { error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }

  if (data.passwordNueva !== data.passwordConfirmar) {
    return { error: "La nueva contraseña y su confirmación no coinciden." };
  }

  try {
    const user = await db.query.usuarios.findFirst({
      where: eq(usuarios.id, session.id),
    });

    if (!user) {
      return { error: "Usuario no encontrado." };
    }

    const isValid = await verifyPassword(data.passwordActual, user.password_hash);
    if (!isValid) {
      return { error: "La contraseña actual ingresada es incorrecta." };
    }

    const nuevoHash = await hashPassword(data.passwordNueva);
    await db
      .update(usuarios)
      .set({ password_hash: nuevoHash })
      .where(eq(usuarios.id, session.id));

    revalidatePath("/perfil");
    return { success: true };
  } catch (err: any) {
    console.error("Error al cambiar contraseña:", err);
    return { error: "Error al actualizar la contraseña." };
  }
}
