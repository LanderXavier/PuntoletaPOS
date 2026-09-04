import { useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import SalesView from "./components/sales/SalesView";
import ProductsView from "./components/products/ProductsView";
import DashboardView from "./components/dashboard/DashboardView";
import SettingsView from "./components/settings/SettingsView";
import { mockProducts } from "./data/mockProducts";
import { mockSales } from "./data/mockSales";
import defaultSettings from "./config/businessConfig.json";
import { useLocalStorageState } from "./hooks/useLocalStorageState";

// Genera un id corto sin depender de un contador persistido.
function newId() {
  return (crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random()}`).slice(0, 12);
}

export default function App() {
  const [activeView, setActiveView] = useState("sale");
  const [products, setProducts] = useLocalStorageState("pos:products", mockProducts);
  const [sales, setSales] = useLocalStorageState("pos:sales", mockSales);
  const [settings, setSettings] = useLocalStorageState("pos:settings", defaultSettings);

  // La venta en curso vive aquí (no dentro de SalesView) para que no se
  // pierda si el usuario se va a "Lista de productos" a agregar algo que
  // le faltaba y luego vuelve a "Hacer una venta". Se queda en memoria
  // (no en localStorage) a propósito: es algo temporal que dura mientras
  // el programa está abierto, no un dato que deba sobrevivir a cerrarlo.
  const [cart, setCart] = useState([]); // [{ id, name, pvp, qty }]
  const [customerName, setCustomerName] = useState("");

  function handleAddProduct(product) {
    setProducts((prev) => [...prev, { id: newId(), ...product }]);
  }

  function handleDeleteProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleImportProducts(importedProducts) {
    setProducts((prev) => [...prev, ...importedProducts.map((p) => ({ id: newId(), ...p }))]);
  }

  function handleSaleCompleted(sale) {
    setSales((prev) => [...prev, { id: newId(), ...sale }]);
    setCart([]);
    setCustomerName("");
  }

  // Identifica una venta por su id; las facturas guardadas antes de esta
  // versión no tienen id, así que usamos el número de factura como respaldo.
  function saleKey(s) {
    return s.id ?? s.invoiceNumber;
  }

  function handleUpdateSale(key, updatedSale) {
    setSales((prev) => prev.map((s) => (saleKey(s) === key ? { ...s, ...updatedSale } : s)));
  }

  function handleDeleteSale(key) {
    setSales((prev) => prev.filter((s) => saleKey(s) !== key));
  }

  function handleUpdateSettings(nextSettings) {
    setSettings(nextSettings);
  }

  // Borra lo que el usuario haya marcado en Ajustes: inventario,
  // ventas del mes, o ambos. Nunca toca los datos de la tienda.
  function handleResetSelected({ resetProducts, resetSales }) {
    if (resetProducts) setProducts([]);
    if (resetSales) setSales([]);
  }

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar activeView={activeView} onNavigate={setActiveView} settings={settings} />

      <main className="ml-64 min-h-screen px-8 py-8">
        <div className="mx-auto max-w-6xl">
          {activeView === "sale" && (
            <SalesView
              products={products}
              settings={settings}
              cart={cart}
              onCartChange={setCart}
              customerName={customerName}
              onCustomerNameChange={setCustomerName}
              onSaleCompleted={handleSaleCompleted}
            />
          )}
          {activeView === "products" && (
            <ProductsView
              products={products}
              settings={settings}
              onAddProduct={handleAddProduct}
              onDeleteProduct={handleDeleteProduct}
              onImportProducts={handleImportProducts}
            />
          )}
          {activeView === "summary" && (
            <DashboardView
              sales={sales}
              settings={settings}
              onUpdateSale={handleUpdateSale}
              onDeleteSale={handleDeleteSale}
            />
          )}
          {activeView === "settings" && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetSelected={handleResetSelected}
            />
          )}
        </div>
      </main>
    </div>
  );
}
