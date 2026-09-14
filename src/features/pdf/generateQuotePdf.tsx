import { pdf } from "@react-pdf/renderer";
import { documentDir, join } from "@tauri-apps/api/path";
import { exists, mkdir, writeFile } from "@tauri-apps/plugin-fs";
import { calculateQuote } from "../../lib/calculate";
import { generateQuoteNumber } from "../../lib/quoteNumber";
import { freelancerProfile } from "../settings/freelancerProfile";
import type { QuoteFormValues } from "../quote/schema";
import { QuoteDocument } from "./QuoteDocument";

/** Subcarpeta dentro de "Documentos" donde se guarda cada cotización. */
const QUOTES_SUBFOLDER = "Cotizaciones";

/** Reemplaza caracteres inválidos en nombres de archivo de Windows. */
function sanitizeFileNamePart(value: string): string {
  const cleaned = value.trim().replace(/[\\/:*?"<>|]+/g, "-");
  return cleaned || "cotizacion";
}

export interface GeneratedQuotePdf {
  /** Ruta completa del PDF guardado. */
  path: string;
  /** Número de cotización usado en el PDF — también sirve como id del historial. */
  quoteNumber: string;
  /** Total calculado, para guardarlo en el historial sin recalcularlo aparte. */
  total: number;
}

/**
 * Genera el PDF de la cotización y lo guarda en `Documentos/Cotizaciones`
 * (crea la carpeta si no existe).
 */
export async function generateAndSaveQuotePdf(
  quote: QuoteFormValues,
): Promise<GeneratedQuotePdf> {
  const date = new Date();
  const quoteNumber = generateQuoteNumber(date);

  const blob = await pdf(
    <QuoteDocument
      quote={quote}
      freelancer={freelancerProfile}
      quoteNumber={quoteNumber}
      date={date}
    />,
  ).toBlob();

  const quotesDir = await join(await documentDir(), QUOTES_SUBFOLDER);
  if (!(await exists(quotesDir))) {
    await mkdir(quotesDir, { recursive: true });
  }

  const fileName = `${quoteNumber} - ${sanitizeFileNamePart(quote.clientName)}.pdf`;
  const filePath = await join(quotesDir, fileName);

  const bytes = new Uint8Array(await blob.arrayBuffer());
  await writeFile(filePath, bytes);

  const { total } = calculateQuote({
    items: quote.items,
    hourlyRate: quote.hourlyRate,
    additionalCharges: quote.additionalCharges,
    discountPercent: quote.discountPercent,
  });

  return { path: filePath, quoteNumber, total };
}
