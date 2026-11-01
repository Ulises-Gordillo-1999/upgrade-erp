/**
 * UPGRADE ERP - Utilidades de Fecha y Hora (Zona Horaria Argentina)
 *
 * Catamarca, Argentina se encuentra en UTC-3 (America/Argentina/Catamarca / America/Argentina/Buenos_Aires).
 * Este módulo unifica el tratamiento de fechas, horas, filtros de período mensual
 * y formateo tanto en servidor (Docker/Coolify en UTC) como en cliente.
 */

export const TIMEZONE_ARGENTINA = "America/Argentina/Catamarca";

export interface ArgentinaDateParts {
  year: number;
  month: number; // 1 - 12
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export interface PeriodoMesArgentina {
  year: number;
  month: number;
  mesNombre: string;
  startOfMonth: Date;
  endOfMonth: Date;
}

/**
 * Obtiene los componentes de fecha/hora desglosados en zona horaria de Argentina.
 */
export function getArgentinaParts(date: Date | string = new Date()): ArgentinaDateParts {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIMEZONE_ARGENTINA,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const get = (type: string) => {
    const found = parts.find((p) => p.type === type);
    return found ? parseInt(found.value, 10) : 0;
  };

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
    second: get("second"),
  };
}

/**
 * Calcula los límites de inicio y fin del mes actual en Argentina, convertidos
 * a objetos Date UTC exactos para consultas en PostgreSQL (TIMESTAMPTZ).
 */
export function getPeriodoMesArgentina(date: Date | string = new Date()): PeriodoMesArgentina {
  const parts = getArgentinaParts(date);
  const pad = (n: number) => String(n).padStart(2, "0");

  // Inicio de mes: 1er día del mes a las 00:00:00.000 (UTC-3)
  const startOfMonth = new Date(
    `${parts.year}-${pad(parts.month)}-01T00:00:00.000-03:00`
  );

  // Fin de mes: último día del mes a las 23:59:59.999 (UTC-3)
  const lastDay = new Date(parts.year, parts.month, 0).getDate();
  const endOfMonth = new Date(
    `${parts.year}-${pad(parts.month)}-${pad(lastDay)}T23:59:59.999-03:00`
  );

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const mesNombre = `${meses[parts.month - 1]} ${parts.year}`;

  return {
    year: parts.year,
    month: parts.month,
    mesNombre,
    startOfMonth,
    endOfMonth,
  };
}

/**
 * Formatea una fecha en español (Argentina).
 * Ej: "Sábado, 31 de octubre de 2026" o "31 de octubre de 2026".
 */
export function formatFechaArgentina(
  date: Date | string | null | undefined = new Date(),
  conDiaSemana: boolean = true,
  conAno: boolean = true
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const options: Intl.DateTimeFormatOptions = {
    timeZone: TIMEZONE_ARGENTINA,
    day: "numeric",
    month: "long",
  };

  if (conDiaSemana) {
    options.weekday = "long";
  }
  if (conAno) {
    options.year = "numeric";
  }

  const str = new Intl.DateTimeFormat("es-AR", options).format(d);
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formatea la hora en zona horaria de Argentina (formato 24hs).
 * Ej: "23:22" o "23:22:45".
 */
export function formatHoraArgentina(
  date: Date | string | null | undefined = new Date(),
  conSegundos: boolean = false
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE_ARGENTINA,
    hour: "2-digit",
    minute: "2-digit",
    second: conSegundos ? "2-digit" : undefined,
    hour12: false,
  }).format(d);
}

/**
 * Formato compacto para tablas y comprobantes: "31/10/2026 23:22 hs".
 */
export function formatFechaHoraArgentina(
  date: Date | string | null | undefined = new Date(),
  conSegundos: boolean = false
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";

  const fechaStr = new Intl.DateTimeFormat("es-AR", {
    timeZone: TIMEZONE_ARGENTINA,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);

  const horaStr = formatHoraArgentina(d, conSegundos);
  return `${fechaStr} ${horaStr} hs`;
}

/**
 * Parsea una cadena de fecha proveniente de formularios (ej: "YYYY-MM-DDTHH:mm" o "YYYY-MM-DD")
 * interpretándola explícitamente en el huso horario de Argentina (-03:00) si no contiene offset,
 * previniendo errores de cálculo en servidores que ejecutan en UTC.
 */
export function parseArgentinaDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date();
  if (dateStr.includes("Z") || dateStr.includes("+") || dateStr.match(/-\d\d:\d\d$/)) {
    return new Date(dateStr);
  }
  return new Date(dateStr + (dateStr.includes("T") ? "-03:00" : "T00:00:00-03:00"));
}

/**
 * Prepara el valor para campos <input type="datetime-local"> en hora local de Argentina
 * evitando el desfase de toISOString() que devuelve UTC.
 * Formato: "YYYY-MM-DDTHH:mm"
 */
export function toArgentinaDateTimeLocal(date: Date | string = new Date()): string {
  const parts = getArgentinaParts(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`;
}
