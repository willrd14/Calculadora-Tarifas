import { useEffect, useState, type ChangeEvent } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PROJECT_TYPES,
  defaultQuoteFormValues,
  quoteFormSchema,
  type QuoteFormInput,
  type QuoteFormValues,
} from "./schema";
import {
  FormField,
  SectionHeading,
  inputClassName,
} from "../../components/FormField";
import { CURRENCIES } from "../../lib/currency";
import { QuoteItemsField } from "../../components/QuoteItemsField";
import { AdditionalChargesField } from "../../components/AdditionalChargesField";
import { QuotePreview } from "../../components/QuotePreview";
import type { Client } from "../clients/db";

type PdfStatus =
  | { kind: "idle" }
  | { kind: "generating" }
  | { kind: "success"; path: string }
  | { kind: "error"; message: string };

interface QuoteFormProps {
  /** Valores iniciales al duplicar una cotización del historial. */
  initialValues?: QuoteFormInput;
}

/**
 * Formulario de cotización: cliente/proyecto, ítems, tarifa, cargos
 * adicionales, descuento y condiciones, con vista previa del total en
 * tiempo real. Al enviarlo, genera el PDF, lo guarda en
 * `Documentos/Cotizaciones` y registra la cotización en el historial.
 */
export function QuoteForm({ initialValues }: QuoteFormProps) {
  const form = useForm<QuoteFormInput, unknown, QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: initialValues ?? defaultQuoteFormValues,
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = form;

  const [pdfStatus, setPdfStatus] = useState<PdfStatus>({ kind: "idle" });
  const [clients, setClients] = useState<Client[]>([]);

  // Clientes guardados, para el selector "Cliente guardado" de abajo.
  useEffect(() => {
    let cancelled = false;
    import("../clients/db")
      .then(({ listClients }) => listClients())
      .then((rows) => {
        if (!cancelled) setClients(rows);
      })
      .catch((error: unknown) => {
        console.error("Error cargando clientes:", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleSelectClient(event: ChangeEvent<HTMLSelectElement>) {
    const client = clients.find((c) => c.id === event.target.value);
    if (client) {
      setValue("clientName", client.name);
      setValue("clientContact", client.contact);
    }
  }

  // En una cotización nueva, precarga la tarifa/moneda de Configuración
  // (Fase 4) en cuanto cargan — al duplicar una del historial se respeta lo
  // que ya traía esa cotización, así que no se toca nada en ese caso.
  useEffect(() => {
    if (initialValues) return;
    let cancelled = false;
    import("../settings/db")
      .then(({ getSettings }) => getSettings())
      .then((settings) => {
        if (cancelled) return;
        setValue("hourlyRate", settings.hourlyRate);
        setValue("currency", settings.currency);
      })
      .catch((error: unknown) => {
        console.error("Error cargando la configuración:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [initialValues, setValue]);

  async function onSubmit(values: QuoteFormValues) {
    setPdfStatus({ kind: "generating" });
    try {
      // Carga diferida: @react-pdf/renderer y el plugin SQL son pesados, así
      // que solo se descargan cuando el usuario realmente genera un PDF.
      const [{ generateAndSaveQuotePdf }, { saveQuoteToHistory }, { upsertClientByName }] =
        await Promise.all([
          import("../pdf/generateQuotePdf"),
          import("../history/db"),
          import("../clients/db"),
        ]);
      const { path, quoteNumber, total } =
        await generateAndSaveQuotePdf(values);
      await saveQuoteToHistory({ id: quoteNumber, quote: values, total, pdfPath: path });
      // Guarda/actualiza el cliente para no volver a pedir sus datos la
      // próxima vez que pida un proyecto.
      await upsertClientByName(values.clientName, values.clientContact);
      setPdfStatus({ kind: "success", path });
    } catch (error) {
      console.error("Error generando el PDF:", error);
      setPdfStatus({
        kind: "error",
        message: "No se pudo generar el PDF. Intenta de nuevo.",
      });
    }
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]"
      >
        <div className="space-y-8">
          <section className="space-y-4">
            <SectionHeading>Cliente y proyecto</SectionHeading>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {clients.length > 0 && (
              <FormField
                label="Cliente guardado"
                htmlFor="savedClient"
                className="sm:col-span-2"
              >
                <select
                  id="savedClient"
                  className={inputClassName}
                  defaultValue=""
                  onChange={handleSelectClient}
                >
                  <option value="">
                    — Elegir uno guardado o escribir uno nuevo abajo —
                  </option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField
              label="Cliente / Empresa"
              htmlFor="clientName"
              error={errors.clientName?.message}
            >
              <input
                id="clientName"
                className={inputClassName}
                placeholder="Ej. Acme Corp"
                {...register("clientName")}
              />
            </FormField>

            <FormField label="Contacto del cliente" htmlFor="clientContact">
              <input
                id="clientContact"
                className={inputClassName}
                placeholder="Email o teléfono (opcional)"
                {...register("clientContact")}
              />
            </FormField>

            <FormField
              label="Nombre del proyecto"
              htmlFor="projectName"
              error={errors.projectName?.message}
            >
              <input
                id="projectName"
                className={inputClassName}
                placeholder="Ej. App de inventario"
                {...register("projectName")}
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
            </div>
          </section>

          <QuoteItemsField />

          <section className="space-y-4">
            <SectionHeading>Tarifa</SectionHeading>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
            </div>
          </section>

          <AdditionalChargesField />

          <section className="space-y-4">
            <SectionHeading>Condiciones</SectionHeading>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField label="Forma de pago" htmlFor="paymentTerms">
              <input
                id="paymentTerms"
                className={inputClassName}
                placeholder="Ej. 50% al iniciar, 50% contra entrega"
                {...register("paymentTerms")}
              />
            </FormField>

            <FormField label="Tiempo estimado de entrega" htmlFor="estimatedDelivery">
              <input
                id="estimatedDelivery"
                className={inputClassName}
                placeholder="Ej. 3–4 semanas desde el inicio"
                {...register("estimatedDelivery")}
              />
            </FormField>
            </div>
          </section>

          <div className="flex items-center gap-4 border-t border-line pt-6">
            <button
              type="submit"
              disabled={pdfStatus.kind === "generating"}
              className="rounded bg-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pdfStatus.kind === "generating" ? "Generando PDF…" : "Generar PDF"}
            </button>

            {pdfStatus.kind === "success" && (
              <p className="text-sm text-success">
                PDF guardado en: {pdfStatus.path}
              </p>
            )}
            {pdfStatus.kind === "error" && (
              <p className="text-sm text-danger">{pdfStatus.message}</p>
            )}
          </div>
        </div>

        <QuotePreview />
      </form>
    </FormProvider>
  );
}
