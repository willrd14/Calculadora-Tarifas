use tauri_plugin_sql::{Migration, MigrationKind};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
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
        },
        Migration {
            version: 2,
            description: "create_settings_table",
            // Fila única ("default") — app de un solo usuario, sin cuentas.
            // Se siembra con los valores que antes estaban fijos en el
            // código (DEFAULT_HOURLY_RATE/DEFAULT_CURRENCY en
            // features/quote/schema.ts y features/settings/freelancerProfile.ts)
            // para no perder los datos que Williams ya había cargado.
            sql: "CREATE TABLE settings (
                id TEXT PRIMARY KEY,
                hourly_rate REAL NOT NULL,
                currency TEXT NOT NULL,
                freelancer_name TEXT NOT NULL,
                freelancer_tagline TEXT NOT NULL,
                freelancer_email TEXT NOT NULL,
                freelancer_phone TEXT NOT NULL,
                freelancer_portfolio TEXT NOT NULL,
                freelancer_handle TEXT NOT NULL
            );
            INSERT INTO settings (
                id, hourly_rate, currency, freelancer_name, freelancer_tagline,
                freelancer_email, freelancer_phone, freelancer_portfolio, freelancer_handle
            ) VALUES (
                'default', 25, 'USD', 'Williams Rafael Villavizar Hernandez',
                'Desarrollo de software freelance', 'williamsvillavizar204@gmail.com',
                '849-653-1360', 'portafolio.w-tech.uk', 'willrd14'
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 3,
            description: "create_clients_table",
            // Nombre único por cliente: cotizar de nuevo para el mismo
            // cliente actualiza su contacto en vez de duplicar la fila.
            sql: "CREATE TABLE clients (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL UNIQUE,
                contact TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL
            );",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 4,
            description: "add_complexity_multipliers_to_quotes",
            // Ids de COMPLEXITY_MULTIPLIERS marcados (Kubernetes, compliance,
            // rush, etc.), serializados como JSON igual que items_json.
            // DEFAULT '[]' para que las filas existentes no queden NULL.
            sql: "ALTER TABLE quotes ADD COLUMN complexity_multiplier_ids_json TEXT NOT NULL DEFAULT '[]';",
            kind: MigrationKind::Up,
        },
        Migration {
            version: 5,
            description: "add_exchange_rate_to_settings",
            // Cuántos DOP equivalen a 1 USD — para convertir la tarifa por
            // hora al cambiar de moneda en el formulario. Default = el
            // ejemplo que dio Williams (1470.75 DOP == 25 USD).
            sql: "ALTER TABLE settings ADD COLUMN exchange_rate_dop_per_usd REAL NOT NULL DEFAULT 58.83;",
            kind: MigrationKind::Up,
        },
    ];

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
