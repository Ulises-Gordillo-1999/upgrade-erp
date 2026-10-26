/**
 * Utilidad para exportación de datos a formato CSV compatible con Microsoft Excel (Windows/Mac).
 * Incorpora BOM UTF-8 (\uFEFF) y directiva sep=; para asegurar que Excel reconozca tildes,
 * caracteres en español y separe automáticamente las columnas sin necesidad de configuración manual.
 */

export interface ExportColumn<T> {
  header: string;
  accessor: (item: T) => string | number | null | undefined;
}

export function exportToExcelCsv<T>({
  filename,
  columns,
  data,
}: {
  filename: string;
  columns: ExportColumn<T>[];
  data: T[];
}) {
  if (typeof window === "undefined") return;

  const escapeCell = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Directiva para forzar a Excel a usar ';' como delimitador de columnas
  const headerLine = columns.map((col) => escapeCell(col.header)).join(";");

  const dataLines = data.map((item) =>
    columns.map((col) => escapeCell(col.accessor(item))).join(";")
  );

  // \uFEFF es el Byte Order Mark (BOM) UTF-8 que asegura caracteres en español y tildes
  const csvContent = headerLine + "\r\n" + dataLines.join("\r\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);

  const cleanFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  link.setAttribute("download", cleanFilename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
