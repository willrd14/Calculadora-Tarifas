# CLAUDE.md

Contexto de proyecto para Claude Code. Ver el plan completo en
[`docs/PRD.md`](docs/PRD.md).

## Estado actual

**Fase 1 — MVP (formulario + cálculo + vista previa): completa.**

- `src/features/quote/schema.ts`: esquema zod (`quoteFormSchema`), tipos y
  constantes (tipos de proyecto, monedas, horas por complejidad).
  Usa `z.coerce.number()` en los campos numéricos, por eso el formulario
  distingue `QuoteFormInput` (lo que RHF maneja mientras se escribe) de
  `QuoteFormValues` (lo que llega a `onSubmit` ya validado) — ver el
  `useForm<QuoteFormInput, unknown, QuoteFormValues>` en `QuoteForm.tsx`.
- `src/lib/calculate.ts`: `calculateQuote()`, función pura del desglose
  (horas totales, subtotal ítems, cargos adicionales, descuento, total).
- `src/lib/currency.ts`: `formatCurrency()` (Intl.NumberFormat DOP/USD).
- `src/features/quote/QuoteForm.tsx`: formulario principal (cliente/proyecto,
  tipo, descripción, tarifa/hora, moneda, descuento) + `FormProvider`.
- `src/components/QuoteItemsField.tsx` y `AdditionalChargesField.tsx`:
  listas dinámicas (`useFieldArray`) de ítems y cargos adicionales.
- `src/components/QuotePreview.tsx`: desglose en tiempo real vía `useWatch` +
  `calculateQuote`.
- `src/components/FormField.tsx`: wrapper label+input+error reutilizable.
- `onSubmit` de `QuoteForm` solo hace `console.log` por ahora — la Fase 2
  (PDF) todavía no está conectada.
- Validado con `npm run build` (tsc + vite build) y sirviendo con
  `npm run dev`. **Nota:** no pude verificar visualmente en navegador porque
  la extensión Claude-in-Chrome no respondió en este entorno.

**Fase 0 — Setup: completa.**

- Scaffold generado con `create-tauri-app` (Tauri 2 + React 19 + TS + Vite,
  template `react-ts`).
- Tailwind CSS 4 configurado vía `@tailwindcss/vite` (import en
  `vite.config.ts`, `src/index.css` con `@import "tailwindcss";`).
- `react-hook-form` + `zod` + `@hookform/resolvers` instalados (aún sin usar).
- Estructura de carpetas del PRD creada bajo `src/` (`app`, `components`,
  `features/{quote,history,settings,pdf}`, `lib`). Las carpetas que todavía
  están vacías tienen un `README.md` explicando su propósito — bórralo cuando
  agregues código real ahí.
- Identificadores renombrados del template genérico: `package.json` →
  `calculadora-tarifas`, `tauri.conf.json` → productName "Calculadora de
  Tarifas" / identifier `com.williams.calculadora-tarifas`, crate de Rust →
  `calculadora_tarifas_lib`.
- Repo Git inicializado, primer commit hecho, push a
  `https://github.com/willrd14/Calculadora-Tarifas.git` en `main`.
- Rust instalado y validado con `cargo check` en `src-tauri` (compila sin
  errores). `Cargo.lock` commiteado (es una app, no una librería).

**Siguiente paso (Fase 2):** exportación a PDF (`src/features/pdf`), a partir
de los `QuoteFormValues` que ya arma `onSubmit` en `QuoteForm.tsx`.

## Notas importantes

- Rust se instaló *después* de que algunas terminales ya estuvieran abiertas.
  Si `cargo`/`rustc`/`npm run tauri dev` no se reconocen, abre una terminal
  nueva para que tome el PATH de usuario actualizado.
- `npm run build` (tsc + vite build) valida el frontend sin necesitar Rust.
  `cargo check` en `src-tauri` valida el backend sin abrir la ventana de la
  app.
