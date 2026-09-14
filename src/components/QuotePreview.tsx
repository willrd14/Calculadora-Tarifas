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
    <aside className="h-fit rounded border border-border bg-surface p-5 lg:sticky lg:top-6">
      <p className="text-xs text-text-faint">
        <span className="text-accent">// </span>vista previa
      </p>

      <dl className="mt-4 space-y-2 text-sm">
        <Row label="horas_totales" value={result.totalHours.toString()} />
        <Row
          label="subtotal_items"
          value={formatCurrency(result.itemsSubtotal, currency)}
        />
        <Row
          label="cargos_adicionales"
          value={formatCurrency(result.additionalChargesTotal, currency)}
        />
        <Row
          label="subtotal"
          value={formatCurrency(result.subtotal, currency)}
        />
        <Row
          label={`descuento (${Number(discountPercent) || 0}%)`}
          value={`− ${formatCurrency(result.discountAmount, currency)}`}
        />
      </dl>

      {/* La pantalla de una calculadora: el número que de verdad importa,
          en su propio panel oscuro, como un display LED/LCD. */}
      <div className="mt-4 rounded border border-accent-soft bg-well p-4">
        <p className="text-xs text-text-faint">total</p>
        <p className="mt-1 overflow-x-auto text-3xl font-bold text-accent [text-shadow:0_0_18px_var(--color-accent-soft)]">
          {formatCurrency(result.total, currency)}
        </p>
        <p className="mt-1 text-xs text-text-faint">{currency}</p>
      </div>
    </aside>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-text-soft">
      <span>{label}</span>
      <span className="text-text">{value}</span>
    </div>
  );
}
