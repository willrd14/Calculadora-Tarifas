import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormField,
  SectionHeading,
  inputClassName,
} from "../../components/FormField";
import { CURRENCIES } from "../../lib/currency";
import { getSettings, saveSettings } from "./db";
import {
  settingsFormSchema,
  type SettingsFormInput,
  type SettingsFormValues,
} from "./schema";

type LoadStatus =
  | { kind: "loading" }
  | { kind: "ready" }
  | { kind: "error"; message: string };

type SaveStatus =
  | { kind: "idle" }
  | { kind: "saving" }
  | { kind: "saved" }
  | { kind: "error"; message: string };

/**
 * Configuración (Fase 4): tarifa por hora y moneda por defecto para
 * cotizaciones nuevas, y los datos del freelancer que aparecen en el PDF.
 */
export function SettingsPage() {
  const form = useForm<SettingsFormInput, unknown, SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const [loadStatus, setLoadStatus] = useState<LoadStatus>({ kind: "loading" });
  const [saveStatus, setSaveStatus] = useState<SaveStatus>({ kind: "idle" });

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((settings) => {
        if (cancelled) return;
        reset(settings);
        setLoadStatus({ kind: "ready" });
      })
      .catch((error: unknown) => {
        console.error("Error cargando la configuración:", error);
        if (cancelled) return;
        setLoadStatus({
          kind: "error",
          message: "No se pudo cargar la configuración.",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [reset]);

  async function onSubmit(values: SettingsFormValues) {
    setSaveStatus({ kind: "saving" });
    try {
      await saveSettings(values);
      setSaveStatus({ kind: "saved" });
    } catch (error) {
      console.error("Error guardando la configuración:", error);
      setSaveStatus({
        kind: "error",
        message: "No se pudo guardar. Intenta de nuevo.",
      });
    }
  }

  if (loadStatus.kind === "loading") {
    return <p className="text-sm text-text-soft">Cargando configuración…</p>;
  }

  if (loadStatus.kind === "error") {
    return <p className="text-sm text-danger">{loadStatus.message}</p>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-8">
      <section className="space-y-4">
        <SectionHeading>Tarifa y moneda por defecto</SectionHeading>
        <div className="grid grid-cols-1 gap-4 rounded border border-border bg-well p-4 sm:grid-cols-2">
        <FormField
          label="Tarifa por hora por defecto"
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

        <FormField label="Moneda por defecto" htmlFor="currency">
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
          label="Tasa de cambio (DOP por 1 USD)"
          htmlFor="exchangeRateDopPerUsd"
          error={errors.exchangeRateDopPerUsd?.message}
          className="sm:col-span-2"
        >
          <input
            id="exchangeRateDopPerUsd"
            type="number"
            step="0.01"
            min="0.01"
            className={`${inputClassName} font-mono`}
            {...register("exchangeRateDopPerUsd")}
          />
          <p className="mt-1 text-xs text-text-faint">
            Se usa para convertir la tarifa por hora cuando cambias de
            moneda en una cotización. Actualízala cuando cambie el tipo de
            cambio real.
          </p>
        </FormField>
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading>Datos del freelancer (aparecen en el PDF)</SectionHeading>

        <div className="grid grid-cols-1 gap-4 rounded border border-border bg-well p-4 sm:grid-cols-2">
          <FormField
            label="Nombre completo"
            htmlFor="freelancerName"
            error={errors.freelancerName?.message}
            className="sm:col-span-2"
          >
            <input
              id="freelancerName"
              className={inputClassName}
              {...register("freelancerName")}
            />
          </FormField>

          <FormField
            label="Descripción / tagline"
            htmlFor="freelancerTagline"
            className="sm:col-span-2"
          >
            <input
              id="freelancerTagline"
              className={inputClassName}
              placeholder="Ej. Desarrollo de software freelance"
              {...register("freelancerTagline")}
            />
          </FormField>

          <FormField label="Email" htmlFor="freelancerEmail">
            <input
              id="freelancerEmail"
              type="email"
              className={inputClassName}
              {...register("freelancerEmail")}
            />
          </FormField>

          <FormField label="Teléfono" htmlFor="freelancerPhone">
            <input
              id="freelancerPhone"
              className={inputClassName}
              {...register("freelancerPhone")}
            />
          </FormField>

          <FormField
            label="Portafolio / sitio web"
            htmlFor="freelancerPortfolio"
          >
            <input
              id="freelancerPortfolio"
              className={inputClassName}
              {...register("freelancerPortfolio")}
            />
          </FormField>

          <FormField
            label="Handle (pie del PDF)"
            htmlFor="freelancerHandle"
          >
            <input
              id="freelancerHandle"
              className={inputClassName}
              placeholder="Ej. willrd14"
              {...register("freelancerHandle")}
            />
          </FormField>
        </div>
      </section>

      <div className="flex items-center gap-4 border-t border-border pt-6">
        <button
          type="submit"
          disabled={saveStatus.kind === "saving"}
          className="rounded bg-accent px-5 py-2.5 text-sm font-medium text-accent-ink hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saveStatus.kind === "saving" ? "Guardando…" : "Guardar configuración"}
        </button>

        {saveStatus.kind === "saved" && (
          <p className="text-sm text-success">Guardado.</p>
        )}
        {saveStatus.kind === "error" && (
          <p className="text-sm text-danger">{saveStatus.message}</p>
        )}
      </div>
    </form>
  );
}
