mod commands;
mod db;
mod models;

use db::{open_connection, run_migrations};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Run migrations on startup
    let conn = open_connection().expect("Failed to open database");
    run_migrations(&conn).expect("Failed to run migrations");
    drop(conn);

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            commands::list_entries,
            commands::get_entry,
            commands::create_entry,
            commands::update_entry,
            commands::delete_entry,
            commands::upsert_code_block,
            commands::delete_code_block,
            commands::upsert_parameter,
            commands::delete_parameter,
            commands::list_tags,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
