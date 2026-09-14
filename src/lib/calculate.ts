export interface QuoteItemCalcInput {
  hours: number;
}

export interface AdditionalChargeCalcInput {
  amount: number;
}

export interface QuoteCalculationInput {
  items: QuoteItemCalcInput[];
  hourlyRate: number;
  additionalCharges: AdditionalChargeCalcInput[];
  discountPercent: number;
}

export interface QuoteCalculationResult {
  totalHours: number;
  itemsSubtotal: number;
  additionalChargesTotal: number;
  /** Subtotal antes de descuento (ítems + cargos adicionales). */
  subtotal: number;
  discountAmount: number;
  total: number;
}

/**
 * Cálculo del desglose de una cotización.
 * Subtotal = Σ(horas × tarifa/hora) + cargos adicionales; total = subtotal − descuento.
 */
export function calculateQuote(
  input: QuoteCalculationInput,
): QuoteCalculationResult {
  const totalHours = sum(input.items.map((item) => item.hours));
  const itemsSubtotal = totalHours * safeNumber(input.hourlyRate);
  const additionalChargesTotal = sum(
    input.additionalCharges.map((charge) => charge.amount),
  );
  const subtotal = itemsSubtotal + additionalChargesTotal;
  const discountAmount = subtotal * (safeNumber(input.discountPercent) / 100);
  const total = subtotal - discountAmount;

  return {
    totalHours,
    itemsSubtotal,
    additionalChargesTotal,
    subtotal,
    discountAmount,
    total,
  };
}

function safeNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + safeNumber(value), 0);
}
