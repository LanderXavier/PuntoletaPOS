// Ventas de ejemplo (mock) para poblar el resumen del mes.
// A futuro, cada venta real generada desde "Hacer una venta" se
// sumará a este mismo listado (ver App.jsx).
const today = new Date();
const day = (offset) => new Date(today.getFullYear(), today.getMonth(), offset).toISOString();

function withTotal(sale) {
  const total = sale.items.reduce((sum, item) => sum + item.pvp * item.qty, 0);
  return { ...sale, total: Math.round(total * 100) / 100 };
}

export const mockSales = [
  withTotal({
    id: "s1",
    invoiceNumber: "FAC-000012",
    customerName: "Cliente final",
    date: day(2),
    items: [{ id: "p1", name: "Cemento Rocafuerte 50kg", pvp: 8.5, qty: 5 }],
  }),
  withTotal({
    id: "s2",
    invoiceNumber: "FAC-000013",
    customerName: "José Andrade",
    date: day(4),
    items: [
      { id: "p2", name: "Martillo de uña 16oz", pvp: 12.9, qty: 1 },
      { id: "p6", name: "Foco LED 9W", pvp: 3.2, qty: 1 },
      { id: "p3", name: "Caja de tornillos 3/4 (100u)", pvp: 3.75, qty: 0.6 },
    ],
  }),
  withTotal({
    id: "s3",
    invoiceNumber: "FAC-000014",
    customerName: "Cliente final",
    date: day(7),
    items: [{ id: "p5", name: "Pintura látex blanca 1gal", pvp: 22.0, qty: 2 }],
  }),
  withTotal({
    id: "s4",
    invoiceNumber: "FAC-000015",
    customerName: "María Salazar",
    date: day(9),
    items: [
      { id: "p7", name: "Cinta métrica 5m", pvp: 5.5, qty: 4 },
      { id: "p10", name: "Guantes de trabajo (par)", pvp: 3.9, qty: 1 },
    ],
  }),
  withTotal({
    id: "s5",
    invoiceNumber: "FAC-000016",
    customerName: "Constructora Rivas",
    date: day(13),
    items: [{ id: "p1", name: "Cemento Rocafuerte 50kg", pvp: 8.5, qty: 11 }],
  }),
  withTotal({
    id: "s6",
    invoiceNumber: "FAC-000017",
    customerName: "Cliente final",
    date: day(15),
    items: [
      { id: "p8", name: "Bisagra reforzada 3in (par)", pvp: 2.4, qty: 2 },
      { id: "p6", name: "Foco LED 9W", pvp: 3.2, qty: 2 },
    ],
  }),
];
