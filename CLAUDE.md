# CLAUDE.md

Contexto de proyecto para Claude Code. Ver el plan completo en
[`docs/PRD.md`](docs/PRD.md).

## Estado actual

**Fase 3 — Historial de cotizaciones: completa.**

- Persistencia: **SQLite vía `tauri-plugin-sql`** (decisión explícita de
  Williams sobre la alternativa más simple de `tauri-plugin-store`/JSON que
  sugería el PRD — pensando en poder filtrar/ordenar el historial más
  adelante).
- `src-tauri/src/lib.rs`: registra el plugin con una migración (`version:
  1`) que crea la tabla `quotes` (un registro por cotización generada, con
  `items`/`additional_charges` serializados como JSON en columnas TEXT).
  DB en `sqlite:cotizaciones.db` (resuelto por el plugin dentro del
  directorio de datos de la app, no en `Documentos`).
- `src-tauri/capabilities/default.json`: se agregan `sql:default` +
  `sql:allow-execute` (el default del plugin solo trae lectura/`load`/
  `close`, hace falta `allow-execute` aparte para INSERT/UPDATE).
- `src/features/history/db.ts`: `saveQuoteToHistory()`,
  `listQuoteHistory()`, `updateQuoteStatus()`,
  `historyRecordToFormValues()` (reconstruye `QuoteFormValues` a partir de
  un registro, para "duplicar como plantilla").
- `src/features/history/HistoryList.tsx`: tabla del historial (cliente,
  proyecto, fecha, total, estado editable inline, botón "Duplicar"). Estado
  por defecto de una cotización nueva: `"Enviada"`.
- `src/features/pdf/generateQuotePdf.tsx`: `generateAndSaveQuotePdf()` ahora
  devuelve `{ path, quoteNumber, total }` (antes solo `path`) — `quoteNumber`
  se usa como `id` del historial, `total` se guarda sin recalcularlo aparte.
- `src/features/quote/QuoteForm.tsx`: tras generar el PDF, llama a
  `saveQuoteToHistory()`. Acepta un prop `initialValues` para precargar el
  formulario al duplicar. `db.ts` y `generateQuotePdf.tsx` se importan con
  `import()` dinámico (code-splitting — ver nota de bundle abajo).
- `src/app/App.tsx`: pestañas "Nueva cotización" / "Historial".
  `HistoryList` se carga con `React.lazy` (agrupa el plugin SQL en su
  propio chunk, separado del bundle principal). Al duplicar, cambia a la
  pestaña de cotización y **remonta** `QuoteForm` con una `key` distinta
  (react-hook-form solo lee `defaultValues` al montar, no reacciona a
  cambios de prop).

**Fase 2 — Exportación a PDF: completa** (incluye una revisión para
replicar `Template/Main.dc.html`, el diseño de referencia que Williams
agregó — ver `Template/README.md`).

- Librería: `@react-pdf/renderer`, corre 100% en el frontend/WebView.
- `src/features/pdf/QuoteDocument.tsx`: replica el diseño de
  `Template/Main.dc.html` (barra de acento, header con datos del freelancer +
  número/fecha/vigencia, columnas Cliente/Proyecto, caja de descripción,
  tabla de ítems con nota de complejidad, caja de totales, condiciones a 3
  columnas, footer). Colores/tamaños convertidos de px (96dpi, como en el
  template) a pt (72dpi, unidad de `@react-pdf/renderer`) con factor ×0.75.
- `src/features/pdf/fonts.ts`: registra las fuentes vía `@fontsource/*`
  (self-hosted, sin red en runtime) — Space Grotesk 700, IBM Plex Sans
  400/500/600, **Roboto Mono** 400/500/600 (no IBM Plex Mono — ver nota de
  bug abajo). Usa archivos `.woff`, no `.woff2`.
- `src/lib/date.ts`: `addDays()` / `formatDateDMY()`.
- `src/features/pdf/quoteConditions.ts`: `QUOTE_VALIDITY_DAYS` (15, política
  fija) y valores por defecto de forma de pago / tiempo de entrega — el
  usuario los edita **por cotización** en el formulario (`paymentTerms`,
  `estimatedDelivery` en el schema), no son globales.
- `src/features/quote/schema.ts`: el campo único "Cliente / Proyecto" se
  separó en `clientName` + `clientContact` (opcional) + `projectName` (el
  template los muestra como dos columnas distintas).
- `src/features/settings/freelancerProfile.ts`: datos reales de Williams ya
  cargados (nombre completo, email, teléfono, portafolio) + `tagline` y
  `handle` ("willrd14", para el footer). Sigue siendo un archivo fijo hasta
  la Fase 4 (Configuración).
- `src/lib/quoteNumber.ts`: `generateQuoteNumber()` — ahora incluye segundos
  (`COT-YYYYMMDD-HHmmss`) para que dos PDFs generados en el mismo minuto no
  se pisen de nombre. Sigue sin ser un consecutivo real (Fase 3).
- `src/features/pdf/generateQuotePdf.tsx`: **ya no usa diálogo de guardado**
  — a pedido de Williams, cada cotización se guarda automáticamente en
  `Documentos/Cotizaciones` (resuelto con `documentDir()` de
  `@tauri-apps/api/path`, la carpeta se crea con `mkdir` si no existe). Se
  importa con `import()` dinámico desde `QuoteForm.tsx` (code-splitting: el
  chunk pesa ~1.2MB, solo se descarga al generar un PDF).
- Backend Rust: **se quitó** `tauri-plugin-dialog` (ya no se usa). Permisos
  en `src-tauri/capabilities/default.json`: `core:default`, `opener:default`,
  `fs:default`, `fs:write-files`, `fs:allow-mkdir`, `fs:scope` con
  `allow: ["$DOCUMENT/**"]` (antes era `$HOME/**`; se acotó a Documentos ya
  que ahí es donde realmente se escribe ahora).
- El botón del formulario dice "Generar PDF"; muestra la ruta guardada o un
  error debajo del botón.

**Bug real encontrado y su fix (fuentes del PDF):** `@react-pdf/renderer`
(pdfkit + fontkit) revienta con `RangeError: Offset is outside the bounds
of the DataView` al incrustar IBM Plex Mono en cuanto el texto trae un
espacio junto a ciertos glifos (ej. `"No. 001"`, `"Fecha: ..."`) — no tiene
que ver con acentos, ni con woff-vs-woff2, ni con usar varias fuentes a la
vez (aislado con scripts standalone, ver detalle en el commit). **Roboto
Mono** renderiza el mismo contenido sin problema y es visualmente muy
parecido, así que se usa en su lugar. Aparte, `.woff2` (cualquier familia)
también revienta el subsetting — por eso todas las fuentes usan `.woff`.
Si en el futuro se cambia de librería/fuente para el PDF, tener esto en
cuenta.

**Cómo se validó (sin poder abrir la ventana nativa en este entorno):**
`npm run build` (tsc + vite build) y `cargo check` pasan limpios; además se
armó un documento de ejemplo con datos realistas fuera de Vite (fuentes
registradas con rutas de archivo locales) y se leyó el PDF resultante con
la herramienta de lectura de PDFs de Claude Code para confirmar visualmente
que el layout, colores y fuentes quedaron bien — pero **nunca se generó un
PDF real desde la app corriendo** (`npm run tauri dev` + llenar el
formulario). Williams sí confirmó que la app en general abre y funciona.

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
1. Correr `npm run tauri dev`, generar una cotización y confirmar que
   aparece en la pestaña Historial con el estado/total correctos, y que
   "Duplicar" precarga bien el formulario (la Fase 3 es nueva, no se probó
   end-to-end corriendo la app todavía).
2. Fase 4 — Configuración (tarifa por defecto, datos del freelancer en
   `freelancerProfile.ts`, moneda por defecto) — expondría en UI lo que hoy
   son archivos fijos (`DEFAULT_HOURLY_RATE`, `freelancerProfile`,
   `DEFAULT_CURRENCY` en `schema.ts`).

## Notas importantes

- Rust se instaló *después* de que algunas terminales ya estuvieran abiertas.
  Si `cargo`/`rustc`/`npm run tauri dev` no se reconocen, abre una terminal
  nueva para que tome el PATH de usuario actualizado.
- `npm run build` (tsc + vite build) valida el frontend sin necesitar Rust.
  `cargo check` en `src-tauri` valida el backend sin abrir la ventana de la
  app.
