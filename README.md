# Puntoleta POS

Sistema de Punto de Venta (POS) simple, para una sola caja, construido
con React + Vite y empaquetado como app de escritorio con Tauri.
Los datos se guardan localmente en el dispositivo (no requiere
backend ni base de datos externa).

## Funcionalidad

- **Hacer una venta** — busca productos, arma el carrito (lo último
  agregado siempre aparece primero, con animación), registra el
  cliente y guarda la factura como PDF eligiendo dónde con el diálogo
  nativo del sistema.
- **Lista de productos** — catálogo con PVP, PVC y "dónde compró";
  permite agregar, eliminar e **importar productos desde Excel**
  (`.xlsx`/`.xls`/`.csv`).
- **Resumen del mes** — totales, ticket promedio y clientes distintos;
  cada factura del listado se puede abrir para consultar, editar
  (cliente/cantidades) o eliminar individualmente.
- **Ajustes** — datos de la tienda (nombre, dirección, RUC, etc.) y
  logo del negocio (se puede subir una foto, se usa en la barra
  lateral y en el encabezado de la factura), más un reseteo selectivo
  de inventario y/o ventas con confirmación.

## Stack técnico

- **React 19 + Vite** — interfaz
- **Tailwind CSS v4** — estilos
- **jsPDF** — generación de facturas en PDF (con paginación automática
  para facturas de varios productos)
- **xlsx (SheetJS)** — lectura de archivos Excel para importar productos
- **Tauri v2** — empaquetado como app de escritorio para Windows/Mac/Linux
- **localStorage** — persistencia de productos, ventas y configuración
  de la tienda (sin backend)

## Requisitos

- [Node.js](https://nodejs.org) (LTS)
- Para compilar la app de escritorio, además necesitas:
  - [Rust](https://rustup.rs)
  - En Windows: [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
    (con "Desktop development with C++") y WebView2 (ya viene en
    Windows 10/11)
  - Ver la lista completa por sistema operativo en los
    [prerequisitos de Tauri](https://v2.tauri.app/start/prerequisites/)

## Cómo correrlo

```bash
npm install

# Solo como app web, en el navegador
npm run dev

# Como app de escritorio nativa (ventana con Tauri)
npm run desktop:dev
```

## Cómo generar el instalador de escritorio

```bash
npm run desktop:build
```

El instalador queda en:
```
src-tauri/target/release/bundle/
```
(`nsis/` para el `.exe` en Windows, `msi/` para `.msi`, `dmg/`/`app/`
en Mac, `deb/`/`AppImage/` en Linux).

## Estructura del proyecto

```
src/
  config/businessConfig.json    # datos por defecto de la tienda (ver Ajustes)
  data/                         # datos de ejemplo (mock) iniciales
  hooks/useLocalStorageState.js # estado de React persistido en localStorage
  utils/
    generateInvoicePdf.js       # arma el PDF de la factura (con paginación)
    pdfActions.js                # guarda el PDF (diálogo nativo en escritorio)
    parseProductsExcel.js       # lee el Excel al importar productos
    imageUtils.js                # redimensiona el logo subido
  components/
    layout/                     # Sidebar y encabezados de página
    sales/                      # "Hacer una venta"
    products/                   # "Lista de productos" + importar/agregar
    dashboard/                  # "Resumen del mes" + detalle de factura
    settings/                   # "Ajustes"
  App.jsx                       # estado central (productos, ventas, venta en curso)
src-tauri/                      # proyecto Rust/Tauri para la app de escritorio
```

## Dónde se guardan los datos

Todo vive en `localStorage`, sin backend:

- **Web/navegador**: dentro del propio navegador (por origen).
- **App de escritorio (Tauri)**: en la carpeta de datos de WebView2,
  típicamente `%LOCALAPPDATA%\<identifier>\EBWebView\Default\Local Storage\`
  en Windows (el `identifier` está en `src-tauri/tauri.conf.json`).
  Actualizar o reinstalar la app **no borra** esos datos, siempre que
  el `identifier` no cambie.

## Limitaciones conocidas (MVP)

- Sin multiusuario ni sincronización entre dispositivos — cada
  instalación guarda sus propios datos localmente.
- No hay control de inventario/stock, solo suma de ventas.
- El paquete `xlsx` (SheetJS) tiene una vulnerabilidad conocida
  reportada en el registro de npm; no es bloqueante para uso interno,
  pero vale la pena revisarla antes de manejar archivos de origen no
  confiable.