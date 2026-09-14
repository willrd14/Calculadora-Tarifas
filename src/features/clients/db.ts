import { getDb } from "../../lib/db";

export interface Client {
  id: string;
  name: string;
  contact: string;
  createdAt: string;
}

interface RawClientRow {
  id: string;
  name: string;
  contact: string;
  created_at: string;
}

function mapRow(row: RawClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    createdAt: row.created_at,
  };
}

/** Lista los clientes guardados, ordenados por nombre. */
export async function listClients(): Promise<Client[]> {
  const db = await getDb();
  const rows = await db.select<RawClientRow[]>(
    "SELECT * FROM clients ORDER BY name COLLATE NOCASE ASC",
  );
  return rows.map(mapRow);
}

/**
 * Crea el cliente si el nombre no existe, o actualiza su contacto si ya
 * existe. Se llama automáticamente al generar una cotización, para que la
 * próxima vez que ese cliente pida un proyecto ya esté guardado — y si el
 * contacto cambió, queda al día sin duplicar la fila.
 */
export async function upsertClientByName(
  name: string,
  contact: string,
): Promise<void> {
  const trimmedName = name.trim();
  if (!trimmedName) return;

  const db = await getDb();
  const existing = await db.select<{ id: string }[]>(
    "SELECT id FROM clients WHERE name = $1",
    [trimmedName],
  );

  if (existing[0]) {
    await db.execute("UPDATE clients SET contact = $1 WHERE id = $2", [
      contact,
      existing[0].id,
    ]);
    return;
  }

  await db.execute(
    "INSERT INTO clients (id, name, contact, created_at) VALUES ($1, $2, $3, $4)",
    [crypto.randomUUID(), trimmedName, contact, new Date().toISOString()],
  );
}

/** Agrega un cliente manualmente desde la pantalla de Clientes. */
export async function addClient(name: string, contact: string): Promise<void> {
  return upsertClientByName(name, contact);
}

export async function deleteClient(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM clients WHERE id = $1", [id]);
}
