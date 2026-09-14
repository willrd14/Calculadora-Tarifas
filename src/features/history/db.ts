import { getDb } from "../../lib/db";
import type { QuoteFormValues } from "../quote/schema";

export const QUOTE_STATUSES = ["Enviada", "Aceptada", "Rechazada"] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export interface QuoteHistoryRecord {
  id: string;
  createdAt: string;
  clientName: string;
  clientContact: string;
  projectName: string;
  projectType: string;
  description: string;
  hourlyRate: number;
  currency: string;
  discountPercent: number;
  paymentTerms: string;
  estimatedDelivery: string;
  items: QuoteFormValues["items"];
  additionalCharges: QuoteFormValues["additionalCharges"];
  total: number;
  pdfPath: string;
  status: QuoteStatus;
}

/** Guarda una cotización recién generada en el historial. */
export async function saveQuoteToHistory(params: {
  id: string;
  quote: QuoteFormValues;
  total: number;
  pdfPath: string;
}): Promise<void> {
  const { id, quote, total, pdfPath } = params;
  const db = await getDb();
  await db.execute(
    `INSERT INTO quotes (
      id, created_at, client_name, client_contact, project_name, project_type,
      description, hourly_rate, currency, discount_percent, payment_terms,
      estimated_delivery, items_json, additional_charges_json, total, pdf_path, status
    ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [
      id,
      new Date().toISOString(),
      quote.clientName,
      quote.clientContact,
      quote.projectName,
      quote.projectType,
      quote.description,
      quote.hourlyRate,
      quote.currency,
      quote.discountPercent,
      quote.paymentTerms,
      quote.estimatedDelivery,
      JSON.stringify(quote.items),
      JSON.stringify(quote.additionalCharges),
      total,
      pdfPath,
      "Enviada" satisfies QuoteStatus,
    ],
  );
}

/** Lista el historial de cotizaciones, más recientes primero. */
export async function listQuoteHistory(): Promise<QuoteHistoryRecord[]> {
  const db = await getDb();
  const rows = await db.select<RawQuoteRow[]>(
    "SELECT * FROM quotes ORDER BY created_at DESC",
  );
  return rows.map(mapRow);
}

/** Actualiza el estado (Enviada/Aceptada/Rechazada) de una cotización. */
export async function updateQuoteStatus(
  id: string,
  status: QuoteStatus,
): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE quotes SET status = $1 WHERE id = $2", [
    status,
    id,
  ]);
}

/** Convierte un registro del historial en valores listos para precargar el formulario (duplicar). */
export function historyRecordToFormValues(
  record: QuoteHistoryRecord,
): QuoteFormValues {
  return {
    clientName: record.clientName,
    clientContact: record.clientContact,
    projectName: record.projectName,
    projectType: record.projectType as QuoteFormValues["projectType"],
    description: record.description,
    items: record.items,
    hourlyRate: record.hourlyRate,
    additionalCharges: record.additionalCharges,
    discountPercent: record.discountPercent,
    currency: record.currency as QuoteFormValues["currency"],
    paymentTerms: record.paymentTerms,
    estimatedDelivery: record.estimatedDelivery,
  };
}

interface RawQuoteRow {
  id: string;
  created_at: string;
  client_name: string;
  client_contact: string;
  project_name: string;
  project_type: string;
  description: string;
  hourly_rate: number;
  currency: string;
  discount_percent: number;
  payment_terms: string;
  estimated_delivery: string;
  items_json: string;
  additional_charges_json: string;
  total: number;
  pdf_path: string;
  status: string;
}

function mapRow(row: RawQuoteRow): QuoteHistoryRecord {
  return {
    id: row.id,
    createdAt: row.created_at,
    clientName: row.client_name,
    clientContact: row.client_contact,
    projectName: row.project_name,
    projectType: row.project_type,
    description: row.description,
    hourlyRate: row.hourly_rate,
    currency: row.currency,
    discountPercent: row.discount_percent,
    paymentTerms: row.payment_terms,
    estimatedDelivery: row.estimated_delivery,
    items: JSON.parse(row.items_json),
    additionalCharges: JSON.parse(row.additional_charges_json),
    total: row.total,
    pdfPath: row.pdf_path,
    status: row.status as QuoteStatus,
  };
}
