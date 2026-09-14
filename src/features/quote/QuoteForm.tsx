import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CURRENCIES,
  PROJECT_TYPES,
  defaultQuoteFormValues,
  quoteFormSchema,
  type QuoteFormInput,
  type QuoteFormValues,
} from "./schema";
import { FormField, inputClassName } from "../../components/FormField";
import { QuoteItemsField } from "../../components/QuoteItemsField";
import { AdditionalChargesField } from "../../components/AdditionalChargesField";
import { QuotePreview } from "../../components/QuotePreview";

/**
 * Formulario de cotización: datos del proyecto, ítems, tarifa, cargos
 * adicionales y descuento, con vista previa del total en tiempo real.
 * La exportación a PDF (Fase 2) todavía no está conectada al submit.
 */
export function QuoteForm() {
  const form = useForm<QuoteFormInput, unknown, QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: defaultQuoteFormValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  function onSubmit(values: QuoteFormValues) {
    // TODO(Fase 2): generar el PDF a partir de `values` en vez de loguear.
    console.log("Cotización lista:", values);
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-6">
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              label="Cliente / Proyecto"
              htmlFor="clientName"
              error={errors.clientName?.message}
            >
              <input
                id="clientName"
                className={inputClassName}
                placeholder="Ej. Acme Corp — App de inventario"
                {...register("clientName")}
              />
            </FormField>

            <FormField label="Tipo de proyecto" htmlFor="projectType">
              <select
                id="projectType"
                className={inputClassName}
                {...register("projectType")}
              >
                {PROJECT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Descripción del alcance"
              htmlFor="description"
              className="sm:col-span-2"
            >
              <textarea
                id="description"
                rows={3}
                className={inputClassName}
                placeholder="Breve resumen del alcance del proyecto"
                {...register("description")}
              />
            </FormField>
          </section>

          <QuoteItemsField />

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <FormField
              label="Tarifa por hora"
              htmlFor="hourlyRate"
              error={errors.hourlyRate?.message}
            >
              <input
                id="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                className={inputClassName}
                {...register("hourlyRate")}
              />
            </FormField>

            <FormField label="Moneda" htmlFor="currency">
              <select
                id="currency"
                className={inputClassName}
                {...register("currency")}
              >
                {CURRENCIES.map((currency) => (
                  <option key={currency} value={currency}>
                    {currency}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Descuento (%)"
              htmlFor="discountPercent"
              error={errors.discountPercent?.message}
            >
              <input
                id="discountPercent"
                type="number"
                step="1"
                min="0"
                max="100"
                className={inputClassName}
                {...register("discountPercent")}
              />
            </FormField>
          </section>

          <AdditionalChargesField />

          <button
            type="submit"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
          >
            Continuar
          </button>
        </div>

        <QuotePreview />
      </form>
    </FormProvider>
  );
}
