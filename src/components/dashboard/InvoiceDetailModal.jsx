import { useMemo, useState } from "react";
import { X, Pencil, Trash2, Save, AlertTriangle, ShoppingCart } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function InvoiceDetailModal({ sale, symbol, onClose, onSave, onDelete, onLoadIntoSale }) {
  const hasItems = Array.isArray(sale.items) && sale.items.length > 0;

  const [isEditing, setIsEditing] = useState(false);
  const [customerName, setCustomerName] = useState(sale.customerName || "");
  const [items, setItems] = useState(sale.items ? sale.items.map((it) => ({ ...it })) : []);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingLoad, setConfirmingLoad] = useState(false);

  const liveTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.pvp * item.qty, 0),
    [items]
  );

  function startEditing() {
    setCustomerName(sale.customerName || "");
    setItems(sale.items ? sale.items.map((it) => ({ ...it })) : []);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
  }

  function updateItemQty(id, qty) {
    if (qty < 1) return;
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, qty } : it)));
  }

  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  function handleSaveEdits() {
    onSave({
      customerName: customerName.trim() || "Cliente final",
      items,
      total: Math.round(liveTotal * 100) / 100,
    });
    setIsEditing(false);
  }

  function handleConfirmDelete() {
    onDelete();
  }

  function handleConfirmLoad() {
    onLoadIntoSale();
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink-900/30 px-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <div className="flex shrink-0 items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">{sale.invoiceNumber}</h2>
            <p className="mt-0.5 text-sm text-ink-600">
              {new Date(sale.date).toLocaleDateString("es-EC", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-surface-soft hover:text-ink-900"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cliente */}
        <div className="mt-5 shrink-0">
          <label className="mb-1.5 block text-xs font-medium text-ink-600">Cliente</label>
          {isEditing ? (
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          ) : (
            <p className="text-sm font-semibold text-ink-900">{sale.customerName || "Cliente final"}</p>
          )}
        </div>

        {/* Productos: esta es la parte que hace scroll internamente cuando
            hay muchos items, el resto del modal se queda fijo. */}
        <div className="mt-5 flex min-h-0 flex-1 flex-col">
          <p className="mb-2 shrink-0 text-xs font-medium text-ink-600">Productos</p>
          {!hasItems ? (
            <p className="rounded-xl border border-dashed border-line px-3.5 py-4 text-center text-sm text-ink-400">
              Esta factura no tiene detalle de productos guardado (se registró antes de esta versión).
            </p>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-line">
              <ul className="divide-y divide-line">
                {(isEditing ? items : sale.items).map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-2 px-3.5 py-2.5">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink-900">{item.name}</p>
                      <p className="text-xs text-ink-400">{formatCurrency(item.pvp, symbol)} c/u</p>
                    </div>
                    {isEditing ? (
                      <>
                        <input
                          type="number"
                          min={1}
                          value={item.qty}
                          onChange={(e) => updateItemQty(item.id, Number(e.target.value))}
                          className="w-14 rounded-lg border border-line bg-canvas py-1 text-center text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                        />
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-danger-soft hover:text-danger"
                          aria-label={`Quitar ${item.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </>
                    ) : (
                      <span className="w-16 shrink-0 text-right text-sm font-semibold text-ink-900">
                        x{item.qty}
                      </span>
                    )}
                  </li>
                ))}
                {isEditing && items.length === 0 && (
                  <li className="px-3.5 py-4 text-center text-sm text-ink-400">
                    Sin productos — esta factura quedaría vacía.
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Total */}
        <div className="mt-4 flex shrink-0 items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
          <span className="text-sm font-medium text-brand-600">Total</span>
          <span className="font-display text-lg font-bold text-brand-600">
            {formatCurrency(isEditing ? liveTotal : sale.total, symbol)}
          </span>
        </div>

        {/* Acciones */}
        <div className="mt-5 shrink-0">
          {confirmingDelete ? (
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={16} className="text-danger" />
              <span className="text-ink-600">¿Eliminar esta factura?</span>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-lg bg-danger px-3 py-1.5 text-xs font-semibold text-white hover:bg-danger/90"
              >
                Sí, eliminar
              </button>
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-surface-soft"
              >
                Cancelar
              </button>
            </div>
          ) : confirmingLoad ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <AlertTriangle size={16} className="shrink-0 text-brand-500" />
              <span className="text-ink-600">Esto reemplaza la venta actual en curso. ¿Continuar?</span>
              <button
                type="button"
                onClick={handleConfirmLoad}
                className="rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-600"
              >
                Sí, cargar
              </button>
              <button
                type="button"
                onClick={() => setConfirmingLoad(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-ink-600 hover:bg-surface-soft"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-danger hover:bg-danger-soft"
              >
                <Trash2 size={15} />
                Eliminar factura
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-surface-soft"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdits}
                      className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
                    >
                      <Save size={15} />
                      Guardar cambios
                    </button>
                  </>
                ) : (
                  hasItems && (
                    <>
                      <button
                        type="button"
                        onClick={() => setConfirmingLoad(true)}
                        className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-600 hover:border-brand-400 hover:text-brand-600"
                        title="Carga esta factura en Hacer una venta para modificarla (agregar productos, etc.)"
                      >
                        <ShoppingCart size={15} />
                        Modificar en Ventas
                      </button>
                      <button
                        type="button"
                        onClick={startEditing}
                        className="flex items-center gap-1.5 rounded-xl border border-line px-4 py-2.5 text-sm font-semibold text-ink-600 hover:border-brand-400 hover:text-brand-600"
                      >
                        <Pencil size={15} />
                        Editar
                      </button>
                    </>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
