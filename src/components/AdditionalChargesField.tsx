import { useFieldArray, useFormContext } from "react-hook-form";
import {
  emptyAdditionalCharge,
  type QuoteFormInput,
} from "../features/quote/schema";
import { FormField, inputClassName } from "./FormField";

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
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700">
          Cargos adicionales (opcional)
        </h2>
        <button
          type="button"
          onClick={() => append(emptyAdditionalCharge)}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          + Agregar
        </button>
      </div>

      {fields.length === 0 && (
        <p className="mt-2 text-sm text-neutral-400">Sin cargos adicionales.</p>
      )}

      <div className="mt-2 space-y-3">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-1 gap-2 rounded-md border border-neutral-200 p-3 sm:grid-cols-[1fr_auto_auto] sm:items-start"
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
                className={inputClassName}
                {...register(`additionalCharges.${index}.amount`)}
              />
            </FormField>

            <button
              type="button"
              onClick={() => remove(index)}
              className="text-sm text-red-600 hover:underline sm:mt-6"
            >
              Quitar
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
