import { getDb } from "../../lib/db";
import type { Currency } from "../../lib/currency";
import type { SettingsFormValues } from "./schema";

/** Fila fija (siempre "default") de la tabla `settings` — un solo usuario, sin cuentas. */
const SETTINGS_ROW_ID = "default";

export interface FreelancerProfile {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  portfolio: string;
  handle: string;
}

export type AppSettings = SettingsFormValues;

interface RawSettingsRow {
  hourly_rate: number;
  currency: string;
  exchange_rate_dop_per_usd: number;
  freelancer_name: string;
  freelancer_tagline: string;
  freelancer_email: string;
  freelancer_phone: string;
  freelancer_portfolio: string;
  freelancer_handle: string;
}

/** Lee la configuración guardada (tarifa/moneda por defecto + datos del freelancer). */
export async function getSettings(): Promise<AppSettings> {
  const db = await getDb();
  const rows = await db.select<RawSettingsRow[]>(
    "SELECT * FROM settings WHERE id = $1",
    [SETTINGS_ROW_ID],
  );
  const row = rows[0];
  if (!row) {
    throw new Error("No se encontró la fila de configuración en la base de datos.");
  }
  return {
    hourlyRate: row.hourly_rate,
    currency: row.currency as Currency,
    exchangeRateDopPerUsd: row.exchange_rate_dop_per_usd,
    freelancerName: row.freelancer_name,
    freelancerTagline: row.freelancer_tagline,
    freelancerEmail: row.freelancer_email,
    freelancerPhone: row.freelancer_phone,
    freelancerPortfolio: row.freelancer_portfolio,
    freelancerHandle: row.freelancer_handle,
  };
}

/** Guarda la configuración editada desde la pantalla de Configuración. */
export async function saveSettings(settings: AppSettings): Promise<void> {
  const db = await getDb();
  await db.execute(
    `UPDATE settings SET
      hourly_rate = $1,
      currency = $2,
      exchange_rate_dop_per_usd = $3,
      freelancer_name = $4,
      freelancer_tagline = $5,
      freelancer_email = $6,
      freelancer_phone = $7,
      freelancer_portfolio = $8,
      freelancer_handle = $9
    WHERE id = $10`,
    [
      settings.hourlyRate,
      settings.currency,
      settings.exchangeRateDopPerUsd,
      settings.freelancerName,
      settings.freelancerTagline,
      settings.freelancerEmail,
      settings.freelancerPhone,
      settings.freelancerPortfolio,
      settings.freelancerHandle,
      SETTINGS_ROW_ID,
    ],
  );
}

/** Datos del freelancer, en el shape que espera `QuoteDocument` para el PDF. */
export function settingsToFreelancerProfile(
  settings: AppSettings,
): FreelancerProfile {
  return {
    name: settings.freelancerName,
    tagline: settings.freelancerTagline,
    email: settings.freelancerEmail,
    phone: settings.freelancerPhone,
    portfolio: settings.freelancerPortfolio,
    handle: settings.freelancerHandle,
  };
}
