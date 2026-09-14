import { useFormContext, useWatch } from "react-hook-form";
import { calculateQuote } from "../lib/calculate";
import { formatCurrency } from "../lib/currency";
import type { QuoteFormInput } from "../features/quote/schema";

/** Desglose en tiempo real (subtotal, cargos, descuento y total) mientras se llena el formulario. */
export function QuotePreview() {
  const { control } = useFormContext<QuoteFormInput>();
  const items = useWatch({ control, name: "items" });
  const hourlyRate = useWatch({ control, name: "hourlyRate" });
  const additionalCharges = useWatch({ control, name: "additionalCharges" });
  const discountPercent = useWatch({ control, name: "discountPercent" });
  const currency = useWatch({ control, name: "currency" });

  const result = calculateQuote({
    items: (items ?? []).map((item) => ({ hours: Number(item?.hours) || 0 })),
    hourlyRate: Number(hourlyRate) || 0,
    additionalCharges: (additionalCharges ?? []).map((charge) => ({
      amount: Number(charge?.amount) || 0,
    })),
    discountPercent: Number(discountPercent) || 0,
  });

  return (
    <aside className="h-fit rounded-lg border border-neutral-200 bg-white p-4 shadow-sm lg:sticky lg:top-4">
      <h2 className="text-sm font-semibold text-neutral-700">Vista previa</h2>

      <dl className="mt-3 space-y-2 text-sm">
        <Row label="Horas totales" value={result.totalHours.toString()} />
        <Row
          label="Subtotal ítems"
          value={formatCurrency(result.itemsSubtotal, currency)}
        />
        <Row
          label="Cargos adicionales"
          value={formatCurrency(result.additionalChargesTotal, currency)}
        />
        <Row label="Subtotal" value={formatCurrency(result.subtotal, currency)} />
        <Row
          label={`Descuento (${Number(discountPercent) || 0}%)`}
          value={`− ${formatCurrency(result.discountAmount, currency)}`}
        />
      </dl>

      <div className="mt-3 flex items-center justify-between border-t border-neutral-200 pt-3">
        <span className="text-sm font-semibold text-neutral-700">Total</span>
        <span className="text-lg font-bold text-neutral-900">
          {formatCurrency(result.total, currency)}
        </span>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-neutral-600">
      <span>{label}</span>
      <span className="font-medium text-neutral-800">{value}</span>
    </div>
  );
}
