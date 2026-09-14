import type { ChangeEvent } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import {
  COMPLEXITY_HOURS,
  COMPLEXITY_LEVELS,
  emptyQuoteItem,
  type QuoteFormInput,
} from "../features/quote/schema";
import { FormField, inputClassName } from "./FormField";

/** Lista dinámica de funcionalidades/módulos de la cotización, con horas por complejidad. */
export function QuoteItemsField() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<QuoteFormInput>();
  const { fields, append, remove } = useFieldArray({ control, name: "items" });

  const arrayError =
    typeof errors.items?.message === "string" ? errors.items.message : undefined;

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-700">
          Funcionalidades / módulos
        </h2>
        <button
          type="button"
          onClick={() => append(emptyQuoteItem)}
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          + Agregar
        </button>
      </div>

      <div className="mt-2 space-y-3">
        {fields.map((field, index) => {
          function handleComplexityChange(event: ChangeEvent<HTMLSelectElement>) {
            const level = event.target.value;
            if (level === "Baja" || level === "Media" || level === "Alta") {
              setValue(`items.${index}.hours`, COMPLEXITY_HOURS[level]);
            }
          }

          return (
            <div
              key={field.id}
              className="grid grid-cols-1 gap-2 rounded-md border border-neutral-200 p-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-start"
            >
              <FormField
                label="Nombre"
                htmlFor={`items.${index}.name`}
                error={errors.items?.[index]?.name?.message}
              >
                <input
                  id={`items.${index}.name`}
                  className={inputClassName}
                  placeholder="Ej. Login de usuarios"
                  {...register(`items.${index}.name`)}
                />
              </FormField>

              <FormField label="Complejidad" htmlFor={`items.${index}.complexity`}>
                <select
                  id={`items.${index}.complexity`}
                  className={inputClassName}
                  {...register(`items.${index}.complexity`, {
                    onChange: handleComplexityChange,
                  })}
                >
                  {COMPLEXITY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField
                label="Horas"
                htmlFor={`items.${index}.hours`}
                error={errors.items?.[index]?.hours?.message}
              >
                <input
                  id={`items.${index}.hours`}
                  type="number"
                  step="0.25"
                  min="0"
                  className={inputClassName}
                  {...register(`items.${index}.hours`)}
                />
              </FormField>

              <button
                type="button"
                onClick={() => remove(index)}
                disabled={fields.length === 1}
                className="text-sm text-red-600 hover:underline disabled:cursor-not-allowed disabled:text-neutral-300 sm:mt-6"
              >
                Quitar
              </button>
            </div>
          );
        })}
      </div>

      {arrayError && <p className="mt-2 text-sm text-red-600">{arrayError}</p>}
    </section>
  );
}
