import { z } from "zod";
import type { Currency } from "../../lib/currency";

export const PROJECT_TYPES = [
  "Web",
  "Escritorio",
  "Web + Escritorio",
  "Otro",
] as const;
export type ProjectType = (typeof PROJECT_TYPES)[number];

export const CURRENCIES: readonly Currency[] = ["DOP", "USD"] as const;

export const COMPLEXITY_LEVELS = ["Personalizado", "Baja", "Media", "Alta"] as const;
export type ComplexityLevel = (typeof COMPLEXITY_LEVELS)[number];

/** Horas sugeridas por nivel de complejidad; el usuario puede editarlas luego. */
export const COMPLEXITY_HOURS: Record<
  Exclude<ComplexityLevel, "Personalizado">,
  number
> = {
  Baja: 4,
  Media: 10,
  Alta: 20,
};

export const DEFAULT_HOURLY_RATE = 25;
export const DEFAULT_CURRENCY: Currency = "USD";

export const quoteItemSchema = z.object({
  name: z.string().min(1, "Ingresa un nombre"),
  complexity: z.enum(COMPLEXITY_LEVELS),
  hours: z.coerce.number().min(0.25, "Debe ser mayor a 0"),
});

export const additionalChargeSchema = z.object({
  name: z.string().min(1, "Ingresa un nombre"),
  amount: z.coerce.number().min(0, "No puede ser negativo"),
});

export const quoteFormSchema = z.object({
  clientName: z.string().min(1, "Ingresa el cliente o proyecto"),
  projectType: z.enum(PROJECT_TYPES),
  description: z.string(),
  items: z.array(quoteItemSchema).min(1, "Agrega al menos una funcionalidad"),
  hourlyRate: z.coerce.number().min(0, "No puede ser negativo"),
  additionalCharges: z.array(additionalChargeSchema),
  discountPercent: z.coerce.number().min(0, "No puede ser negativo").max(100, "Máximo 100%"),
  currency: z.enum(["DOP", "USD"]),
});

// z.coerce.number() makes the schema's input type differ from its output type
// (input: unknown, output: number) — react-hook-form needs both: `QuoteFormInput`
// is what the form fields hold before validation, `QuoteFormValues` is what
// `onSubmit` receives after `zodResolver` parses it.
export type QuoteFormValues = z.output<typeof quoteFormSchema>;
export type QuoteFormInput = z.input<typeof quoteFormSchema>;

export const emptyQuoteItem: QuoteFormValues["items"][number] = {
  name: "",
  complexity: "Personalizado",
  hours: 1,
};

export const emptyAdditionalCharge: QuoteFormValues["additionalCharges"][number] =
  {
    name: "",
    amount: 0,
  };

export const defaultQuoteFormValues: QuoteFormInput = {
  clientName: "",
  projectType: "Web",
  description: "",
  items: [emptyQuoteItem],
  hourlyRate: DEFAULT_HOURLY_RATE,
  additionalCharges: [],
  discountPercent: 0,
  currency: DEFAULT_CURRENCY,
};
