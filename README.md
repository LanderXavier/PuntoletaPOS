
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