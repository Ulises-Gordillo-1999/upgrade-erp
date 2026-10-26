import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Transaccion, RentabilidadProyecto } from "@/types/database";

// Paleta de Colores Corporativa UPGRADE (coherente con Presupuestos PDF)
const navyPrimary: [number, number, number] = [15, 23, 42]; // Slate 900
const navySecondary: [number, number, number] = [30, 41, 59]; // Slate 800
const cyanAccent: [number, number, number] = [8, 145, 178]; // Cyan 600
const cyanLight: [number, number, number] = [236, 254, 255]; // Cyan 50
const emeraldAccent: [number, number, number] = [16, 185, 129]; // Emerald 500
const emeraldLight: [number, number, number] = [236, 253, 245]; // Emerald 50
const roseAccent: [number, number, number] = [225, 29, 72]; // Rose 600
const roseLight: [number, number, number] = [255, 241, 242]; // Rose 50
const amberAccent: [number, number, number] = [217, 119, 6]; // Amber 600
const amberLight: [number, number, number] = [254, 243, 199]; // Amber 50
const grayDark: [number, number, number] = [51, 65, 85]; // Slate 700
const grayMedium: [number, number, number] = [100, 116, 139]; // Slate 500
const grayLight: [number, number, number] = [248, 250, 252]; // Slate 50
const borderGray: [number, number, number] = [226, 232, 240]; // Slate 200

// Helper para formatear montos en ARS
const formatARS = (valor: number) =>
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
  }).format(valor || 0);

// Helper para formatear montos en USDT
const formatUSDT = (valor: number) =>
  `₮ ${new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor || 0)} USDT`;

// Helper para dibujar membrete corporativo UPGRADE
function drawCorporateHeader(
  doc: jsPDF,
  margin: number,
  pageWidth: number,
  reportTitle: string,
  reportCode: string,
  periodoOrSubtitle: string
) {
  // Barra vertical de acento de marca (Cyan)
  doc.setFillColor(...cyanAccent);
  doc.roundedRect(margin, 14, 4.5, 20, 1.2, 1.2, "F");

  // Nombre de Empresa
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navyPrimary);
  doc.text("UPGRADE", margin + 7.5, 22);

  // Subtítulo tech
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...cyanAccent);
  doc.text("SOLUCIONES IT & INFRAESTRUCTURA DE REDES", margin + 7.5, 27);

  // Datos de contacto institucional
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text(
    "Servicios IT & Infraestructura  •  Soporte y Ciberseguridad  •  Catamarca, Argentina",
    margin + 7.5,
    32
  );

  // Tarjeta superior derecha: Metadatos del Documento
  const metaCardX = 120;
  const metaCardWidth = pageWidth - margin - metaCardX; // 76mm
  doc.setFillColor(...grayLight);
  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.roundedRect(metaCardX, 13, metaCardWidth, 23, 2, 2, "FD");

  // Título del documento
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navyPrimary);
  doc.text(reportTitle, metaCardX + 4.5, 18.5);

  // Nº Reporte
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text("Nº Informe:", metaCardX + 4.5, 23.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navyPrimary);
  doc.text(reportCode, metaCardX + 23, 23.5);

  // Fecha Emisión
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text("Fecha Emisión:", metaCardX + 4.5, 28);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...navyPrimary);
  doc.text(new Date().toLocaleDateString("es-AR"), metaCardX + 23, 28);

  // Período
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text("Período:", metaCardX + 4.5, 32.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...cyanAccent);
  doc.text(
    doc.splitTextToSize(periodoOrSubtitle, 48)[0] || periodoOrSubtitle,
    metaCardX + 23,
    32.5
  );

  // Línea separadora decorativa de 2 tonos
  doc.setDrawColor(...cyanAccent);
  doc.setLineWidth(0.8);
  doc.line(margin, 38.5, margin + 40, 38.5);

  doc.setDrawColor(...borderGray);
  doc.setLineWidth(0.3);
  doc.line(margin + 40, 38.5, pageWidth - margin, 38.5);
}

// Helper para pie de página en todas las hojas
function drawCorporateFooters(doc: jsPDF, margin: number, pageWidth: number, subtitleDoc: string) {
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.line(margin, 287, pageWidth - margin, 287);

    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text(
      `UPGRADE • Soluciones IT e Infraestructura  —  ${subtitleDoc}`,
      margin,
      292
    );

    doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 292, {
      align: "right",
    });
  }
}

export interface TransaccionExportItem {
  id?: string;
  tipo: string;
  categoria: string;
  monto: number | string;
  moneda: string;
  metodo_pago: string;
  estado: string;
  descripcion?: string | null;
  fecha_transaccion?: string;
  proyectos?: {
    clientes?: {
      nombre_razon_social?: string;
    } | null;
  } | null;
}

export interface ExportFlujoCajaPdfParams {
  transacciones: TransaccionExportItem[];
  kpis: {
    ingresosARS: number;
    egresosARS: number;
    netoARS: number;
    ingresosUSDT: number;
    egresosUSDT: number;
    netoUSDT: number;
    pendientesARS: number;
    pendientesUSDT: number;
    cantIngresos: number;
    cantEgresos: number;
  };
  periodoLabel: string;
}

export function exportarFlujoCajaPDF({
  transacciones,
  kpis,
  periodoLabel,
}: ExportFlujoCajaPdfParams) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const reportCode = `FIN-${Date.now().toString().slice(-6)}`;
  drawCorporateHeader(
    doc,
    margin,
    pageWidth,
    "INFORME FINANCIERO",
    reportCode,
    periodoLabel
  );

  // ==========================================
  // TARJETAS DE KPIS FINANCIEROS DEL PERÍODO
  // ==========================================
  const cardsY = 43;
  const cardHeight = 22;
  const cardGap = 3.5;
  const cardWidth = (contentWidth - cardGap * 3) / 4; // 4 cards

  // Card 1: Ingresos
  doc.setFillColor(...emeraldLight);
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cardsY, cardWidth, cardHeight, 1.8, 1.8, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...emeraldAccent);
  doc.text("TOTAL INGRESOS", margin + 3.5, cardsY + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(...navyPrimary);
  doc.text(formatARS(kpis.ingresosARS), margin + 3.5, cardsY + 11.5);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text(`${kpis.cantIngresos} cobros`, margin + 3.5, cardsY + 16.5);
  if (kpis.ingresosUSDT > 0) {
    doc.text(`+ ${formatUSDT(kpis.ingresosUSDT)}`, margin + 3.5, cardsY + 20);
  }

  // Card 2: Egresos
  const card2X = margin + cardWidth + cardGap;
  doc.setFillColor(...roseLight);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(card2X, cardsY, cardWidth, cardHeight, 1.8, 1.8, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...roseAccent);
  doc.text("TOTAL EGRESOS", card2X + 3.5, cardsY + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(...navyPrimary);
  doc.text(formatARS(kpis.egresosARS), card2X + 3.5, cardsY + 11.5);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text(`${kpis.cantEgresos} imputaciones`, card2X + 3.5, cardsY + 16.5);
  if (kpis.egresosUSDT > 0) {
    doc.text(`+ ${formatUSDT(kpis.egresosUSDT)}`, card2X + 3.5, cardsY + 20);
  }

  // Card 3: Balance Neto
  const card3X = card2X + cardWidth + cardGap;
  const netoPositivo = kpis.netoARS >= 0;
  doc.setFillColor(netoPositivo ? 240 : 255, netoPositivo ? 253 : 241, netoPositivo ? 244 : 242);
  doc.setDrawColor(netoPositivo ? 187 : 254, netoPositivo ? 247 : 205, netoPositivo ? 208 : 211);
  doc.roundedRect(card3X, cardsY, cardWidth, cardHeight, 1.8, 1.8, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(netoPositivo ? emeraldAccent[0] : roseAccent[0], netoPositivo ? emeraldAccent[1] : roseAccent[1], netoPositivo ? emeraldAccent[2] : roseAccent[2]);
  doc.text("BALANCE NETO", card3X + 3.5, cardsY + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(...navyPrimary);
  const signo = netoPositivo ? "+" : "";
  doc.text(`${signo}${formatARS(kpis.netoARS)}`, card3X + 3.5, cardsY + 11.5);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text("Flujo neto del período", card3X + 3.5, cardsY + 16.5);
  if (kpis.netoUSDT !== 0) {
    const signUsdt = kpis.netoUSDT > 0 ? "+" : "";
    doc.text(`${signUsdt}${formatUSDT(kpis.netoUSDT)}`, card3X + 3.5, cardsY + 20);
  }

  // Card 4: Pendiente de Cobro
  const card4X = card3X + cardWidth + cardGap;
  doc.setFillColor(...amberLight);
  doc.setDrawColor(253, 230, 138);
  doc.roundedRect(card4X, cardsY, cardWidth, cardHeight, 1.8, 1.8, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...amberAccent);
  doc.text("PENDIENTE DE COBRO", card4X + 3.5, cardsY + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(...navyPrimary);
  doc.text(formatARS(kpis.pendientesARS), card4X + 3.5, cardsY + 11.5);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text("Movimientos a regularizar", card4X + 3.5, cardsY + 16.5);
  if (kpis.pendientesUSDT > 0) {
    doc.text(`+ ${formatUSDT(kpis.pendientesUSDT)}`, card4X + 3.5, cardsY + 20);
  }

  // ==========================================
  // TABLA DE TRANSACCIONES / MOVIMIENTOS
  // ==========================================
  const tableRows = transacciones.map((t, index) => {
    const fecha = t.fecha_transaccion
      ? new Date(t.fecha_transaccion).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })
      : "-";

    const concepto = t.descripcion || `Movimiento de ${t.tipo}`;
    const clienteOProyecto =
      t.proyectos?.clientes?.nombre_razon_social || "Operativo General";
    const montoNum = Number(t.monto);
    const montoFormateado =
      t.moneda === "ARS" ? formatARS(montoNum) : formatUSDT(montoNum);
    const signoTipo = t.tipo === "Ingreso" ? "+" : "-";

    return [
      (index + 1).toString().padStart(2, "0"),
      fecha,
      t.tipo.toUpperCase(),
      concepto,
      t.categoria,
      clienteOProyecto,
      t.metodo_pago,
      t.estado,
      `${signoTipo} ${montoFormateado}`,
    ];
  });

  autoTable(doc, {
    startY: 69,
    head: [
      [
        "#",
        "Fecha",
        "Tipo",
        "Concepto / Detalle",
        "Categoría",
        "Cliente / Proyecto",
        "Método",
        "Estado",
        "Monto",
      ],
    ],
    body: tableRows,
    theme: "plain",
    styles: {
      fontSize: 7.2,
      font: "helvetica",
      textColor: navyPrimary,
      cellPadding: { top: 2.5, right: 2, bottom: 2.5, left: 2 },
      lineWidth: 0.15,
      lineColor: borderGray,
    },
    headStyles: {
      fillColor: navyPrimary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
      lineColor: navyPrimary,
    },
    alternateRowStyles: {
      fillColor: grayLight,
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center", fontStyle: "bold" },
      1: { cellWidth: 15, halign: "center" },
      2: { cellWidth: 15, halign: "center", fontStyle: "bold" },
      3: { cellWidth: "auto" },
      4: { cellWidth: 23 },
      5: { cellWidth: 25 },
      6: { cellWidth: 18 },
      7: { cellWidth: 16, halign: "center", fontStyle: "bold" },
      8: { cellWidth: 26, halign: "right", fontStyle: "bold" },
    },
    didDrawCell: (data) => {
      // Colorear el texto de Tipo y Monto según Ingreso o Egreso
      if (data.section === "body") {
        if (data.column.index === 2) {
          const val = data.cell.text[0];
          if (val === "INGRESO") {
            doc.setTextColor(...emeraldAccent);
          } else {
            doc.setTextColor(...roseAccent);
          }
        }
        if (data.column.index === 7) {
          const val = data.cell.text[0];
          if (val === "Pagado") {
            doc.setTextColor(...emeraldAccent);
          } else {
            doc.setTextColor(...amberAccent);
          }
        }
        if (data.column.index === 8) {
          const text = data.cell.text[0] || "";
          if (text.startsWith("+")) {
            doc.setTextColor(...emeraldAccent);
          } else {
            doc.setTextColor(...roseAccent);
          }
        }
      }
    },
  });

  // Pie de página corporativo
  drawCorporateFooters(
    doc,
    margin,
    pageWidth,
    `Informe Financiero y Flujo de Caja  —  Período: ${periodoLabel}`
  );

  const cleanPeriodo = periodoLabel.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
  doc.save(`UPGRADE_Flujo_Caja_${cleanPeriodo}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ============================================================================
// 2. EXPORTACIÓN DE RENTABILIDAD POR PROYECTO
// ============================================================================
export interface ExportRentabilidadPdfParams {
  proyectos: RentabilidadProyecto[];
  totales: {
    ingresosARS: number;
    egresosARS: number;
    netoARS: number;
    ingresosUSDT: number;
    egresosUSDT: number;
    netoUSDT: number;
    margenGlobalARS: number;
  };
}

export function exportarRentabilidadPDF({
  proyectos,
  totales,
}: ExportRentabilidadPdfParams) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182mm

  const reportCode = `RENT-${Date.now().toString().slice(-6)}`;
  drawCorporateHeader(
    doc,
    margin,
    pageWidth,
    "RENTABILIDAD POR OBRA",
    reportCode,
    "Consolidado de Proyectos"
  );

  // Tarjetas de KPIs Consolidados
  const cardsY = 43;
  const cardHeight = 22;
  const cardGap = 3.5;
  const cardWidth = (contentWidth - cardGap * 3) / 4;

  // Card 1: Ingresos Totales
  doc.setFillColor(...emeraldLight);
  doc.setDrawColor(167, 243, 208);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, cardsY, cardWidth, cardHeight, 1.8, 1.8, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...emeraldAccent);
  doc.text("INGRESOS TOTALES", margin + 3.5, cardsY + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(...navyPrimary);
  doc.text(formatARS(totales.ingresosARS), margin + 3.5, cardsY + 11.5);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text("Total cobrado en obras", margin + 3.5, cardsY + 16.5);
  if (totales.ingresosUSDT > 0) {
    doc.text(`+ ${formatUSDT(totales.ingresosUSDT)}`, margin + 3.5, cardsY + 20);
  }

  // Card 2: Costos Totales
  const card2X = margin + cardWidth + cardGap;
  doc.setFillColor(...roseLight);
  doc.setDrawColor(254, 205, 211);
  doc.roundedRect(card2X, cardsY, cardWidth, cardHeight, 1.8, 1.8, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...roseAccent);
  doc.text("COSTOS / EGRESOS", card2X + 3.5, cardsY + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(...navyPrimary);
  doc.text(formatARS(totales.egresosARS), card2X + 3.5, cardsY + 11.5);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text("Insumos y viáticos", card2X + 3.5, cardsY + 16.5);
  if (totales.egresosUSDT > 0) {
    doc.text(`+ ${formatUSDT(totales.egresosUSDT)}`, card2X + 3.5, cardsY + 20);
  }

  // Card 3: Ganancia Neta
  const card3X = card2X + cardWidth + cardGap;
  const netoPositivo = totales.netoARS >= 0;
  doc.setFillColor(netoPositivo ? 240 : 255, netoPositivo ? 253 : 241, netoPositivo ? 244 : 242);
  doc.setDrawColor(netoPositivo ? 187 : 254, netoPositivo ? 247 : 205, netoPositivo ? 208 : 211);
  doc.roundedRect(card3X, cardsY, cardWidth, cardHeight, 1.8, 1.8, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(netoPositivo ? emeraldAccent[0] : roseAccent[0], netoPositivo ? emeraldAccent[1] : roseAccent[1], netoPositivo ? emeraldAccent[2] : roseAccent[2]);
  doc.text("GANANCIA NETA", card3X + 3.5, cardsY + 5.5);
  doc.setFontSize(8.5);
  doc.setTextColor(...navyPrimary);
  const signo = netoPositivo ? "+" : "";
  doc.text(`${signo}${formatARS(totales.netoARS)}`, card3X + 3.5, cardsY + 11.5);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text("Utilidad neta acumulada", card3X + 3.5, cardsY + 16.5);
  if (totales.netoUSDT !== 0) {
    const signUsdt = totales.netoUSDT > 0 ? "+" : "";
    doc.text(`${signUsdt}${formatUSDT(totales.netoUSDT)}`, card3X + 3.5, cardsY + 20);
  }

  // Card 4: Margen Global
  const card4X = card3X + cardWidth + cardGap;
  const margenBueno = totales.margenGlobalARS >= 30;
  doc.setFillColor(...cyanLight);
  doc.setDrawColor(165, 243, 252);
  doc.roundedRect(card4X, cardsY, cardWidth, cardHeight, 1.8, 1.8, "FD");
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...cyanAccent);
  doc.text("MARGEN PROMEDIO", card4X + 3.5, cardsY + 5.5);
  doc.setFontSize(9.5);
  doc.setTextColor(margenBueno ? emeraldAccent[0] : navyPrimary[0], margenBueno ? emeraldAccent[1] : navyPrimary[1], margenBueno ? emeraldAccent[2] : navyPrimary[2]);
  doc.text(`${totales.margenGlobalARS}%`, card4X + 3.5, cardsY + 12);
  doc.setFontSize(6.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...grayMedium);
  doc.text(`${proyectos.length} proyectos evaluados`, card4X + 3.5, cardsY + 17);

  // ==========================================
  // TABLA DE PROYECTOS Y RENTABILIDAD
  // ==========================================
  const tableRows = proyectos.map((p, index) => {
    const estadoLimpio = p.estado.replace(/_/g, " ");
    return [
      (index + 1).toString().padStart(2, "0"),
      p.clienteNombre,
      estadoLimpio,
      formatARS(p.totalFinal),
      formatARS(p.ingresosARS),
      formatARS(p.egresosARS),
      formatARS(p.netoARS),
      `${p.margenARS}%`,
    ];
  });

  autoTable(doc, {
    startY: 69,
    head: [
      [
        "#",
        "Cliente / Razón Social",
        "Estado Obra",
        "Presupuesto Final",
        "Ingresos (ARS)",
        "Costos (ARS)",
        "Ganancia Neta",
        "% Margen",
      ],
    ],
    body: tableRows,
    theme: "plain",
    styles: {
      fontSize: 7.2,
      font: "helvetica",
      textColor: navyPrimary,
      cellPadding: { top: 2.8, right: 2, bottom: 2.8, left: 2 },
      lineWidth: 0.15,
      lineColor: borderGray,
    },
    headStyles: {
      fillColor: navyPrimary,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "left",
      lineColor: navyPrimary,
    },
    alternateRowStyles: {
      fillColor: grayLight,
    },
    columnStyles: {
      0: { cellWidth: 7, halign: "center", fontStyle: "bold" },
      1: { cellWidth: "auto", fontStyle: "bold" },
      2: { cellWidth: 26 },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 25, halign: "right" },
      5: { cellWidth: 25, halign: "right" },
      6: { cellWidth: 26, halign: "right", fontStyle: "bold" },
      7: { cellWidth: 18, halign: "center", fontStyle: "bold" },
    },
    didDrawCell: (data) => {
      if (data.section === "body") {
        if (data.column.index === 6) {
          const val = data.cell.text[0] || "";
          if (val.includes("-")) {
            doc.setTextColor(...roseAccent);
          } else {
            doc.setTextColor(...emeraldAccent);
          }
        }
        if (data.column.index === 7) {
          const valStr = data.cell.text[0] || "0";
          const num = parseFloat(valStr);
          if (num >= 30) {
            doc.setTextColor(...emeraldAccent);
          } else if (num < 0) {
            doc.setTextColor(...roseAccent);
          } else {
            doc.setTextColor(...cyanAccent);
          }
        }
      }
    },
  });

  // Pie de página corporativo
  drawCorporateFooters(
    doc,
    margin,
    pageWidth,
    "Reporte de Rentabilidad y Retorno por Obra / Proyecto"
  );

  doc.save(`UPGRADE_Rentabilidad_Proyectos_${new Date().toISOString().slice(0, 10)}.pdf`);
}
