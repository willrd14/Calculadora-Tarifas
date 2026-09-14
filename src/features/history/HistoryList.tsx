import { useEffect, useState } from "react";
import { formatCurrency, type Currency } from "../../lib/currency";
import type { QuoteFormValues } from "../quote/schema";
import {
  QUOTE_STATUSES,
  historyRecordToFormValues,
  listQuoteHistory,
  updateQuoteStatus,
  type QuoteHistoryRecord,
  type QuoteStatus,
} from "./db";

type LoadState =
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "ready" };

interface HistoryListProps {
  /** Se llama con los valores de una cotización pasada para precargarla como nueva. */
  onDuplicate: (values: QuoteFormValues) => void;
}

/** Listado del historial de cotizaciones: estado editable y duplicar como plantilla. */
export function HistoryList({ onDuplicate }: HistoryListProps) {
  const [records, setRecords] = useState<QuoteHistoryRecord[]>([]);
  const [state, setState] = useState<LoadState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ kind: "loading" });
    listQuoteHistory()
      .then((rows) => {
        if (cancelled) return;
        setRecords(rows);
        setState({ kind: "ready" });
      })
      .catch((error: unknown) => {
        console.error("Error cargando el historial:", error);
        if (cancelled) return;
        setState({
          kind: "error",
          message: "No se pudo cargar el historial de cotizaciones.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleStatusChange(id: string, status: QuoteStatus) {
    setRecords((prev) =>
      prev.map((record) => (record.id === id ? { ...record, status } : record)),
    );
    try {
      await updateQuoteStatus(id, status);
    } catch (error) {
      console.error("Error actualizando el estado:", error);
    }
  }

  if (state.kind === "loading") {
    return <p className="text-sm text-neutral-500">Cargando historial…</p>;
  }

  if (state.kind === "error") {
    return <p className="text-sm text-red-600">{state.message}</p>;
  }

  if (records.length === 0) {
    return (
      <p className="text-sm text-neutral-500">
        Todavía no has generado ninguna cotización.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-xs uppercase tracking-wide text-neutral-500">
            <th className="px-3 py-2 font-medium">Cliente</th>
            <th className="px-3 py-2 font-medium">Proyecto</th>
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 text-right font-medium">Total</th>
            <th className="px-3 py-2 font-medium">Estado</th>
            <th className="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr
              key={record.id}
              className="border-b border-neutral-100 last:border-0"
            >
              <td className="px-3 py-2">{record.clientName}</td>
              <td className="px-3 py-2">{record.projectName}</td>
              <td className="px-3 py-2 text-neutral-500">
                {new Date(record.createdAt).toLocaleDateString("es-DO")}
              </td>
              <td className="px-3 py-2 text-right font-medium">
                {formatCurrency(record.total, record.currency as Currency)}
              </td>
              <td className="px-3 py-2">
                <select
                  value={record.status}
                  onChange={(event) =>
                    handleStatusChange(
                      record.id,
                      event.target.value as QuoteStatus,
                    )
                  }
                  className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-xs"
                >
                  {QUOTE_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-3 py-2 text-right">
                <button
                  type="button"
                  onClick={() => onDuplicate(historyRecordToFormValues(record))}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  Duplicar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
