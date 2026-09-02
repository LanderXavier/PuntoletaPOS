// Ventas de ejemplo (mock) para poblar el resumen del mes.
// A futuro, cada venta real generada desde "Hacer una venta" se
// sumará a este mismo listado (ver App.jsx).
const today = new Date();
const day = (offset) => new Date(today.getFullYear(), today.getMonth(), offset).toISOString();

export const mockSales = [
  { invoiceNumber: "FAC-000012", total: 42.5, customerName: "Cliente final", date: day(2) },
  { invoiceNumber: "FAC-000013", total: 18.9, customerName: "José Andrade", date: day(4) },
  { invoiceNumber: "FAC-000014", total: 63.2, customerName: "Cliente final", date: day(7) },
  { invoiceNumber: "FAC-000015", total: 27.0, customerName: "María Salazar", date: day(9) },
  { invoiceNumber: "FAC-000016", total: 95.4, customerName: "Constructora Rivas", date: day(13) },
  { invoiceNumber: "FAC-000017", total: 11.75, customerName: "Cliente final", date: day(15) },
];
