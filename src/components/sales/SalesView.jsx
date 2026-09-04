import { useEffect, useMemo, useRef, useState } from "react";
import { Search, Plus, Trash2, Save, User, Loader2, X, Check } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { buildInvoiceDoc } from "../../utils/generateInvoicePdf";
import { saveInvoicePdf } from "../../utils/pdfActions";
import PageHeader from "../layout/PageHeader";

export default function SalesView({
  products,
  settings,
  cart,
  onCartChange,
  customerName,
  onCustomerNameChange,
  onSaleCompleted,
}) {
  const [query, setQuery] = useState("");
  const [busyAction, setBusyAction] = useState(null); // 'save' | null
  const [actionError, setActionError] = useState("");
  const [confirmingClear, setConfirmingClear] = useState(false);
  const [justAddedId, setJustAddedId] = useState(null); // resalta el ítem recién agregado en el carrito
  const [justClickedId, setJustClickedId] = useState(null); // feedback en el botón "+" de la lista de búsqueda
  const highlightTimeoutRef = useRef(null);
  const clickTimeoutRef = useRef(null);
  const symbol = settings.currency?.symbol ?? "$";

  useEffect(() => {
    return () => {
      clearTimeout(highlightTimeoutRef.current);
      clearTimeout(clickTimeoutRef.current);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products.slice(0, 6);
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.pvp * item.qty, 0),
    [cart]
  );

  function addToCart(product) {
    // El producto agregado (nuevo o repetido) siempre pasa al inicio de
    // la lista, así se ve de inmediato que se agregó sin tener que
    // buscarlo entre los demás.
    onCartChange((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        const updated = { ...existing, qty: existing.qty + 1 };
        return [updated, ...prev.filter((item) => item.id !== product.id)];
      }
      return [{ id: product.id, name: product.name, pvp: product.pvp, qty: 1 }, ...prev];
    });

    clearTimeout(highlightTimeoutRef.current);
    setJustAddedId(product.id);
    highlightTimeoutRef.current = setTimeout(() => setJustAddedId(null), 700);

    clearTimeout(clickTimeoutRef.current);
    setJustClickedId(product.id);
    clickTimeoutRef.current = setTimeout(() => setJustClickedId(null), 500);
  }

  function updateQty(id, qty) {
    if (qty < 1) return;
    onCartChange((prev) => prev.map((item) => (item.id === id ? { ...item, qty } : item)));
  }

  function removeFromCart(id) {
    onCartChange((prev) => prev.filter((item) => item.id !== id));
  }

  function handleClearCart() {
    onCartChange([]);
    onCustomerNameChange("");
    setConfirmingClear(false);
  }

  async function handleSaveInvoice() {
    if (cart.length === 0) return;
    setActionError("");
    setBusyAction("save");
    try {
      const finalName = customerName.trim() || settings.invoice?.defaultCustomerName || "Cliente final";
      const { doc, invoiceNumber, total: saleTotal } = await buildInvoiceDoc(
        { items: cart, customerName: finalName },
        settings
      );
      const result = await saveInvoicePdf(doc, `${invoiceNumber}.pdf`);
      if (result.saved) {
        onSaleCompleted?.({
          invoiceNumber,
          total: saleTotal,
          customerName: finalName,
          date: new Date().toISOString(),
          items: cart,
        });
      }
      // Si el usuario canceló el diálogo "Guardar como...", no pasa nada:
      // el carrito se mantiene intacto para que pueda intentar de nuevo.
    } catch (err) {
      console.error(err);
      const detail = err?.message || String(err ?? "");
      setActionError(`No se pudo guardar la factura. ${detail ? `(${detail})` : "Intenta de nuevo."}`);
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <div>
      <PageHeader
        title="Hacer una venta"
        subtitle="Busca productos, arma la venta actual y genera la factura. Si te falta un producto, puedes ir a agregarlo sin perder lo que llevas."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Buscador y catálogo rápido */}
        <section className="rounded-2xl border border-line bg-surface p-5">
          <div className="relative">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar producto por nombre..."
              className="w-full rounded-xl border border-line bg-canvas py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <ul className="mt-4 divide-y divide-line">
            {filteredProducts.map((product) => {
              const justClicked = justClickedId === product.id;
              return (
                <li key={product.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink-900">{product.name}</p>
                    <p className="text-xs text-ink-400">{product.category}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-ink-900">
                      {formatCurrency(product.pvp, symbol)}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(product)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                        justClicked
                          ? "bg-success-soft text-success"
                          : "bg-brand-50 text-brand-600 hover:bg-brand-100"
                      }`}
                      aria-label={`Agregar ${product.name}`}
                    >
                      <span className={justClicked ? "animate-add-pulse" : ""}>
                        {justClicked ? <Check size={16} strokeWidth={2.6} /> : <Plus size={16} strokeWidth={2.4} />}
                      </span>
                    </button>
                  </div>
                </li>
              );
            })}
            {filteredProducts.length === 0 && (
              <li className="py-6 text-center text-sm text-ink-400">
                No se encontraron productos para "{query}".
              </li>
            )}
          </ul>
        </section>

        {/* Venta actual */}
        <section className="flex max-h-[calc(100vh-140px)] flex-col rounded-2xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-bold text-ink-900">Venta actual</h2>
            {cart.length > 0 &&
              (confirmingClear ? (
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-ink-600">¿Vaciar todo?</span>
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="rounded-lg bg-danger-soft px-2 py-1 font-semibold text-danger hover:bg-danger hover:text-white"
                  >
                    Sí, vaciar
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingClear(false)}
                    className="rounded-lg px-2 py-1 text-ink-400 hover:bg-surface-soft"
                  >
                    Cancelar
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmingClear(true)}
                  className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-danger"
                >
                  <X size={13} />
                  Vaciar venta
                </button>
              ))}
          </div>

          <div className="mt-4 shrink-0">
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Cliente</label>
            <div className="relative">
              <User size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => onCustomerNameChange(e.target.value)}
                placeholder="Cliente final"
                className="w-full rounded-xl border border-line bg-canvas py-2.5 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <p className="mt-1 text-[11px] text-ink-400">
              Si lo dejas vacío, se guardará como "{settings.invoice?.defaultCustomerName ?? "Cliente final"}".
            </p>
          </div>

          {/* Total: arriba de la lista, siempre visible */}
          <div className="mt-4 flex shrink-0 items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
            <span className="text-sm font-medium text-brand-600">Total</span>
            <span className="font-display text-xl font-bold text-brand-600">
              {formatCurrency(total, symbol)}
            </span>
          </div>

          {/* Lista de productos del carrito: scroll propio, no mueve el resto de la ventana */}
          <div className="mt-4 min-h-[100px] flex-1 overflow-y-auto pr-1">
            {cart.length === 0 ? (
              <div className="flex h-40 flex-col items-center justify-center rounded-xl border border-dashed border-line text-center">
                <p className="text-sm text-ink-400">Aún no has agregado productos.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {cart.map((item) => (
                  <li
                    key={item.id}
                    className={`flex items-center justify-between gap-2 rounded-lg py-3 ${
                      item.id === justAddedId ? "animate-cart-item-in" : ""
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{item.name}</p>
                      <p className="text-xs text-ink-400">{formatCurrency(item.pvp, symbol)} c/u</p>
                    </div>
                    <input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) => updateQty(item.id, Number(e.target.value))}
                      className="w-14 rounded-lg border border-line bg-canvas py-1 text-center text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                    />
                    <span className="w-16 text-right text-sm font-semibold text-ink-900">
                      {formatCurrency(item.pvp * item.qty, symbol)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-danger-soft hover:text-danger"
                      aria-label={`Quitar ${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-4 shrink-0 border-t border-line pt-4">
            {actionError && (
              <p className="mb-3 text-xs font-medium text-danger">{actionError}</p>
            )}
            <button
              type="button"
              onClick={handleSaveInvoice}
              disabled={cart.length === 0 || busyAction !== null}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-brand-100 disabled:text-brand-400"
            >
              {busyAction === "save" ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
              Guardar factura
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
