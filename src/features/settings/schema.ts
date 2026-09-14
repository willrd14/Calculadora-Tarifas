import { z } from "zod";

export const settingsFormSchema = z.object({
  hourlyRate: z.coerce.number().min(0, "No puede ser negativo"),
  currency: z.enum(["DOP", "USD"]),
  freelancerName: z.string().min(1, "Ingresa tu nombre"),
  freelancerTagline: z.string(),
  freelancerEmail: z.string(),
  freelancerPhone: z.string(),
  freelancerPortfolio: z.string(),
  freelancerHandle: z.string(),
});

// Igual que en features/quote/schema.ts: z.coerce.number() hace que el tipo
// de entrada (lo que RHF maneja mientras se escribe) difiera del de salida
// (lo que llega a onSubmit ya validado).
export type SettingsFormValues = z.output<typeof settingsFormSchema>;
export type SettingsFormInput = z.input<typeof settingsFormSchema>;
