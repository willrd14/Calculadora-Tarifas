# Calculadora de Tarifas

App de escritorio (Tauri + React) de uso personal para cotizar proyectos de
desarrollo de software freelance (web o escritorio) y exportar la cotización
como PDF. Ver el detalle completo en [`docs/PRD.md`](docs/PRD.md).

## Stack

- [Tauri 2](https://tauri.app) (backend nativo en Rust + WebView del sistema)
- React 19 + TypeScript + Vite
- Tailwind CSS 4
- `react-hook-form` + `zod` (`@hookform/resolvers`) para formularios

## Estructura

```
src/
  app/            layout, router, providers
  components/     formulario, tabla de ítems, vista previa
  features/
    quote/        lógica de cotización y cálculo
    history/      historial de cotizaciones
    settings/     configuración (tarifa, datos del freelancer)
    pdf/          generación del PDF
  lib/            cálculo, formato de moneda, storage
src-tauri/        backend Rust + configuración de Tauri
```

## Desarrollo

Requiere Node.js y el [toolchain de Rust](https://tauri.app/start/prerequisites/)
instalado.

```bash
npm install
npm run tauri dev
```
