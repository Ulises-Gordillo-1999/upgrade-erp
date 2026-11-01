/**
 * Sanitiza y normaliza un número de teléfono para la API de WhatsApp (wa.me)
 * Especializado en números de Argentina (+54 9) e internacionales.
 */
export function sanitizeWhatsAppPhone(rawPhone?: string | null): string {
  if (!rawPhone) return "";

  // Remover cualquier caracter que no sea dígito
  let digits = rawPhone.replace(/\D/g, "");
  if (!digits) return "";

  // Si comienza con 0 (código interurbano argentino, ej: 0383...), removerlo
  if (digits.startsWith("0")) {
    digits = digits.substring(1);
  }

  // Si ya tiene el formato internacional argentino completo '549...'
  if (digits.startsWith("549") && digits.length >= 12) {
    return digits;
  }

  // Si empieza con '54' pero le falta el '9' móvil de Argentina (ej: 543834...)
  if (digits.startsWith("54") && !digits.startsWith("549") && digits.length >= 11) {
    return `549${digits.substring(2)}`;
  }

  // Si es un número argentino estándar de 10 dígitos (código de área + número, ej: 3834123456 o 1151234567)
  if (digits.length === 10) {
    return `549${digits}`;
  }

  // Para otros países o formatos internacionales ya con código de país
  return digits;
}

/**
 * Genera una URL de wa.me con número normalizado y mensaje codificado opcional
 */
export function getWhatsAppLink(rawPhone?: string | null, message?: string): string {
  const sanitized = sanitizeWhatsAppPhone(rawPhone);
  if (!sanitized) return "";
  const query = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${sanitized}${query}`;
}

export interface BudgetMessageData {
  proyectoId: string;
  clienteNombre: string;
  estado: string;
  totalEstimado: number;
  totalFinal: number;
  notasTecnicas?: string | null;
  items?: Array<{
    cantidad: number;
    nombre: string;
    tipo?: string;
    precioUnitario: number;
    subtotal: number;
  }>;
}

/**
 * Genera el cuerpo formateado del mensaje de WhatsApp para presupuestos de UPGRADE
 */
export function generateBudgetMessage(data: BudgetMessageData): string {
  const isFinalizado = data.estado === "Finalizado" || data.estado === "En_Ejecucion";
  const total = isFinalizado && data.totalFinal > 0 ? data.totalFinal : data.totalEstimado;

  const formatARS = (val: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const estadoLegible = data.estado.replace(/_/g, " ");

  let msg = `⚡ *UPGRADE • Soluciones IT & Infraestructura*\n`;
  msg += `_Soporte Técnico, Redes & Ciberseguridad_\n\n`;
  msg += `Estimado/a *${data.clienteNombre}*:\n`;
  msg += `Le compartimos el detalle formal de la cotización técnica para su proyecto:\n\n`;

  msg += `📋 *Cotización:* #COT-${data.proyectoId.substring(0, 8).toUpperCase()}\n`;
  msg += `🏷️ *Estado:* ${estadoLegible}\n`;
  msg += `💰 *Presupuesto Total:* *${formatARS(total)} ARS*\n\n`;

  if (data.items && data.items.length > 0) {
    msg += `📦 *Detalle de Materiales & Mano de Obra:*\n`;
    for (const item of data.items) {
      const tipoIcon = item.tipo === "Servicio" ? "🛠️" : "🔹";
      msg += `${tipoIcon} ${item.cantidad}x ${item.nombre} → *${formatARS(item.subtotal)}*\n`;
    }
    msg += `\n`;
  }

  if (data.notasTecnicas && data.notasTecnicas.trim()) {
    msg += `📌 *Notas Técnicas / Alcance:*\n`;
    msg += `_${data.notasTecnicas.trim()}_\n\n`;
  }

  msg += `⏳ *Validez:* 15 días corridos con precios congelados.\n`;
  msg += `🛡️ *Garantía:* 90 días en mano de obra e instalación.\n\n`;
  msg += `Para coordinar el inicio de la obra o cualquier consulta técnica, quedamos a su entera disposición respondiendo a este mensaje.\n\n`;
  msg += `*UPGRADE IT Services* • Catamarca, Argentina`;

  return msg;
}

