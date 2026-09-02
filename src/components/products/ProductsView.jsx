import { useMemo, useRef, useState } from "react";
import { Search, Trash2, Plus, FileSpreadsheet, Loader2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";
import { parseProductsExcel } from "../../utils/parseProductsExcel";
import PageHeader from "../layout/PageHeader";
import ProductFormModal from "./ProductFormModal";

export default function ProductsView({ products, settings, onAddProduct, onDeleteProduct, onImportProducts }) {
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState(null); // { type: 'ok'|'error', text }
  const fileInputRef = useRef(null);
  const symbol = settings.currency?.symbol ?? "$";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [products, query]);

  function handleSaveProduct(newProduct) {
    onAddProduct(newProduct);
    setShowForm(false);
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite volver a elegir el mismo archivo después
    if (!file) return;

    setIsImporting(true);
    setImportMessage(null);
    try {
      const imported = await parseProductsExcel(file);
      if (imported.length === 0) {
        setImportMessage({
          type: "error",
          text: 'No se encontraron filas válidas. Verifica que el Excel tenga columnas "Nombre", "PVP" y "PVC".',
        });
      } else {
        onImportProducts(imported);
        setImportMessage({ type: "ok", text: `Se importaron ${imported.length} producto(s) correctamente.` });
      }
    } catch (err) {
      setImportMessage({ type: "error", text: "No se pudo leer el archivo. Asegúrate de subir un .xlsx, .xls o .csv válido." });
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Lista de productos"
        subtitle={`Catálogo actual — ${products.length} producto(s) registrados.`}
        action={
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              onClick={handleImportClick}
              disabled={isImporting}
              className="flex items-center gap-2 rounded-xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:opacity-60"
            >
              {isImporting ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
              Importar desde Excel
            </button>
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              <Plus size={16} />
              Agregar producto
            </button>
          </div>
        }
      />

      {importMessage && (
        <div
          className={`mb-4 rounded-xl px-4 py-2.5 text-sm font-medium ${
            importMessage.type === "ok"
              ? "bg-success-soft text-success"
              : "bg-danger-soft text-danger"
          }`}
        >
          {importMessage.text}
        </div>
      )}

      <div className="relative mb-5 max-w-sm">
        <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o categoría..."
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-10 pr-3.5 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line bg-brand-50/60 text-xs font-semibold uppercase tracking-wide text-brand-600">
              <th className="px-5 py-3">Producto</th>
              <th className="px-5 py-3">Categoría</th>
              <th className="px-5 py-3 text-right">PVC</th>
              <th className="px-5 py-3 text-right">PVP</th>
              <th className="px-5 py-3">Dónde compró</th>
              <th className="px-5 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {filtered.map((product) => (
              <tr key={product.id} className="transition-colors hover:bg-surface-soft">
                <td className="px-5 py-3 font-medium text-ink-900">{product.name}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-medium text-ink-600">
                    {product.category}
                  </span>
                </td>
                <td className="px-5 py-3 text-right text-ink-600">{formatCurrency(product.pvc, symbol)}</td>
                <td className="px-5 py-3 text-right font-semibold text-ink-900">
                  {formatCurrency(product.pvp, symbol)}
                </td>
                <td className="px-5 py-3 text-ink-400">{product.source || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onDeleteProduct(product.id)}
                    className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-danger-soft hover:text-danger"
                    aria-label={`Eliminar ${product.name}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-sm text-ink-400">
                  No se encontraron productos para "{query}".
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <ProductFormModal onClose={() => setShowForm(false)} onSave={handleSaveProduct} />
      )}
    </div>
  );
}
