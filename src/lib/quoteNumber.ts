/**
 * Genera un número de cotización simple a partir de la fecha/hora actual
 * (ej. `COT-20260914-143205`). No hay persistencia/historial todavía
 * (Fase 3), así que no es un consecutivo real — incluye segundos para que
 * dos cotizaciones generadas en el mismo minuto no choquen de nombre.
 */
export function generateQuoteNumber(date: Date = new Date()): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  return `COT-${datePart}-${timePart}`;
}
