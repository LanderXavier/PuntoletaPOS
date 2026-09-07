import * as XLSX from "xlsx";
import { isTauri, invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";

/**
 * Exporta el catálogo de productos actual a un archivo .xlsx, con las
 * mismas columnas que reconoce la importación (parseProductsExcel.js),
 * para poder usarlo como respaldo o volver a importarlo después.
 *
 * - En la app de escritorio (Tauri): abre el diálogo nativo "Guardar
 *   como..." para elegir dónde guardarlo.
 * - En el navegador: dispara la descarga estándar.
 */
export async function exportProductsToExcel(products, suggestedName = "productos-respaldo.xlsx") {
  const rows = products.map((p) => ({
    Nombre: p.name,
    Categoría: p.category,
    PVP: p.pvp,
    PVC: p.pvc,
    "Dónde compró": p.source || "",
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 32 }, { wch: 16 }, { wch: 10 }, { wch: 10 }, { wch: 22 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Productos");

  if (isTauri()) {
    const path = await save({
      defaultPath: suggestedName,
      filters: [{ name: "Excel", extensions: ["xlsx"] }],
    });
    if (!path) return { saved: false }; // el usuario canceló el diálogo

    const arrayBuffer = XLSX.write(workbook, { type: "array", bookType: "xlsx" });
    const bytes = Array.from(new Uint8Array(arrayBuffer));
    await invoke("save_bytes_to_path", { path, bytes });
    return { saved: true, path };
  }

  // Navegador: esto abre el diálogo de descarga estándar.
  XLSX.writeFile(workbook, suggestedName);
  return { saved: true };
}
