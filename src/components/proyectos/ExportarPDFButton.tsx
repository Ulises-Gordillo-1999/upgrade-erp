"use client";

import { Download, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  proyecto: any;
  items: any[];
}

export function ExportarPDFButton({ proyecto, items }: Props) {
  const handleExport = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 14;
    const contentWidth = pageWidth - margin * 2; // 182mm

    // Paleta de Colores Corporativa UPGRADE
    const navyPrimary: [number, number, number] = [15, 23, 42]; // Slate 900
    const navySecondary: [number, number, number] = [30, 41, 59]; // Slate 800
    const cyanAccent: [number, number, number] = [8, 145, 178]; // Cyan 600
    const cyanLight: [number, number, number] = [236, 254, 255]; // Cyan 50
    const grayDark: [number, number, number] = [51, 65, 85]; // Slate 700
    const grayMedium: [number, number, number] = [100, 116, 139]; // Slate 500
    const grayLight: [number, number, number] = [248, 250, 252]; // Slate 50
    const borderGray: [number, number, number] = [226, 232, 240]; // Slate 200

    // Formateador de moneda en ARS
    const formatARS = (valor: number) =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }).format(valor || 0);

    // ==========================================
    // 1. ENCABEZADO / MEMBRETE CORPORATIVO
    // ==========================================
    // Barra vertical de acento de marca
    doc.setFillColor(...cyanAccent);
    doc.roundedRect(margin, 14, 5, 20, 1.5, 1.5, "F");

    // Nombre de Empresa
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navyPrimary);
    doc.text("UPGRADE", margin + 8, 22);

    // Subtítulo tech
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...cyanAccent);
    doc.text("SOLUCIONES IT & INFRAESTRUCTURA DE REDES", margin + 8, 27);

    // Datos de contacto institucional
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text(
      "Servicios IT & Infraestructura  •  Soporte y Ciberseguridad  •  Catamarca, Argentina",
      margin + 8,
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
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navyPrimary);
    doc.text("PRESUPUESTO OFICIAL", metaCardX + 5, 18.5);

    // Filas de metadatos
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text("Nº Cotización:", metaCardX + 5, 23.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navyPrimary);
    doc.text(
      `COT-${proyecto.id.substring(0, 8).toUpperCase()}`,
      metaCardX + 26,
      23.5
    );

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text("Fecha Emisión:", metaCardX + 5, 28);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navyPrimary);
    const fechaEmision = proyecto.created_at
      ? new Date(proyecto.created_at).toLocaleDateString("es-AR")
      : new Date().toLocaleDateString("es-AR");
    doc.text(fechaEmision, metaCardX + 26, 28);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text("Validez Oferta:", metaCardX + 5, 32.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...cyanAccent);
    doc.text("15 días corridos", metaCardX + 26, 32.5);

    // Línea separadora decorativa de 2 tonos
    doc.setDrawColor(...cyanAccent);
    doc.setLineWidth(0.8);
    doc.line(margin, 39, margin + 40, 39);

    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.line(margin + 40, 39, pageWidth - margin, 39);

    // ==========================================
    // 2. TARJETA DE DATOS DEL CLIENTE
    // ==========================================
    const clientBoxY = 43;
    const clientBoxHeight = 27;

    doc.setFillColor(...grayLight);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.3);
    doc.roundedRect(
      margin,
      clientBoxY,
      contentWidth,
      clientBoxHeight,
      2,
      2,
      "FD"
    );

    // Banda superior de la tarjeta de cliente
    doc.setFillColor(241, 245, 249); // Slate 100
    doc.roundedRect(margin, clientBoxY, contentWidth, 6.5, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...grayDark);
    doc.text(
      "DATOS DEL CLIENTE / RECEPTOR DEL PRESUPUESTO",
      margin + 4,
      clientBoxY + 4.5
    );

    // Datos Columna Izquierda
    const clienteNombre =
      proyecto.clientes?.nombre_razon_social || "Consumidor Final / Sin Asignar";
    const clienteCuit = proyecto.clientes?.cuit_cuil || "No informado";
    const clienteIva =
      proyecto.clientes?.condicion_iva || "Consumidor Final";

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navyPrimary);
    doc.text(clienteNombre, margin + 4, clientBoxY + 12);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text("CUIT / CUIL:", margin + 4, clientBoxY + 17);
    doc.setTextColor(...navySecondary);
    doc.text(clienteCuit, margin + 22, clientBoxY + 17);

    doc.setTextColor(...grayMedium);
    doc.text("Condición IVA:", margin + 4, clientBoxY + 22);
    doc.setTextColor(...navySecondary);
    doc.text(clienteIva, margin + 25, clientBoxY + 22);

    // Datos Columna Derecha
    const clienteDireccion = proyecto.clientes?.direccion || "No informada";
    const clienteTelefono = proyecto.clientes?.telefono || "No informado";
    const estadoFormateado = (proyecto.estado || "Borrador")
      .replace(/_/g, " ")
      .toUpperCase();

    const colRightX = margin + 95;
    doc.setTextColor(...grayMedium);
    doc.text("Dirección:", colRightX, clientBoxY + 12);
    doc.setTextColor(...navySecondary);
    doc.text(
      doc.splitTextToSize(clienteDireccion, 75)[0] || clienteDireccion,
      colRightX + 16,
      clientBoxY + 12
    );

    doc.setTextColor(...grayMedium);
    doc.text("Teléfono:", colRightX, clientBoxY + 17);
    doc.setTextColor(...navySecondary);
    doc.text(clienteTelefono, colRightX + 16, clientBoxY + 17);

    doc.setTextColor(...grayMedium);
    doc.text("Estado Obra:", colRightX, clientBoxY + 22);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...cyanAccent);
    doc.text(estadoFormateado, colRightX + 19, clientBoxY + 22);

    // ==========================================
    // 3. TABLA DE ÍTEMS, SERVICIOS Y MATERIALES
    // ==========================================
    let subtotalMateriales = 0;
    let subtotalServicios = 0;

    const tableBody = items.map((item, index) => {
      const cantFinal =
        item.cantidad_real !== null && item.cantidad_real !== undefined
          ? Number(item.cantidad_real)
          : Number(item.cantidad_estimada || 0);

      const precioUnit = Number(item.precio_congelado || 0);
      const subtotalItem = precioUnit * cantFinal;

      const tipoItem = item.inventario?.tipo || "Insumo";
      if (tipoItem === "Servicio") {
        subtotalServicios += subtotalItem;
      } else {
        subtotalMateriales += subtotalItem;
      }

      return [
        (index + 1).toString().padStart(2, "0"),
        item.inventario?.nombre || "Ítem de inventario",
        tipoItem,
        formatARS(precioUnit),
        cantFinal.toString(),
        formatARS(subtotalItem),
      ];
    });

    autoTable(doc, {
      startY: 74,
      head: [
        [
          "#",
          "Concepto / Detalle Técnico",
          "Clasificación",
          "Precio Unitario",
          "Cant.",
          "Subtotal Final",
        ],
      ],
      body: tableBody,
      theme: "plain",
      headStyles: {
        fillColor: navyPrimary,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 7.5,
        cellPadding: 3,
        halign: "left",
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 76 },
        2: { cellWidth: 26, halign: "center" },
        3: { cellWidth: 27, halign: "right" },
        4: { cellWidth: 16, halign: "center" },
        5: { cellWidth: 27, halign: "right", fontStyle: "bold" },
      },
      alternateRowStyles: {
        fillColor: [250, 250, 252],
      },
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: 2.8,
        textColor: navySecondary,
        lineColor: borderGray,
        lineWidth: 0.2,
      },
      margin: { left: margin, right: margin },
    });

    let currentY = (doc as any).lastAutoTable.finalY + 6;

    // Verificar si queda suficiente espacio en la página actual
    if (currentY > 215) {
      doc.addPage();
      currentY = 20;
    }

    // ==========================================
    // 4. BLOQUE DE TOTALES Y NOTAS TÉCNICAS
    // ==========================================
    const isFinalizado =
      proyecto.estado === "Finalizado" || proyecto.estado === "En_Ejecucion";
    const totalAMostrar = isFinalizado
      ? Number(proyecto.total_final || 0)
      : Number(proyecto.total_estimado || 0);
    const etiquetaTotal = isFinalizado
      ? "TOTAL FINAL LIQUIDADO"
      : "TOTAL ESTIMADO PRESUPUESTO";

    // A. Caja de Notas Técnicas (Lado Izquierdo)
    const notesBoxWidth = 92;
    if (proyecto.notas_tecnicas) {
      doc.setFillColor(...grayLight);
      doc.setDrawColor(...borderGray);
      doc.roundedRect(margin, currentY, notesBoxWidth, 29, 2, 2, "FD");

      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...grayDark);
      doc.text("ESPECIFICACIONES / NOTAS DE OBRA", margin + 4, currentY + 5);

      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...navySecondary);
      const splitNotas = doc.splitTextToSize(
        proyecto.notas_tecnicas,
        notesBoxWidth - 8
      );
      doc.text(splitNotas, margin + 4, currentY + 11);
    }

    // B. Caja de Resumen de Totales (Lado Derecho)
    const totalsBoxX = margin + 98;
    const totalsBoxWidth = contentWidth - 98; // 84mm

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text("Subtotal Materiales & Insumos:", totalsBoxX, currentY + 4);
    doc.setTextColor(...navyPrimary);
    doc.text(formatARS(subtotalMateriales), pageWidth - margin, currentY + 4, {
      align: "right",
    });

    doc.setTextColor(...grayMedium);
    doc.text("Subtotal Servicios & Mano de Obra:", totalsBoxX, currentY + 10);
    doc.setTextColor(...navyPrimary);
    doc.text(formatARS(subtotalServicios), pageWidth - margin, currentY + 10, {
      align: "right",
    });

    // Tarjeta destacada de Total Final
    const grandTotalY = currentY + 15;
    doc.setFillColor(...cyanLight);
    doc.setDrawColor(...cyanAccent);
    doc.setLineWidth(0.4);
    doc.roundedRect(
      totalsBoxX,
      grandTotalY,
      totalsBoxWidth,
      14,
      2,
      2,
      "FD"
    );

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navyPrimary);
    doc.text(etiquetaTotal, totalsBoxX + 4, grandTotalY + 5.5);

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...cyanAccent);
    doc.text(
      formatARS(totalAMostrar),
      pageWidth - margin - 4,
      grandTotalY + 10,
      { align: "right" }
    );

    currentY = Math.max(currentY + 34, grandTotalY + 19);

    // ==========================================
    // 5. CONDICIONES COMERCIALES Y GARANTÍA
    // ==========================================
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.2);
    doc.roundedRect(margin, currentY, contentWidth, 23, 2, 2, "FD");

    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...grayDark);
    doc.text("TÉRMINOS Y CONDICIONES DEL SERVICIO:", margin + 4, currentY + 4.5);

    doc.setFontSize(6.8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text(
      "• Validez de la oferta: 15 días corridos. Precios expresados en Pesos Argentinos (ARS) congelados tras aprobación formal.",
      margin + 4,
      currentY + 9
    );
    doc.text(
      "• Condiciones de Pago: 50% de anticipo al inicio de la instalación y 50% contra certificación final de funcionamiento.",
      margin + 4,
      currentY + 13
    );
    doc.text(
      "• Garantía Oficial: 90 días sobre mano de obra y tendido de cableado. Garantía oficial del fabricante sobre equipamiento provisto.",
      margin + 4,
      currentY + 17
    );
    doc.text(
      "• Liquidación de Consumibles: Las cantidades reales medidas en obra (metros de cable) se liquidan según consumo medido final.",
      margin + 4,
      currentY + 21
    );

    currentY += 27;

    // ==========================================
    // 6. BLOQUE DE FIRMAS Y CONFORMIDAD
    // ==========================================
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    const signWidth = 72;
    const sign1X = margin + 8;
    const sign2X = pageWidth - margin - signWidth - 8;
    const lineY = currentY + 15;

    // Firma Cliente
    doc.setDrawColor(...grayMedium);
    doc.setLineWidth(0.3);
    doc.line(sign1X, lineY, sign1X + signWidth, lineY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navyPrimary);
    doc.text("FIRMA DE CONFORMIDAD DEL CLIENTE", sign1X + signWidth / 2, lineY + 4, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text("Aclaración / DNI / Fecha: ____/____/2026", sign1X + signWidth / 2, lineY + 8, {
      align: "center",
    });

    // Firma UPGRADE
    doc.line(sign2X, lineY, sign2X + signWidth, lineY);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...navyPrimary);
    doc.text("UPGRADE SOLUCIONES IT", sign2X + signWidth / 2, lineY + 4, {
      align: "center",
    });
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...grayMedium);
    doc.text("Responsable Técnico de Infraestructura", sign2X + signWidth / 2, lineY + 8, {
      align: "center",
    });

    // ==========================================
    // 7. PIE DE PÁGINA (EN TODAS LAS PÁGINAS)
    // ==========================================
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
        "UPGRADE • Soluciones IT e Infraestructura  —  Documento generado digitalmente por UPGRADE ERP",
        margin,
        292
      );

      doc.text(`Página ${i} de ${totalPages}`, pageWidth - margin, 292, {
        align: "right",
      });
    }

    // ==========================================
    // 8. DESCARGA DEL PDF
    // ==========================================
    const cleanNombre =
      proyecto.clientes?.nombre_razon_social
        ?.replace(/[^a-zA-Z0-9]/g, "_")
        .substring(0, 30) || "Generico";

    doc.save(`Presupuesto_UPGRADE_${cleanNombre}_COT_${proyecto.id.substring(0, 6).toUpperCase()}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-4 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-md shadow-cyan-950/40 hover:shadow-cyan-500/20 active:scale-95 border border-cyan-400/20"
      title="Generar y descargar Presupuesto Oficial en PDF"
    >
      <FileText className="w-4 h-4 mr-2" />
      Exportar a PDF
    </button>
  );
}

