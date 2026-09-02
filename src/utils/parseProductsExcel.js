import * as XLSX from "xlsx";

// Alias aceptados por columna (en minúsculas, sin tildes) para que el
// import funcione aunque el Excel del usuario no use el header exacto.
const HEADER_ALIASES = {
  name: ["nombre", "producto", "descripcion", "detalle"],
  pvp: ["pvp", "precio de venta", "precio venta", "precio de venta al publico"],
  pvc: ["pvc", "precio de compra", "precio compra", "costo"],
  source: ["donde compro", "dónde compró", "proveedor", "comprado en"],
  category: ["categoria", "categoría"],
};

function normalizeHeader(h) {
  return String(h ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // quita tildes
}

function matchField(header) {
  const norm = normalizeHeader(header);
  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    if (aliases.some((alias) => normalizeHeader(alias) === norm)) {
      return field;
    }
  }
  return null;
}

function toNumber(value) {
  if (typeof value === "number") return value;
  const parsed = parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Lee un archivo .xlsx/.xls/.csv y devuelve un arreglo de productos
 * normalizados: { name, pvp, pvc, source, category }.
 * Filas sin nombre o sin PVP se descartan.
 */
export async function parseProductsExcel(file) {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rows.length === 0) return [];

  // Construye el mapa header original -> campo normalizado usando la
  // primera fila de datos como referencia de las claves del objeto.
  const sampleKeys = Object.keys(rows[0]);
  const fieldByKey = {};
  sampleKeys.forEach((key) => {
    const field = matchField(key);
    if (field) fieldByKey[key] = field;
  });

  const products = rows
    .map((row) => {
      const product = { name: "", pvp: 0, pvc: 0, source: "", category: "Importado" };
      Object.entries(row).forEach(([key, value]) => {
        const field = fieldByKey[key];
        if (!field) return;
        if (field === "pvp" || field === "pvc") {
          product[field] = toNumber(value);
        } else {
          product[field] = String(value ?? "").trim();
        }
      });
      return product;
    })
    .filter((p) => p.name && p.pvp > 0);

  return products;
}
