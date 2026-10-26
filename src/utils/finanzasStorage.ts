import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

const UPLOAD_DIR = path.join(process.cwd(), "uploads", "finanzas");

export async function saveComprobanteFile(file: File): Promise<string> {
  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  let finalBuffer: Buffer;
  let filename: string;
  const uniqueId = crypto.randomUUID();

  if (isImage) {
    // Compresión inteligente WebP manteniendo máxima legibilidad de comprobantes / tickets
    finalBuffer = await sharp(buffer)
      .resize(1800, 1800, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();
    filename = `comprobante_${uniqueId}.webp`;
  } else if (isPdf) {
    finalBuffer = buffer;
    filename = `comprobante_${uniqueId}.pdf`;
  } else {
    const ext = file.name.split(".").pop() || "bin";
    finalBuffer = buffer;
    filename = `comprobante_${uniqueId}.${ext}`;
  }

  const filePath = path.join(UPLOAD_DIR, filename);
  await fs.writeFile(filePath, finalBuffer);

  return `/api/finanzas/comprobante/${filename}`;
}

export async function getFinanzasFilePath(filename: string): Promise<string | null> {
  const safeFilename = path.basename(filename);
  const fullPath = path.join(UPLOAD_DIR, safeFilename);
  try {
    await fs.access(fullPath);
    return fullPath;
  } catch {
    return null;
  }
}
