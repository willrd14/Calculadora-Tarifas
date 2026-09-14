import { useEffect, useState, type FormEvent } from "react";
import { FormField, inputClassName } from "../../components/FormField";
import { addClient, deleteClient, listClients, type Client } from "./db";

type LoadState =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "error"; message: string };

/**
 * Clientes guardados: nombre + contacto, reutilizables al armar una nueva
 * cotización sin volver a escribirlos. También se guardan/actualizan solos
 * cada vez que se genera un PDF (ver `clients/db.ts`); esta pantalla es
 * para verlos, agregar uno a mano, o borrar alguno.
 */
export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [state, setState] = useState<LoadState>({ kind: "loading" });
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [saving, setSaving] = useState(false);

  async function refresh() {
    try {
      const rows = await listClients();
      setClients(rows);
      setState({ kind: "ready" });
    } catch (error) {
      console.error("Error cargando clientes:", error);
      setState({
        kind: "error",
        message: "No se pudo cargar la lista de clientes.",
      });
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function handleAdd(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await addClient(name, contact);
      setName("");
      setContact("");
      await refresh();
    } catch (error) {
      console.error("Error guardando el cliente:", error);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteClient(id);
      await refresh();
    } catch (error) {
      console.error("Error eliminando el cliente:", error);
    }
  }

  if (state.kind === "loading") {
    return <p className="text-sm text-text-soft">Cargando clientes…</p>;
  }

  if (state.kind === "error") {
    return <p className="text-sm text-danger">{state.message}</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <form
        onSubmit={handleAdd}
        className="grid grid-cols-1 gap-4 rounded border border-border bg-well p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <FormField label="Nombre / Empresa" htmlFor="newClientName">
          <input
            id="newClientName"
            className={inputClassName}
            placeholder="Ej. Acme Corp"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </FormField>

        <FormField label="Contacto" htmlFor="newClientContact">
          <input
            id="newClientContact"
            className={inputClassName}
            placeholder="Email o teléfono"
            value={contact}
            onChange={(event) => setContact(event.target.value)}
          />
        </FormField>

        <button
          type="submit"
          disabled={saving || !name.trim()}
          className="rounded bg-accent px-4 py-2 text-sm font-medium text-accent-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Agregar
        </button>
      </form>

      {clients.length === 0 ? (
        <p className="text-sm text-text-soft">
          Todavía no tienes clientes guardados — se agregan solos cada vez
          que generas una cotización.
        </p>
      ) : (
        <div className="overflow-x-auto rounded border border-border bg-well">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface text-left font-mono text-xs uppercase tracking-wide text-text-faint">
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">{client.name}</td>
                  <td className="px-4 py-3 text-text-soft">
                    {client.contact || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(client.id)}
                      className="text-sm text-danger hover:opacity-75"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
