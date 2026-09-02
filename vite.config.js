import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ajustes recomendados para que Tauri controle la ventana de desarrollo
  // sin pelearse con el propio dev server de Vite.
  clearScreen: false,
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Evita que Vite intente vigilar los archivos que genera el
      // compilador de Rust (src-tauri/target). En Windows esos archivos
      // quedan bloqueados mientras se compilan y Vite revienta con
      // "EBUSY: resource busy or locked".
      ignored: ["**/src-tauri/**"],
    },
  },
})
