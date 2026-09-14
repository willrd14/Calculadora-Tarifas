# CLAUDE.md

Contexto de proyecto para Claude Code. Ver el plan completo en
[`docs/PRD.md`](docs/PRD.md).

## Estado actual

**Fase 2 — Exportación a PDF: completa.**

- Librería elegida: `@react-pdf/renderer` (genera el PDF con componentes
  React, corre 100% en el frontend/WebView).
- `src/features/pdf/QuoteDocument.tsx`: documento PDF (freelancer, cliente,
  tabla de ítems con subtotal por fila, cargos adicionales, totales,
  condiciones). Usa Helvetica estándar (sin fuentes embebidas) — soporta
  tildes/ñ bien.
- `src/features/pdf/quoteConditions.ts`: texto placeholder de condiciones
  (validez/pago/entrega) — editar a mano si hace falta.
- `src/features/settings/freelancerProfile.ts`: **placeholder** de los datos
  del freelancer que salen en el PDF (nombre "Williams", resto vacío).
  Edítalo a mano con datos reales, o reemplázalo cuando se construya
  Configuración (Fase 4).
- `src/lib/quoteNumber.ts`: `generateQuoteNumber()` — número simple basado en
  fecha/hora (`COT-YYYYMMDD-HHmm`), no es consecutivo porque no hay historial
  todavía (Fase 3).
- `src/features/pdf/generateQuotePdf.tsx`: `generateAndSaveQuotePdf()` — arma
  el PDF, abre el diálogo nativo "Guardar como" (`@tauri-apps/plugin-dialog`)
  y escribe el archivo (`@tauri-apps/plugin-fs`). Se importa con `import()`
  dinámico desde `QuoteForm.tsx` (code-splitting: el chunk pesa ~1.2MB y solo
  se descarga cuando el usuario genera un PDF).
- Backend Rust: se agregaron los plugins `tauri-plugin-dialog` y
  `tauri-plugin-fs`, registrados en `src-tauri/src/lib.rs`. Permisos en
  `src-tauri/capabilities/default.json`: `dialog:default`, `fs:default`,
  `fs:write-files` + `fs:scope` con `allow: ["$HOME/**"]` (alcance amplio a
  propósito — app personal de un solo usuario, el usuario elige la ruta vía
  diálogo nativo).
- El botón del formulario pasó de "Continuar" a "Generar PDF"; muestra la
  ruta guardada o un error debajo del botón.
- Validado con `npm run build` (tsc + vite build). **No** se probó
  `cargo tauri dev`/`build` end-to-end (abre una ventana nativa) ni se generó
  un PDF real — falta verificar el flujo completo corriendo la app.

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

**Siguiente paso:**
1. Correr `npm run tauri dev` una vez para confirmar en vivo que el diálogo
   de guardado y el PDF generado funcionan (no se ha probado end-to-end).
2. Fase 3 — Historial de cotizaciones (persistencia local).

## Notas importantes

- Rust se instaló *después* de que algunas terminales ya estuvieran abiertas.
  Si `cargo`/`rustc`/`npm run tauri dev` no se reconocen, abre una terminal
  nueva para que tome el PATH de usuario actualizado.
- `npm run build` (tsc + vite build) valida el frontend sin necesitar Rust.
  `cargo check` en `src-tauri` valida el backend sin abrir la ventana de la
  app.
