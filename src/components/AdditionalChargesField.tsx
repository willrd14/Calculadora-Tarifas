import { useFieldArray, useFormContext } from "react-hook-form";
import {
  emptyAdditionalCharge,
  type QuoteFormInput,
} from "../features/quote/schema";
import { FormField, SectionHeading, inputClassName } from "./FormField";

/** Lista dinámica de cargos adicionales opcionales (diseño UI, despliegue, urgencia, etc.). */
export function AdditionalChargesField() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<QuoteFormInput>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "additionalCharges",
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionHeading>Cargos adicionales (opcional)</SectionHeading>
        <button
          type="button"
          onClick={() => append(emptyAdditionalCharge)}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-text hover:border-accent hover:text-accent"
        >
          + Agregar
        </button>
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-text-faint">Sin cargos adicionales.</p>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-2 rounded border border-border bg-well p-4 sm:grid-cols-[1fr_auto_auto] sm:items-start"
          >
            <FormField
              label="Concepto"
              htmlFor={`additionalCharges.${index}.name`}
              error={errors.additionalCharges?.[index]?.name?.message}
            >
              <input
                id={`additionalCharges.${index}.name`}
                className={inputClassName}
                placeholder="Ej. Diseño UI"
                {...register(`additionalCharges.${index}.name`)}
              />
            </FormField>

            <FormField
              label="Monto"
              htmlFor={`additionalCharges.${index}.amount`}
              error={errors.additionalCharges?.[index]?.amount?.message}
            >
              <input
                id={`additionalCharges.${index}.amount`}
                type="number"
                step="0.01"
                min="0"
                className={`${inputClassName} font-mono`}
                {...register(`additionalCharges.${index}.amount`)}
              />
            </FormField>

            <button
              type="button"
              onClick={() => remove(index)}
              className="text-sm text-danger hover:opacity-75 sm:mt-6"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
