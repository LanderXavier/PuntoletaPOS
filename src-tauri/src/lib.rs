/// Escribe bytes en una ruta absoluta. Es un comando de la propia app
/// (no de un plugin), así que no depende del sistema de "scopes" de
/// tauri-plugin-fs, que suele bloquear rutas elegidas por el usuario
/// desde el diálogo nativo si el scope no coincide exactamente.
/// La ruta siempre viene del diálogo "Guardar como..." del sistema,
/// nunca la decide la app por su cuenta.
#[tauri::command]
fn save_bytes_to_path(path: String, bytes: Vec<u8>) -> Result<(), String> {
  std::fs::write(&path, bytes).map_err(|e| format!("No se pudo escribir el archivo: {e}"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![save_bytes_to_path])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
