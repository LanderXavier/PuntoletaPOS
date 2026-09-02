/**
 * Carga una imagen (data URL) y devuelve sus dimensiones naturales.
 * Se usa para incrustar el logo en el PDF respetando su proporción.
 */
export function loadImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

/**
 * Lee un archivo de imagen subido por el usuario, lo reduce a un
 * tamaño razonable (para no inflar localStorage con fotos de varios
 * MB) y devuelve un data URL JPEG listo para guardar en Ajustes.
 *
 * @param {File} file
 * @param {number} maxDimension - lado máximo en píxeles (por defecto 320)
 */
export function resizeImageToDataUrl(file, maxDimension = 320) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));
        const width = Math.max(1, Math.round(img.naturalWidth * scale));
        const height = Math.max(1, Math.round(img.naturalHeight * scale));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // JPEG a buena calidad: mantiene el logo liviano en localStorage.
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
