"use server";

import { db } from "@/db";
import { usuarios } from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { getSession, hashPassword } from "@/utils/auth";
import { revalidatePath } from "next/cache";
import { Rol, Usuario } from "@/types/database";

// Helper para verificar rol de SuperAdmin
async function requireSuperAdmin() {
  const session = await getSession();
  if (!session || session.rol !== "SuperAdmin") {
    throw new Error("Acceso denegado. Se requieren permisos de SuperAdmin.");
  }
  return session;
}

export async function getUsuarios() {
  await requireSuperAdmin();

  try {
    const list = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        email: usuarios.email,
        rol: usuarios.rol,
        telefono: usuarios.telefono,
        especialidad: usuarios.especialidad,
        activo: usuarios.activo,
        last_login_at: usuarios.last_login_at,
        created_at: usuarios.created_at,
      })
      .from(usuarios)
      .orderBy(desc(usuarios.created_at));

    return list.map((u) => ({
      ...u,
      last_login_at: u.last_login_at ? u.last_login_at.toISOString() : null,
      created_at: u.created_at ? u.created_at.toISOString() : undefined,
    })) as unknown as Usuario[];
  } catch (error: any) {
    console.error("Error al obtener usuarios:", error);
    throw new Error(error.message || "Error al obtener usuarios");
  }
}

export async function createUsuario(data: {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
  telefono?: string;
  especialidad?: string;
}) {
  await requireSuperAdmin();

  const emailLimpio = data.email.trim().toLowerCase();
  if (!emailLimpio || !data.nombre || !data.password) {
    throw new Error("Complete los campos obligatorios.");
  }

  const existente = await db.query.usuarios.findFirst({
    where: eq(usuarios.email, emailLimpio),
  });

  if (existente) {
    throw new Error("El correo electrónico ya se encuentra registrado.");
  }

  const passwordHash = await hashPassword(data.password);

  const [nuevo] = await db
    .insert(usuarios)
    .values({
      nombre: data.nombre.trim(),
      email: emailLimpio,
      password_hash: passwordHash,
      rol: data.rol,
      telefono: data.telefono?.trim() || null,
      especialidad: data.especialidad?.trim() || null,
      activo: true,
    })
    .returning();

  revalidatePath("/usuarios");
  return nuevo;
}

export async function updateUsuario(
  id: string,
  data: {
    nombre: string;
    email: string;
    rol: Rol;
    telefono?: string;
    especialidad?: string;
  }
) {
  await requireSuperAdmin();

  const emailLimpio = data.email.trim().toLowerCase();

  // Validar unicidad de correo
  const existente = await db.query.usuarios.findFirst({
    where: and(eq(usuarios.email, emailLimpio), ne(usuarios.id, id)),
  });

  if (existente) {
    throw new Error("El correo electrónico ya se encuentra registrado por otro usuario.");
  }

  const [updated] = await db
    .update(usuarios)
    .set({
      nombre: data.nombre.trim(),
      email: emailLimpio,
      rol: data.rol,
      telefono: data.telefono?.trim() || null,
      especialidad: data.especialidad?.trim() || null,
    })
    .where(eq(usuarios.id, id))
    .returning();

  revalidatePath("/usuarios");
  return updated;
}

export async function toggleEstadoUsuario(id: string, nuevoEstado: boolean) {
  const session = await requireSuperAdmin();

  if (session.id === id) {
    throw new Error("No puede desactivar su propia cuenta de SuperAdmin.");
  }

  await db
    .update(usuarios)
    .set({ activo: nuevoEstado })
    .where(eq(usuarios.id, id));

  revalidatePath("/usuarios");
  return true;
}

export async function resetPasswordUsuario(id: string, passwordNueva: string) {
  await requireSuperAdmin();

  if (!passwordNueva || passwordNueva.length < 6) {
    throw new Error("La nueva contraseña debe tener al menos 6 caracteres.");
  }

  const hash = await hashPassword(passwordNueva);

  await db
    .update(usuarios)
    .set({ password_hash: hash })
    .where(eq(usuarios.id, id));

  revalidatePath("/usuarios");
  return true;
}

export async function deleteUsuario(id: string) {
  const session = await requireSuperAdmin();

  if (session.id === id) {
    throw new Error("No puede eliminar su propia cuenta de SuperAdmin.");
  }

  await db.delete(usuarios).where(eq(usuarios.id, id));

  revalidatePath("/usuarios");
  return true;
}
