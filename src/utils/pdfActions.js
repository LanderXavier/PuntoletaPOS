import { isTauri, invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

/**
 * Guarda el PDF de la factura.
 * - En la app de escritorio (Tauri): abre la ventana nativa "Guardar
 *   como..." del sistema y escribe el archivo donde el usuario elija,
 *   usando un comando propio de Rust (save_bytes_to_path) en vez del
 *   plugin fs, para evitar problemas de permisos/scope con rutas
 *   elegidas por el usuario.
 * - En el navegador: dispara la descarga normal del navegador.
 *
 * Nota: los imports de arriba son estáticos a propósito (no
 * `await import(...)`). Con import dinámico, Vite separa el plugin en
 * un chunk aparte que el protocolo interno de Tauri (tauri.localhost)
 * no siempre logra cargar en tiempo de ejecución ("Failed to fetch
 * dynamically imported module"). Importar todo de forma estática lo
 * deja empaquetado en el archivo principal y evita ese problema.
 */
export async function saveInvoicePdf(doc, suggestedName) {
  if (isTauri()) {
    const path = await save({
      defaultPath: suggestedName,
      filters: [{ name: "PDF", extensions: ["pdf"] }],
    });

    if (!path) return { saved: false }; // el usuario canceló el diálogo

    const bytes = Array.from(new Uint8Array(doc.output("arraybuffer")));
    await invoke("save_bytes_to_path", { path, bytes });
    return { saved: true, path };
  }

  // Navegador: esto abre el diálogo de descarga estándar del navegador.
  doc.save(suggestedName);
  return { saved: true };
}
