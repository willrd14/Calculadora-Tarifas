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
    <aside className="h-fit overflow-hidden rounded border border-line bg-panel lg:sticky lg:top-6">
      <div className="h-1 bg-accent" />
      <div className="p-5">
        <p className="font-mono text-xs uppercase tracking-wide text-ink-faint">
          Vista previa
        </p>

        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Horas totales" value={result.totalHours.toString()} />
          <Row
            label="Subtotal ítems"
            value={formatCurrency(result.itemsSubtotal, currency)}
          />
          <Row
            label="Cargos adicionales"
            value={formatCurrency(result.additionalChargesTotal, currency)}
          />
          <Row
            label="Subtotal"
            value={formatCurrency(result.subtotal, currency)}
          />
          <Row
            label={`Descuento (${Number(discountPercent) || 0}%)`}
            value={`− ${formatCurrency(result.discountAmount, currency)}`}
          />
        </dl>

        <div className="mt-4 border-t border-line pt-4">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-semibold uppercase tracking-wide text-ink">
              Total
            </span>
            <span className="font-display text-3xl font-bold text-accent">
              {formatCurrency(result.total, currency)}
            </span>
          </div>
          <p className="mt-1 text-right font-mono text-xs text-ink-faint">
            {currency}
          </p>
        </div>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-soft">
      <span>{label}</span>
      <span className="font-mono text-ink">{value}</span>
    </div>
  );
}
