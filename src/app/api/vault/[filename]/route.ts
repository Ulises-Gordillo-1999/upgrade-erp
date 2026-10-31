import { NextRequest, NextResponse } from "next/server";
import { getVaultFilePath } from "@/utils/vaultStorage";
import { getSession } from "@/utils/auth";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  // Validación estricta de sesión de usuario (RBAC & Auth)
  const session = await getSession();
  if (!session) {
    return new NextResponse("No autorizado para acceder a archivos de la bóveda", {
      status: 401,
    });
  }

  const { filename } = await params;
  const filePath = await getVaultFilePath(filename);

  if (!filePath) {
    return new NextResponse("Archivo no encontrado", { status: 404 });
  }

  const fileBuffer = await fs.readFile(filePath);
  const ext = path.extname(filename).toLowerCase();

  let contentType = "application/octet-stream";
  if (ext === ".webp") contentType = "image/webp";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".pdf") contentType = "application/pdf";
  else if (ext === ".txt") contentType = "text/plain";

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, no-cache, no-store, must-revalidate",
      "Pragma": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
