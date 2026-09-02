import jsPDF from "jspdf";
import { formatCurrency } from "./formatCurrency";
import { loadImageDimensions } from "./imageUtils";

/**
 * Dibuja la marca/logo del negocio en la esquina superior derecha de
 * la factura. Si el negocio subió un logo propio (imagen guardada
 * como data URL en Ajustes), lo incrusta manteniendo su proporción
 * dentro de un cuadro de `size` puntos. Si no hay logo propio, dibuja
 * una marca vectorial simple con la inicial del negocio.
 */
async function drawLogo(doc, x, y, size, cfg) {
  const logoSrc = cfg.logo?.src;
  const isCustomLogo = typeof logoSrc === "string" && logoSrc.startsWith("data:image");

  if (isCustomLogo) {
    try {
      const { width, height } = await loadImageDimensions(logoSrc);
      const scale = Math.min(size / width, size / height);
      const drawW = width * scale;
      const drawH = height * scale;
      const drawX = x + (size - drawW) / 2;
      const drawY = y + (size - drawH) / 2;
      const format = logoSrc.startsWith("data:image/png") ? "PNG" : "JPEG";
      doc.addImage(logoSrc, format, drawX, drawY, drawW, drawH);
      return;
    } catch {
      // Si la imagen no carga por algún motivo, cae al logo vectorial.
    }
  }

  doc.setFillColor(55, 96, 232); // brand-500
  doc.roundedRect(x, y, size, size, size * 0.2, size * 0.2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(size * 0.5);
  const initial = (cfg.businessName || "N").trim().charAt(0).toUpperCase();
  doc.text(initial, x + size / 2, y + size / 2 + size * 0.18, { align: "center" });
}

/**
 * Construye el PDF de una factura y devuelve el objeto jsPDF listo
 * para guardarlo, imprimirlo o mostrarlo — sin decidir qué hacer con
 * él (eso lo maneja pdfActions.js según el entorno: navegador o app
 * de escritorio con Tauri).
 *
 * @param {Object} sale
 * @param {Array<{id:string, name:string, pvp:number, qty:number}>} sale.items
 * @param {string} sale.customerName
 * @param {string} [sale.invoiceNumber]
 * @param {Object} config - configuración vigente del negocio (ver Ajustes)
 * @returns {Promise<{ doc: import("jspdf").jsPDF, invoiceNumber: string, total: number }>}
 */
export async function buildInvoiceDoc(sale, config) {
  const { items, customerName } = sale;
  const cfg = config;
  const symbol = cfg.currency?.symbol ?? "$";

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 48;
  let cursorY = 56;

  // ---- Encabezado: datos del negocio (izquierda) + logo (derecha) ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(28, 37, 54); // ink-900
  doc.text(cfg.businessName, marginX, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(86, 99, 122); // ink-600
  const infoLines = [
    cfg.address,
    `Tel: ${cfg.phone}  ·  ${cfg.email}`,
    `${cfg.taxIdLabel}: ${cfg.taxId}`,
  ].filter(Boolean);

  let infoY = cursorY + 16;
  infoLines.forEach((line) => {
    doc.text(line, marginX, infoY);
    infoY += 13;
  });

  await drawLogo(doc, pageWidth - marginX - 44, 40, 44, cfg);

  cursorY = Math.max(infoY, 100) + 12;
  doc.setDrawColor(227, 233, 245); // line
  doc.setLineWidth(1);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 26;

  // ---- Título del documento + número + fecha ----
  const invoiceNumber = sale.invoiceNumber || `${cfg.invoice?.prefix ?? "FAC-"}${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString("es-EC", { year: "numeric", month: "long", day: "numeric" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(55, 96, 232); // brand-500
  doc.text(cfg.invoice?.documentTitle ?? "Factura", marginX, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(86, 99, 122);
  doc.text(`N.° ${invoiceNumber}`, pageWidth - marginX, cursorY - 4, { align: "right" });
  doc.text(`Fecha: ${dateStr}`, pageWidth - marginX, cursorY + 12, { align: "right" });

  cursorY += 22;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(28, 37, 54);
  const finalCustomerName = (customerName && customerName.trim()) || cfg.invoice?.defaultCustomerName || "Cliente final";
  doc.text(`Cliente: ${finalCustomerName}`, marginX, cursorY);

  cursorY += 24;

  // ---- Tabla de items ----
  const col = {
    desc: marginX,
    qty: pageWidth - marginX - 200,
    price: pageWidth - marginX - 130,
    total: pageWidth - marginX,
  };

  doc.setFillColor(238, 243, 254); // brand-50
  doc.rect(marginX, cursorY - 14, pageWidth - marginX * 2, 22, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(42, 76, 203); // brand-600
  doc.text("Producto", col.desc + 8, cursorY);
  doc.text("Cant.", col.qty, cursorY);
  doc.text("P. Unit.", col.price, cursorY, { align: "right" });
  doc.text("Total", col.total, cursorY, { align: "right" });

  cursorY += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(28, 37, 54);

  let subtotal = 0;
  items.forEach((item, idx) => {
    const lineTotal = item.pvp * item.qty;
    subtotal += lineTotal;

    if (idx % 2 === 1) {
      doc.setFillColor(247, 249, 253);
      doc.rect(marginX, cursorY - 12, pageWidth - marginX * 2, 20, "F");
    }

    doc.setTextColor(28, 37, 54);
    doc.text(item.name, col.desc + 8, cursorY);
    doc.text(String(item.qty), col.qty, cursorY);
    doc.text(formatCurrency(item.pvp, symbol), col.price, cursorY, { align: "right" });
    doc.text(formatCurrency(lineTotal, symbol), col.total, cursorY, { align: "right" });
    cursorY += 20;
  });

  cursorY += 10;
  doc.setDrawColor(227, 233, 245);
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 24;

  // ---- Totales ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(28, 37, 54);
  doc.text("Total a pagar", col.price, cursorY, { align: "right" });
  doc.setTextColor(55, 96, 232);
  doc.text(formatCurrency(subtotal, symbol), col.total, cursorY, { align: "right" });

  // ---- Pie de página ----
  const footerNote = cfg.invoice?.footerNote;
  if (footerNote) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(139, 150, 171);
    doc.text(footerNote, marginX, doc.internal.pageSize.getHeight() - 40, {
      maxWidth: pageWidth - marginX * 2,
    });
  }

  return { doc, invoiceNumber, total: subtotal };
}
