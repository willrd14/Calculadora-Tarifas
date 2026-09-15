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
  /** Suma de los % de los multiplicadores de complejidad marcados (ej. 15 + 20 = 35). */
  complexityMultiplierPercent?: number;
}

export interface QuoteCalculationResult {
  totalHours: number;
  /** Horas × tarifa, antes de aplicar los multiplicadores de complejidad. */
  laborSubtotal: number;
  /** Monto que suman los multiplicadores de complejidad sobre `laborSubtotal`. */
  complexityAmount: number;
  /** Horas × tarifa ya con los multiplicadores de complejidad aplicados. */
  itemsSubtotal: number;
  additionalChargesTotal: number;
  /** Subtotal antes de descuento (ítems con multiplicadores + cargos adicionales). */
  subtotal: number;
  discountAmount: number;
  total: number;
}

/**
 * Cálculo del desglose de una cotización.
 * laborSubtotal = Σ(horas × tarifa/hora); itemsSubtotal = laborSubtotal ×
 * (1 + % multiplicadores de complejidad); subtotal = itemsSubtotal + cargos
 * adicionales; total = subtotal − descuento.
 */
export function calculateQuote(
  input: QuoteCalculationInput,
): QuoteCalculationResult {
  const totalHours = sum(input.items.map((item) => item.hours));
  const laborSubtotal = totalHours * safeNumber(input.hourlyRate);
  const complexityAmount =
    laborSubtotal * (safeNumber(input.complexityMultiplierPercent) / 100);
  const itemsSubtotal = laborSubtotal + complexityAmount;
  const additionalChargesTotal = sum(
    input.additionalCharges.map((charge) => charge.amount),
  );
  const subtotal = itemsSubtotal + additionalChargesTotal;
  const discountAmount = subtotal * (safeNumber(input.discountPercent) / 100);
  const total = subtotal - discountAmount;

  return {
    totalHours,
    laborSubtotal,
    complexityAmount,
    itemsSubtotal,
    additionalChargesTotal,
    subtotal,
    discountAmount,
    total,
  };
}

function safeNumber(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + safeNumber(value), 0);
}
