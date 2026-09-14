/** Suma días a una fecha sin mutarla. */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/** Formatea una fecha como DD/MM/AAAA. */
export function formatDateDMY(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}
