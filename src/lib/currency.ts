export type Currency = "DOP" | "USD";

const CURRENCY_LOCALE: Record<Currency, string> = {
  DOP: "es-DO",
  USD: "en-US",
};

/** Formatea un monto como moneda (DOP o USD) para mostrar en la UI/PDF. */
export function formatCurrency(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
