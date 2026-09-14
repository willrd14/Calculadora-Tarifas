import Database from "@tauri-apps/plugin-sql";

const DB_URL = "sqlite:cotizaciones.db";

let dbPromise: Promise<Database> | null = null;

/** Conexión compartida a la base de datos local (historial + configuración). */
export function getDb(): Promise<Database> {
  if (!dbPromise) {
    dbPromise = Database.load(DB_URL);
  }
  return dbPromise;
}
