import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "vault");

export async function saveVaultFile(file: File, proyectoId: string): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const isImage = file.type.startsWith("image/");

  let finalBuffer: Buffer;
  let filename: string;

  if (isImage) {
    // Pipeline de compresión inteligente WebP:
    // Redimensiona a máx 1600x1600 manteniendo relación de aspecto y comprime a WebP al 80% de calidad
    finalBuffer = await sharp(buffer)
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
    filename = `${proyectoId}_${crypto.randomUUID()}.webp`;
  } else {
    const ext = file.name.split(".").pop() || "bin";
    finalBuffer = buffer;
    filename = `${proyectoId}_${crypto.randomUUID()}.${ext}`;
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, finalBuffer);

  // Devolvemos la ruta que consumirá la UI para visualizar o descargar
  return `/api/vault/${filename}`;
}

export async function getVaultFilePath(filename: string): Promise<string | null> {
  const safeFilename = path.basename(filename);
  const fullPath = path.join(UPLOAD_DIR, safeFilename);
  try {
    await fs.access(fullPath);
    return fullPath;
  } catch {
    return null;
  }
}
