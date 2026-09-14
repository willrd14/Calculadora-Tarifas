# CLAUDE.md

Contexto de proyecto para Claude Code. Ver el plan completo en
[`docs/PRD.md`](docs/PRD.md).

## Estado actual

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

**Siguiente paso (Fase 1 — MVP):** formulario de cotización + cálculo + vista
previa en tiempo real, en `src/features/quote` + `src/components`.

## Notas importantes

- Rust se instaló *después* de que algunas terminales ya estuvieran abiertas.
  Si `cargo`/`rustc`/`npm run tauri dev` no se reconocen, abre una terminal
  nueva para que tome el PATH de usuario actualizado.
- `npm run build` (tsc + vite build) valida el frontend sin necesitar Rust.
  `cargo check` en `src-tauri` valida el backend sin abrir la ventana de la
  app.
