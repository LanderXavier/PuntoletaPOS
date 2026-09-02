import { ShoppingCart, Package, BarChart3, Settings } from "lucide-react";

const NAV_ITEMS = [
  { key: "sale", label: "Hacer una venta", icon: ShoppingCart },
  { key: "products", label: "Lista de productos", icon: Package },
  { key: "summary", label: "Resumen del mes", icon: BarChart3 },
  { key: "settings", label: "Ajustes", icon: Settings },
];

export default function Sidebar({ activeView, onNavigate, settings }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r border-line bg-surface">
      {/* Marca */}
      <div className="flex items-center gap-3 px-6 py-6">
        <img
          src={settings.logo?.src || "/logo-placeholder.svg"}
          alt={settings.logo?.alt ?? "Logo"}
          className="h-10 w-10 rounded-xl object-cover"
        />
        <div className="min-w-0 leading-tight">
          <p className="truncate font-display text-[15px] font-bold text-ink-900">
            {settings.businessName}
          </p>
          <p className="text-xs text-ink-400">Punto de venta</p>
        </div>
      </div>

      {/* Navegación */}
      <nav className="mt-2 flex-1 space-y-1 px-3">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = activeView === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-brand-50 text-brand-600"
                  : "text-ink-600 hover:bg-surface-soft hover:text-ink-900"
              }`}
            >
              <Icon
                size={18}
                strokeWidth={2.2}
                className={isActive ? "text-brand-500" : "text-ink-400 group-hover:text-brand-400"}
              />
              {label}
              {isActive && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Pie de la barra lateral */}
      <div className="border-t border-line px-6 py-4">
        <p className="truncate text-xs text-ink-400">{settings.phone}</p>
        <p className="truncate text-xs text-ink-400">{settings.email}</p>
      </div>
    </aside>
  );
}
