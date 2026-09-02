import { useState } from "react";
import { X } from "lucide-react";

const EMPTY_FORM = { name: "", category: "", pvp: "", pvc: "", source: "" };

export default function ProductFormModal({ onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.pvp || !form.pvc) {
      setError("Nombre, PVP y PVC son obligatorios.");
      return;
    }
    onSave({
      name: form.name.trim(),
      category: form.category.trim() || "General",
      pvp: parseFloat(form.pvp),
      pvc: parseFloat(form.pvc),
      source: form.source.trim(), // opcional, puede quedar vacío
    });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink-900/30 px-4">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 shadow-xl">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Agregar producto</h2>
            <p className="mt-0.5 text-sm text-ink-600">Se añadirá al catálogo de inmediato.</p>
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Nombre del producto</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Ej. Martillo de uña 16oz"
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">Categoría</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="Ej. Herramientas"
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">PVP (venta)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.pvp}
                onChange={(e) => handleChange("pvp", e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">PVC (compra)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.pvc}
                onChange={(e) => handleChange("pvc", e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-ink-600">
              Dónde compró <span className="text-ink-400">(opcional)</span>
            </label>
            <input
              type="text"
              value={form.source}
              onChange={(e) => handleChange("source", e.target.value)}
              placeholder="Ej. Distribuidora Andina"
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {error && <p className="text-xs font-medium text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-surface-soft"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600"
            >
              Guardar producto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
