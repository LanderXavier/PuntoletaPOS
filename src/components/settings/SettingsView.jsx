import { useRef, useState } from "react";
import { Save, CheckCircle2, AlertTriangle, Trash2, ImagePlus, X, Loader2 } from "lucide-react";
import PageHeader from "../layout/PageHeader";
import { resizeImageToDataUrl } from "../../utils/imageUtils";

const FIELDS = [
  { key: "businessName", label: "Nombre comercial", placeholder: "Ferretería El Tornillo" },
  { key: "legalName", label: "Razón social", placeholder: "El Tornillo Cía. Ltda." },
  { key: "taxId", label: "RUC / identificación tributaria", placeholder: "1792345678001" },
  { key: "address", label: "Dirección", placeholder: "Av. Principal y Secundaria" },
  { key: "phone", label: "Teléfono", placeholder: "+593 99 123 4567" },
  { key: "email", label: "Correo", placeholder: "ventas@negocio.com" },
  { key: "website", label: "Sitio web", placeholder: "www.negocio.com" },
];

const RESET_PHRASE = "borrar todo";

const RESET_OPTIONS = [
  { key: "products", label: "Lista de productos", hint: "Borra todo el inventario/catálogo." },
  { key: "sales", label: "Ventas del mes", hint: "Borra el historial de facturas registradas." },
];

export default function SettingsView({ settings, onUpdateSettings, onResetSelected }) {
  const [form, setForm] = useState({
    businessName: settings.businessName ?? "",
    legalName: settings.legalName ?? "",
    taxId: settings.taxId ?? "",
    address: settings.address ?? "",
    phone: settings.phone ?? "",
    email: settings.email ?? "",
    website: settings.website ?? "",
    currencySymbol: settings.currency?.symbol ?? "$",
    footerNote: settings.invoice?.footerNote ?? "",
    defaultCustomerName: settings.invoice?.defaultCustomerName ?? "Cliente final",
  });
  const [saved, setSaved] = useState(false);

  // ---- Logo ----
  const fileInputRef = useRef(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [logoError, setLogoError] = useState("");
  const currentLogoSrc = settings.logo?.src || "/logo-placeholder.svg";
  const hasCustomLogo = Boolean(settings.logo?.src);

  // ---- Reseteo selectivo ----
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetInput, setResetInput] = useState("");
  const [resetSelection, setResetSelection] = useState({ products: false, sales: false });
  const anyResetSelected = resetSelection.products || resetSelection.sales;
  const canConfirmReset = anyResetSelected && resetInput.trim().toLowerCase() === RESET_PHRASE;

  function handleChange(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e) {
    e.preventDefault();
    onUpdateSettings({
      ...settings,
      businessName: form.businessName.trim(),
      legalName: form.legalName.trim(),
      taxId: form.taxId.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      website: form.website.trim(),
      currency: { ...settings.currency, symbol: form.currencySymbol.trim() || "$" },
      invoice: {
        ...settings.invoice,
        footerNote: form.footerNote.trim(),
        defaultCustomerName: form.defaultCustomerName.trim() || "Cliente final",
      },
    });
    setSaved(true);
  }

  function handleLogoClick() {
    fileInputRef.current?.click();
  }

  async function handleLogoFileChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setLogoError("Elige un archivo de imagen (PNG, JPG, etc.).");
      return;
    }

    setLogoError("");
    setIsUploadingLogo(true);
    try {
      const dataUrl = await resizeImageToDataUrl(file, 320);
      onUpdateSettings({
        ...settings,
        logo: { ...settings.logo, src: dataUrl, alt: `Logo de ${settings.businessName}` },
      });
    } catch {
      setLogoError("No se pudo procesar esa imagen. Intenta con otra.");
    } finally {
      setIsUploadingLogo(false);
    }
  }

  function handleRemoveLogo() {
    onUpdateSettings({ ...settings, logo: { ...settings.logo, src: "" } });
  }

  function toggleResetOption(key) {
    setResetSelection((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleOpenResetModal() {
    setResetSelection({ products: false, sales: false });
    setResetInput("");
    setShowResetModal(true);
  }

  function handleConfirmReset() {
    if (!canConfirmReset) return;
    onResetSelected({ resetProducts: resetSelection.products, resetSales: resetSelection.sales });
    setShowResetModal(false);
    setResetInput("");
  }

  return (
    <div>
      <PageHeader title="Ajustes" subtitle="Datos de la tienda y opciones de mantenimiento." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* Datos de la tienda */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-line bg-surface p-6"
        >
          <h2 className="font-display text-sm font-bold text-ink-900">Datos de la tienda</h2>
          <p className="mt-1 text-sm text-ink-600">
            Esta información aparece en el encabezado de cada factura generada.
          </p>

          {/* Logo */}
          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-line bg-canvas">
              <img src={currentLogoSrc} alt="Logo actual" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-600">Logo del negocio</p>
              <div className="mt-1.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleLogoClick}
                  disabled={isUploadingLogo}
                  className="flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink-600 transition-colors hover:border-brand-400 hover:text-brand-600 disabled:opacity-60"
                >
                  {isUploadingLogo ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                  Importar foto
                </button>
                {hasCustomLogo && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="flex items-center gap-1 text-xs font-medium text-ink-400 hover:text-danger"
                  >
                    <X size={12} />
                    Quitar
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoFileChange}
              />
              {logoError && <p className="mt-1 text-[11px] font-medium text-danger">{logoError}</p>}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FIELDS.map(({ key, label, placeholder }) => (
              <div key={key} className={key === "address" ? "sm:col-span-2" : ""}>
                <label className="mb-1.5 block text-xs font-medium text-ink-600">{label}</label>
                <input
                  type="text"
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
                />
              </div>
            ))}

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Símbolo de moneda</label>
              <input
                type="text"
                value={form.currencySymbol}
                onChange={(e) => handleChange("currencySymbol", e.target.value)}
                placeholder="$"
                maxLength={3}
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Cliente por defecto</label>
              <input
                type="text"
                value={form.defaultCustomerName}
                onChange={(e) => handleChange("defaultCustomerName", e.target.value)}
                placeholder="Cliente final"
                className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-ink-600">Nota al pie de la factura</label>
              <textarea
                value={form.footerNote}
                onChange={(e) => handleChange("footerNote", e.target.value)}
                rows={2}
                placeholder="Gracias por su compra..."
                className="w-full resize-none rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
            >
              <Save size={16} />
              Guardar cambios
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-success">
                <CheckCircle2 size={16} />
                Guardado
              </span>
            )}
          </div>
        </form>

        {/* Zona de peligro */}
        <div className="h-fit rounded-2xl border border-danger-soft bg-surface p-6">
          <div className="flex items-center gap-2 text-danger">
            <AlertTriangle size={18} />
            <h2 className="font-display text-sm font-bold">Zona de peligro</h2>
          </div>
          <p className="mt-2 text-sm text-ink-600">
            Borra permanentemente lo que elijas: la lista de productos, las ventas del mes,
            o ambas. Los datos de la tienda de arriba nunca se ven afectados. Esta acción no
            se puede deshacer.
          </p>
          <button
            type="button"
            onClick={handleOpenResetModal}
            className="mt-4 flex items-center gap-2 rounded-xl border border-danger/30 bg-danger-soft px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger hover:text-white"
          >
            <Trash2 size={16} />
            Resetear datos
          </button>
        </div>
      </div>

      {showResetModal && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-ink-900/30 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-xl">
            <div className="flex items-center gap-2 text-danger">
              <AlertTriangle size={20} />
              <h2 className="font-display text-base font-bold">¿Qué quieres borrar?</h2>
            </div>

            <div className="mt-4 space-y-2">
              {RESET_OPTIONS.map(({ key, label, hint }) => (
                <label
                  key={key}
                  className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3.5 py-3 hover:bg-surface-soft"
                >
                  <input
                    type="checkbox"
                    checked={resetSelection[key]}
                    onChange={() => toggleResetOption(key)}
                    className="mt-0.5 h-4 w-4 accent-danger"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-ink-900">{label}</span>
                    <span className="block text-xs text-ink-400">{hint}</span>
                  </span>
                </label>
              ))}
            </div>

            <p className="mt-4 text-sm text-ink-600">
              Para confirmar, escribe <span className="font-semibold text-ink-900">"borrar todo"</span> abajo.
            </p>
            <input
              type="text"
              value={resetInput}
              onChange={(e) => setResetInput(e.target.value)}
              placeholder="borrar todo"
              disabled={!anyResetSelected}
              className="mt-2 w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm outline-none focus:border-danger focus:ring-2 focus:ring-danger-soft disabled:opacity-50"
            />

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-ink-600 hover:bg-surface-soft"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={!canConfirmReset}
                className="rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-danger/90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sí, borrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
