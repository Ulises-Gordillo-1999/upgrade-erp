"use client";

import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  proyecto: any;
  items: any[];
}

export function ExportarPDFButton({ proyecto, items }: Props) {
  const handleExport = () => {
    const doc = new jsPDF();
    
    // Configuración de estilos
    const primaryColor: [number, number, number] = [6, 182, 212]; // Cyan-500
    const textColor: [number, number, number] = [50, 50, 50];
    
    // Encabezado - Logo o Título de la Empresa
    doc.setFontSize(24);
    doc.setTextColor(...primaryColor);
    doc.text("UPGRADE", 14, 22);
    
    // Subtítulo / Info de la empresa
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Servicios IT e Infraestructura de Redes", 14, 28);
    
    // Info del Documento
    doc.setFontSize(14);
    doc.setTextColor(...textColor);
    doc.text("PRESUPUESTO / ORDEN DE SERVICIO", 14, 42);
    
    // Info del Cliente (Derecha)
    const fechaStr = new Date().toLocaleDateString("es-AR");
    doc.setFontSize(10);
    doc.text(`Fecha: ${fechaStr}`, 140, 22);
    doc.text(`ID Presupuesto: ${proyecto.id.substring(0, 8).toUpperCase()}`, 140, 28);
    doc.text(`Estado: ${proyecto.estado.replace(/_/g, ' ')}`, 140, 34);
    
    // Bloque Cliente
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(245, 245, 245);
    doc.rect(14, 46, 182, 25, 'FD');
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Datos del Cliente:", 18, 52);
    doc.setFont("helvetica", "normal");
    doc.text(`Razón Social: ${proyecto.clientes?.nombre_razon_social || "N/A"}`, 18, 58);
    doc.text(`CUIT/CUIL: ${proyecto.clientes?.cuit_cuil || "N/A"}`, 18, 64);
    doc.text(`Dirección: ${proyecto.clientes?.direccion || "N/A"}`, 100, 58);

    // Tabla de Items
    const tableBody = items.map(item => {
      const cant_final = item.cantidad_real !== null ? item.cantidad_real : item.cantidad_estimada;
      const subtotal = item.precio_congelado * (cant_final || 0);
      
      return [
        `${item.inventario?.nombre} (${item.inventario?.tipo})`,
        new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(item.precio_congelado),
        cant_final.toString(),
        new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(subtotal)
      ];
    });

    autoTable(doc, {
      startY: 78,
      head: [['Concepto', 'Precio Unitario', 'Cantidad', 'Subtotal']],
      body: tableBody,
      theme: 'grid',
      headStyles: { fillColor: primaryColor, textColor: 255 },
      styles: { fontSize: 9 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
    });

    // Totales
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Si la obra está terminada, mostrar costo final, si no, costo estimado
    const esFinalizado = proyecto.estado === 'Finalizado' || proyecto.estado === 'En_Ejecucion';
    const totalAMostrar = esFinalizado ? proyecto.total_final : proyecto.total_estimado;
    const etiquetaTotal = esFinalizado ? "Costo Final:" : "Costo Estimado:";

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    // Alineado a la derecha, posicionado antes del monto numérico
    doc.text(etiquetaTotal, 160, finalY, { align: 'right' });
    
    doc.setTextColor(...primaryColor);
    // Alineado a la derecha, justo en el borde derecho de la tabla (aprox 196mm)
    doc.text(
      new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(totalAMostrar || 0),
      196, 
      finalY, 
      { align: 'right' }
    );

    // Notas técnicas
    if (proyecto.notas_tecnicas) {
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.text("Notas Técnicas:", 14, finalY + 15);
      
      const splitNotas = doc.splitTextToSize(proyecto.notas_tecnicas, 180);
      doc.text(splitNotas, 14, finalY + 20);
    }

    // Guardar el PDF
    doc.save(`Presupuesto_UPGRADE_${proyecto.clientes?.nombre_razon_social?.replace(/\s+/g, '_') || "Generico"}.pdf`);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-md transition-colors text-sm font-medium shadow-lg shadow-cyan-900/20"
    >
      <Download className="w-4 h-4 mr-2" />
      Exportar a PDF
    </button>
  );
}
