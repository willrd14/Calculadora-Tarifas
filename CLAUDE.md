# CLAUDE.md

Contexto de proyecto para Claude Code. Ver el plan completo en
[`docs/PRD.md`](docs/PRD.md).

## Estado actual

**Conversión automática de tarifa por moneda + auto-plantilla por tipo de
proyecto** (pedido de Williams).

- **Tasa de cambio**: nuevo campo en Configuración,
  `exchangeRateDopPerUsd` (cuántos DOP equivalen a 1 USD; default 58.83,
  del ejemplo real de Williams: 1470.75 DOP == 25 USD). Migración
  `version: 5` en `lib.rs` (`ALTER TABLE settings ADD COLUMN
  exchange_rate_dop_per_usd`).
- `QuoteForm.tsx`: al cambiar el select "Moneda", `handleCurrencyChange`
  convierte `hourlyRate` con esa tasa (÷ al pasar a USD, × al pasar a
  DOP) — la tasa se carga siempre al montar el formulario (antes solo se
  cargaban tarifa/moneda por defecto, y solo si no era un duplicado; la
  tasa ahora se carga en todos los casos porque hace falta para poder
  convertir sin importar si es cotización nueva o duplicada).
- **Auto-plantilla por tipo de proyecto**: antes había un select aparte
  "empezar desde plantilla…" en la sección de Funcionalidades. Ahora, al
  cambiar "Tipo de proyecto" (en la sección Cliente y proyecto),
  `handleProjectTypeChange` busca el arquetipo con ese `projectType` y
  reemplaza los ítems directamente — se quitó el select redundante de
  `QuoteItemsField.tsx`.
  - Detalle técnico: `QuoteForm.tsx` necesitaba un `replace()` de
    `items` pero esa lista la maneja el `useFieldArray` **dentro** de
    `QuoteItemsField.tsx`. Se resolvió llamando `useFieldArray` una
    segunda vez en `QuoteForm.tsx` con el mismo `name: "items"` y el
    mismo `control` — RHF sincroniza automáticamente los `fields` entre
    instancias que comparten nombre+control, así que no hizo falta
    subir el estado ni pasar props.
- **Validado** con `npm run build` + `cargo check` limpios, y en vivo: la
  app ya estaba corriendo — Tauri detectó la migración v5, recompiló y
  reinició sin errores, Vite aplicó el resto por HMR. No se confirmó
  explícitamente con Williams que la conversión de moneda dé el resultado
  esperado en la práctica (ej. 25 USD → 1470.75 DOP y viceversa).

**Multiplicadores de complejidad, arquetipos de proyecto y niveles de
alcance** (fuera del PRD — Williams pegó un PRD ajeno de "DevQuote Pro",
una herramienta mucho más grande para consultoras de staffing con equipos
multi-rol, blended rate, app móvil separada, integración CRM, etc. Eso
**no encaja** con esta app de un solo usuario — se le presentó la
discrepancia y eligió 3 ideas puntuales, adaptadas a un freelancer solo):

- `src/features/quote/complexityMultipliers.ts`: catálogo fijo
  (`COMPLEXITY_MULTIPLIERS`) — Kubernetes/cloud +15%, compliance +20%,
  CI/CD +10%, rush +25%, IA/ML +15%. `sumComplexityMultiplierPercent()`
  suma los seleccionados.
- `src/lib/calculate.ts`: `calculateQuote()` ahora aplica el % de
  multiplicadores **sobre la mano de obra** (`laborSubtotal → itemsSubtotal`),
  antes de sumar cargos adicionales y aplicar el descuento. Nuevos campos
  en `QuoteCalculationResult`: `laborSubtotal`, `complexityAmount`.
- `src/features/quote/schema.ts`: nuevo campo `complexityMultiplierIds:
  string[]` en el formulario.
- `QuoteForm.tsx`: sección "Complejidad adicional" con checkboxes (mismo
  `name` registrado para los 5 — patrón estándar de RHF para arrays de
  checkboxes).
- `QuotePreview.tsx` / `QuoteDocument.tsx` (PDF): muestran la línea
  "Complejidad (+X%)" y, en el PDF, un renglón "Incluye: <lista con
  nombres y %>" para que el cliente vea qué compone ese recargo.
- **Migración `version: 4`** en `lib.rs`: `ALTER TABLE quotes ADD COLUMN
  complexity_multiplier_ids_json` (`DEFAULT '[]'` para no romper filas
  viejas). `history/db.ts` actualizado para guardar/leer esa columna.
- `src/features/quote/archetypes.ts`: `PROJECT_ARCHETYPES` — **una
  plantilla por cada valor de `PROJECT_TYPES`** (menos "Otro"), a pedido
  explícito de Williams tras ver que solo había 4. Cada una trae
  `projectType` + una lista de ítems/horas típicas. En
  `QuoteItemsField.tsx`, el select "empezar desde plantilla…" llama a
  `replace()` de `useFieldArray` para reemplazar los ítems **y** hace
  `setValue("projectType", ...)` para que el selector de arriba quede en
  sincronía. Es solo una ayuda de UI — no se guarda en la cotización.
- `src/features/quote/scopeTiers.ts`: `SCOPE_TIERS` (MVP 40–120h / Core
  160–320h / Enterprise 320–800h) — botones de referencia en
  `QuotePreview.tsx` (estado local, no persistido) que comparan las horas
  totales actuales contra el rango elegido.
- **Validado** con `npm run build` + `cargo check` limpios, y **en vivo**:
  la app ya estaba corriendo (`npm run tauri dev`) mientras se hacían
  estos cambios — Tauri detectó el cambio de `lib.rs` (migración v4),
  recompiló y reinició solo sin errores/panics (confirmado en el log del
  proceso), y Vite aplicó el resto por HMR. No se confirmó explícitamente
  con Williams que el flujo completo (marcar multiplicadores → generar PDF
  → ver la línea "Incluye:") se vea bien.

**Rediseño de la UI de la app** (pedido de Williams, no es una fase del
PRD — el PRD no especifica look & feel).

Primer intento: le di a la app el mismo sistema visual que el PDF (Space
Grotesk/IBM Plex Sans/Roboto Mono, paleta papel cálido). **Williams lo
rechazó explícitamente**: la UI de la app y el PDF son dos cosas
distintas y deben tener cada una su propio estilo — la app no debe
parecerse al documento que produce. Se rehizo desde cero con una
identidad propia:

- **Concepto:** "calculadora de terminal" — la app es la herramienta de
  trabajo de un desarrollador (Williams), no el documento que le llega al
  cliente. Fondo oscuro tipo terminal/editor de código, un solo acento
  ámbar (evoca tanto una calculadora como un monitor de fósforo), y **una
  sola tipografía monoespaciada en toda la UI** (JetBrains Mono — distinta
  a las 3 fuentes del PDF a propósito).
- `src/index.css`: tokens vía `@theme` de Tailwind 4 — `--font-mono`
  (JetBrains Mono 400/500/600/700, único font-family de la app) y colores
  `--color-bg/surface/surface-raised/well/border/text/text-soft/
  text-faint/accent/accent-ink/accent-soft/success/danger` (paleta oscura
  ámbar-sobre-grafito, sin relación con los hex del PDF). El paquete
  `jetbrains-mono` se instaló solo para esto; Space Grotesk/IBM Plex
  Sans/Roboto Mono siguen instalados porque los sigue usando el PDF
  (`features/pdf/fonts.ts`) — son sistemas de fuentes completamente
  separados a propósito.
- `src/app/App.tsx`: barra superior tipo terminal (tres puntos de color,
  como los controles de una ventana), marca `$ calculadora-tarifas` en
  mono, pestañas estilo "tabs de editor de código" (con `-mb-px` para que
  la pestaña activa se funda con el borde inferior del nav).
- `src/components/FormField.tsx`: `SectionHeading` ahora es un
  comentario de código (`// cliente y proyecto`) en vez de una etiqueta en
  mayúsculas — encaja con la metáfora de editor/terminal.
- `src/components/QuotePreview.tsx`: el total vive en su propio panel
  oscuro (`bg-well`) con un halo sutil (`text-shadow`) en ámbar — como el
  display LED/LCD de una calculadora real. Las etiquetas de la vista
  previa son `snake_case` (`horas_totales`, `subtotal_items`), como
  variables de código.
- `QuoteItemsField.tsx` / `AdditionalChargesField.tsx` / `HistoryList.tsx`
  / `ClientsPage.tsx` / `SettingsPage.tsx`: mismo vocabulario (bordes
  `border`, fondos `well`/`surface`, `accent` para acciones primarias,
  `danger` para "Quitar"/"Eliminar").
- **Sigue sin poder verificarse con screenshot** — Claude-in-Chrome no
  conectó en este entorno (varios intentos en total). Validado con
  `npm run build` + `cargo check` limpios y confirmando en el CSS
  compilado que las clases nuevas (`bg-accent`, `bg-well`, `text-text-
  soft`, etc.) se generaron con los valores correctos. **Pendiente que
  Williams la vea corriendo y confirme.**

**Fase 4 — Configuración: completa** (+ funcionalidad de Clientes, pedida
por Williams, no estaba en el PRD original).

- Migración `version: 2` (`create_settings_table`) crea la tabla `settings`
  con **una sola fila** (`id = 'default'`, app de un solo usuario) sembrada
  con los valores que antes estaban fijos en código (tarifa/moneda por
  defecto y los datos de `freelancerProfile.ts`, que se borró). El archivo
  `src/features/settings/freelancerProfile.ts` ya no existe.
- `src/features/settings/db.ts`: `getSettings()`, `saveSettings()`,
  `settingsToFreelancerProfile()` (adapta la fila de settings al shape que
  espera `QuoteDocument`).
- `src/features/settings/SettingsPage.tsx`: formulario (tarifa/moneda por
  defecto + datos del freelancer) en la pestaña "Configuración".
- `src/features/pdf/generateQuotePdf.tsx`: ahora llama a `getSettings()`
  para armar el `FreelancerProfile` del PDF, en vez de importar un objeto
  fijo.
- `src/features/quote/QuoteForm.tsx`: en una cotización **nueva** (no al
  duplicar), carga la configuración al montar y hace `setValue` en
  `hourlyRate`/`currency` — duplicar respeta la tarifa/moneda originales de
  esa cotización.
- Se movió `CURRENCIES` de `features/quote/schema.ts` a `lib/currency.ts`
  (ya lo necesitaban quote y settings por igual).
- Se extrajo `src/lib/db.ts` (`getDb()`, conexión SQLite compartida) desde
  `features/history/db.ts`, para que settings y clients (ver abajo) la
  reutilicen sin duplicar la conexión.

**Clientes (fuera del PRD original, agregado a pedido):** para no volver a
escribir los datos de un cliente que ya cotizó antes.

- Migración `version: 3` (`create_clients_table`): tabla `clients`
  (`name` con `UNIQUE`).
- `src/features/clients/db.ts`: `listClients()`,
  `upsertClientByName()` (inserta o actualiza el contacto si el nombre ya
  existe — **se llama sola** después de generar cada PDF, con
  `values.clientName`/`clientContact` de esa cotización), `addClient()`,
  `deleteClient()`.
- `src/features/clients/ClientsPage.tsx`: pestaña "Clientes" — formulario
  para agregar uno a mano + tabla con botón "Eliminar".
- `src/features/quote/QuoteForm.tsx`: selector "Cliente guardado" (solo
  aparece si hay al menos un cliente) que rellena `clientName` +
  `clientContact` con `setValue`. El campo de texto sigue editable debajo
  por si es un cliente nuevo o hay que corregir algo.

**Validado con:** `npm run build` (tsc + vite build) y `cargo check`
limpios, y **en vivo end-to-end** — Williams confirmó que generar una
cotización nueva toma la tarifa/moneda de Configuración, que el cliente
queda guardado y aparece en la pestaña Clientes, que el selector "Cliente
guardado" lo rellena en la siguiente cotización, y que cambiar un valor en
Configuración se refleja en la próxima cotización nueva. Todo funcionando.

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
1. Todo lo de Fase 4 + Clientes quedó **confirmado funcionando en vivo**
   por Williams (tarifa/moneda desde Configuración, autoguardado de
   clientes, selector "Cliente guardado", edición de Configuración
   reflejada en la siguiente cotización). No queda pendiente de probar.
2. El PRD no tenía una Fase de "Clientes" — si hace falta más adelante
   (buscar/filtrar clientes, editar uno existente en vez de solo borrar,
   ver qué cotizaciones tiene cada cliente), decidir si entra en una fase
   nueva o se amplía sobre lo ya hecho en `features/clients/`.
3. Fase 5 (opcional, PRD): plantillas de PDF, multi-moneda por cotización,
   gráficas de enviadas vs. aceptadas.

## Notas importantes

- Rust se instaló *después* de que algunas terminales ya estuvieran abiertas.
  Si `cargo`/`rustc`/`npm run tauri dev` no se reconocen, abre una terminal
  nueva para que tome el PATH de usuario actualizado.
- `npm run build` (tsc + vite build) valida el frontend sin necesitar Rust.
  `cargo check` en `src-tauri` valida el backend sin abrir la ventana de la
  app.
