import { useMemo } from "react";
import { TrendingUp, Receipt, Users, Wallet } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import PageHeader from "../layout/PageHeader";

const MONTH_LABEL = new Date().toLocaleDateString("es-EC", { month: "long", year: "numeric" });

export default function DashboardView({ sales, settings }) {
  const symbol = settings.currency?.symbol ?? "$";

  const stats = useMemo(() => {
    const totalIngresado = sales.reduce((sum, s) => sum + s.total, 0);
    const numFacturas = sales.length;
    const ticketPromedio = numFacturas ? totalIngresado / numFacturas : 0;
    const clientesUnicos = new Set(sales.map((s) => s.customerName)).size;
    return { totalIngresado, numFacturas, ticketPromedio, clientesUnicos };
  }, [sales]);

  const recentSales = useMemo(
    () => [...sales].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8),
    [sales]
  );

  const cards = [
    { label: "Total ingresado", value: formatCurrency(stats.totalIngresado, symbol), icon: Wallet, tone: "brand" },
    { label: "Facturas emitidas", value: stats.numFacturas, icon: Receipt, tone: "teal" },
    { label: "Ticket promedio", value: formatCurrency(stats.ticketPromedio, symbol), icon: TrendingUp, tone: "brand" },
    { label: "Clientes distintos", value: stats.clientesUnicos, icon: Users, tone: "teal" },
  ];

  return (
    <div>
      <PageHeader title="Resumen del mes" subtitle={`Ventas registradas en ${MONTH_LABEL}.`} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-line bg-surface p-5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                tone === "brand" ? "bg-brand-50 text-brand-600" : "bg-success-soft text-success"
              }`}
            >
              <Icon size={18} />
            </div>
            <p className="mt-3 font-display text-2xl font-bold text-ink-900">{value}</p>
            <p className="text-xs text-ink-600">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-line bg-surface">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-display text-sm font-bold text-ink-900">Últimas facturas</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs font-semibold uppercase tracking-wide text-ink-400">
              <th className="px-5 py-3">N.° factura</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {recentSales.map((sale) => (
              <tr key={sale.invoiceNumber} className="hover:bg-surface-soft">
                <td className="px-5 py-3 font-medium text-ink-900">{sale.invoiceNumber}</td>
                <td className="px-5 py-3 text-ink-600">{sale.customerName}</td>
                <td className="px-5 py-3 text-ink-400">
                  {new Date(sale.date).toLocaleDateString("es-EC", { day: "2-digit", month: "short" })}
                </td>
                <td className="px-5 py-3 text-right font-semibold text-ink-900">
                  {formatCurrency(sale.total, symbol)}
                </td>
              </tr>
            ))}
            {recentSales.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-sm text-ink-400">
                  Aún no hay ventas registradas este mes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
