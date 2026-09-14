use tauri_plugin_sql::{Migration, MigrationKind};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![Migration {
        version: 1,
        description: "create_quotes_table",
        sql: "CREATE TABLE quotes (
            id TEXT PRIMARY KEY,
            created_at TEXT NOT NULL,
            client_name TEXT NOT NULL,
            client_contact TEXT NOT NULL,
            project_name TEXT NOT NULL,
            project_type TEXT NOT NULL,
            description TEXT NOT NULL,
            hourly_rate REAL NOT NULL,
            currency TEXT NOT NULL,
            discount_percent REAL NOT NULL,
            payment_terms TEXT NOT NULL,
            estimated_delivery TEXT NOT NULL,
            items_json TEXT NOT NULL,
            additional_charges_json TEXT NOT NULL,
            total REAL NOT NULL,
            pdf_path TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'Enviada'
        );",
        kind: MigrationKind::Up,
    }];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:cotizaciones.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
