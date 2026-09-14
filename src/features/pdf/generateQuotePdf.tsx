import { pdf } from "@react-pdf/renderer";
import { save } from "@tauri-apps/plugin-dialog";
import { writeFile } from "@tauri-apps/plugin-fs";
import { generateQuoteNumber } from "../../lib/quoteNumber";
import { freelancerProfile } from "../settings/freelancerProfile";
import type { QuoteFormValues } from "../quote/schema";
import { QuoteDocument } from "./QuoteDocument";

/**
 * Genera el PDF de la cotización y abre el diálogo nativo de "Guardar como"
 * para que el usuario elija la carpeta local. Devuelve la ruta guardada, o
 * `null` si el usuario canceló el diálogo.
 */
export async function generateAndSaveQuotePdf(
  quote: QuoteFormValues,
): Promise<string | null> {
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

  const clientSlug = quote.clientName.trim() || "cotizacion";
  const filePath = await save({
    defaultPath: `${quoteNumber} - ${clientSlug}.pdf`,
    filters: [{ name: "PDF", extensions: ["pdf"] }],
  });

  if (!filePath) {
    return null;
  }

  const bytes = new Uint8Array(await blob.arrayBuffer());
  await writeFile(filePath, bytes);

  return filePath;
}
