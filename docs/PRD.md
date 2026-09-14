# PRD — Calculadora de Tarifas (Freelance Dev)

## 1. Resumen

Aplicación de escritorio de uso personal para que Williams cotice proyectos de
desarrollo de software freelance (web o escritorio) y genere una cotización en
PDF lista para enviar al cliente.

- **Tipo:** App de escritorio (no web pública)
- **Uso:** Personal (un solo usuario, sin cuentas ni multiusuario)
- **Área:** Freelance de desarrollo de software

## 2. Problema a resolver

Williams necesita una forma rápida y consistente de calcular la tarifa de un
proyecto de software (web o de escritorio) a partir de variables del trabajo
(alcance, horas, complejidad, tecnologías, etc.) y entregarle al cliente un
documento profesional (PDF) con el desglose y el total.

## 3. Objetivos

1. Cotizar un proyecto de desarrollo web o de escritorio en minutos.
2. Mantener un cálculo consistente (misma lógica/tarifa base cada vez).
3. Exportar la cotización como PDF con formato profesional, listo para enviar.
4. Guardar un historial local de cotizaciones para referencia futura.

## 4. Usuario

Un solo usuario: Williams. No requiere autenticación ni backend remoto — todo
corre y se guarda localmente en su máquina.

## 5. Alcance funcional (MVP)

### 5.1 Formulario de cotización
- Nombre del cliente / proyecto.
- Tipo de proyecto: Web / Escritorio / Web + Escritorio / Otro.
- Descripción breve del alcance.
- Lista de funcionalidades o módulos (ítems agregables dinámicamente), cada
  uno con:
  - Nombre de la funcionalidad
  - Horas estimadas (o complejidad: Baja/Media/Alta → mapeada a horas)
- Tarifa por hora (con un valor por defecto configurable).
- Cargos adicionales opcionales (ej. diseño UI, despliegue, mantenimiento
  mensual, urgencia).
- Descuento opcional (%, para clientes recurrentes o cortesía).
- Moneda (DOP / USD, con valor por defecto).

### 5.2 Cálculo
- Subtotal = Σ (horas por ítem × tarifa/hora).
- + Cargos adicionales.
- − Descuento.
- Total final.
- Vista previa en tiempo real del desglose antes de exportar.

### 5.3 Exportación a PDF
- Documento con: datos de Williams (nombre, contacto, opcional logo/portafolio),
  datos del cliente, fecha, número de cotización, tabla de ítems con horas y
  subtotales, total, condiciones (validez de la cotización, forma de pago,
  tiempo estimado de entrega).
- Guardar el PDF en una carpeta local elegida por el usuario.

### 5.4 Historial
- Listado de cotizaciones generadas (cliente, proyecto, fecha, total, estado:
  Enviada/Aceptada/Rechazada — editable manualmente).
- Poder reabrir/duplicar una cotización anterior como plantilla para una nueva.

### 5.5 Configuración
- Tarifa por hora por defecto.
- Datos del freelancer (nombre, email, teléfono, portafolio) para que
  aparezcan en el PDF.
- Moneda por defecto.

## 6. Fuera de alcance (por ahora)

- Multiusuario / cuentas / login.
- Sincronización en la nube o backend remoto.
- Envío automático de la cotización por email (se exporta el PDF y Williams lo
  envía manualmente).
- Facturación fiscal (NCF/DGII) — esto es solo cotización, no factura.
- Integración con Joha Acrílico, Invoice-app u otros proyectos — este proyecto
  es independiente por decisión explícita.

## 7. Stack técnico

- **Framework de escritorio:** [Tauri](https://tauri.app) (Rust en el backend
  nativo + WebView del sistema — instalador liviano, sin necesidad de escribir
  mucho Rust para este alcance).
- **Frontend:** React 19 + TypeScript + Vite.
- **Estilos:** Tailwind CSS 4.
- **Generación de PDF:** `@react-pdf/renderer` o `jsPDF` + `jspdf-autotable`
  (a decidir en implementación; ambas corren 100% en el frontend, sin
  necesidad de lógica en Rust).
- **Persistencia local:** SQLite embebido vía el plugin oficial
  `tauri-plugin-sql` (historial de cotizaciones y configuración), o como
  alternativa más simple para el MVP, un archivo JSON local gestionado desde
  Rust (`tauri-plugin-store`).
- **Formularios:** `react-hook-form` + `zod` (mismo patrón que usa en
  Invoice-app).

## 8. Estructura de carpetas propuesta

```
Calculadora-Tarifas/
  docs/
    PRD.md
  src/
    app/            layout, router, providers
    components/      formulario, tabla de ítems, vista previa
    features/
      quote/         lógica de cotización y cálculo
      history/        historial de cotizaciones
      settings/       configuración (tarifa, datos del freelancer)
      pdf/            generación del PDF
    lib/              cálculo, formato de moneda, storage
  src-tauri/          backend Rust + config de Tauri (se genera con
                       `npm create tauri-app`)
  README.md
```

## 9. Roadmap

- **Fase 0 — Setup:** Scaffold del proyecto con Tauri + React + TS + Tailwind,
  estructura de carpetas, repo Git.
- **Fase 1 — MVP:** Formulario de cotización + cálculo + vista previa.
- **Fase 2:** Exportación a PDF.
- **Fase 3:** Historial de cotizaciones (persistencia local).
- **Fase 4:** Configuración (tarifa por defecto, datos del freelancer, moneda).
- **Fase 5 (opcional, más adelante):** Plantillas de PDF, más de una moneda
  activa por cotización, gráficas simples de cotizaciones enviadas vs.
  aceptadas.

## 10. Criterios de éxito del MVP

- Williams puede armar una cotización completa (cliente + ítems + tarifa) en
  menos de 5 minutos.
- El PDF exportado se ve profesional y es enviable directamente a un cliente
  sin edición manual adicional.
- El historial permite reabrir y reutilizar cotizaciones pasadas como base
  para nuevas.
