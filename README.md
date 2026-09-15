# 🧮 Calculadora de Tarifas

App de escritorio para cotizar proyectos de desarrollo de software
freelance en minutos: llenas un formulario, ves el total calculándose en
vivo, y le das a un botón para generar un PDF profesional listo para
enviarle al cliente. Es una herramienta **personal, de un solo usuario**
(sin cuentas, sin nube) — todo corre y se guarda localmente en tu máquina.

Construida con [Tauri](https://tauri.app), React y TypeScript. El plan
funcional original está en [`docs/PRD.md`](docs/PRD.md); este README
cubre qué tiene la app hoy y cómo usarla/desarrollarla.

## ✨ Funciones

### Cotizar
- **Cliente y proyecto**: nombre del cliente/empresa, contacto, nombre y
  tipo de proyecto (Web, Web App, App Móvil, Escritorio, Web + Escritorio,
  SaaS, E-commerce, CRM, API/Integración, Automatización, IA, Otro),
  descripción del alcance.
- **Plantillas automáticas**: al elegir el tipo de proyecto, la lista de
  funcionalidades se rellena sola con ítems y horas típicas de ese tipo de
  trabajo (editable después, no es obligatorio usarla).
- **Ítems dinámicos**: agrega o quita funcionalidades/módulos con horas
  estimadas, o elige un nivel de complejidad (Baja/Media/Alta) que sugiere
  las horas por ti.
- **Multiplicadores de complejidad**: recargos porcentuales opcionales
  sobre la mano de obra — infraestructura cloud/Kubernetes (+15%),
  seguridad y cumplimiento (+20%), CI/CD (+10%), entrega urgente (+25%),
  IA/ML (+15%). Se ven reflejados en la vista previa y en el PDF, con el
  detalle de qué los compone.
- **Cargos adicionales**: línea(s) de monto fijo para cosas como diseño UI,
  despliegue, mantenimiento, etc.
- **Descuento** opcional en porcentaje.
- **Niveles de alcance** de referencia (MVP, Producción core, Enterprise)
  que comparan tus horas totales contra rangos típicos, sin restringir
  nada — solo para orientarte.
- **Vista previa en vivo**: desglose completo (horas, subtotal de mano de
  obra, complejidad, cargos, descuento) y el total destacado, actualizado
  mientras escribes.

### Moneda
- Cotiza en **DOP o USD**.
- **Conversión automática**: al cambiar la moneda del formulario, la
  tarifa por hora se recalcula sola usando una tasa de cambio que
  configuras en Configuración (ej. 1 USD = 58.83 DOP).

### Clientes
- Cada cliente que cotizas queda **guardado automáticamente** (nombre +
  contacto) — la próxima vez que te pida un proyecto, lo eliges de una
  lista en vez de volver a escribir sus datos.
- Pantalla de Clientes para verlos, agregar uno a mano, o borrar alguno.

### PDF
- Genera un documento profesional con tus datos, los del cliente, tabla de
  ítems con subtotales, cargos, multiplicadores aplicados, total, y
  condiciones (forma de pago, tiempo de entrega, vigencia de 15 días).
- Se guarda solo en `Documentos/Cotizaciones` — no hay que elegir carpeta
  cada vez.
- Diseño propio (tipografías Space Grotesk / IBM Plex Sans / Roboto Mono,
  acento azul) — deliberadamente distinto al de la app, para que se sienta
  como un documento aparte y no como una captura de pantalla del programa.

### Historial
- Cada cotización generada queda registrada: cliente, proyecto, fecha,
  total y estado (Enviada / Aceptada / Rechazada, editable con un clic).
- **Duplicar** una cotización anterior la reabre como plantilla para una
  nueva, con todos sus datos.

### Configuración
- Tarifa por hora y moneda por defecto para cotizaciones nuevas.
- Tasa de cambio DOP↔USD.
- Tus datos como freelancer (nombre, email, teléfono, portafolio) para que
  salgan en el PDF.

### La interfaz
- Identidad visual propia, pensada para un desarrollador: fondo oscuro
  tipo terminal/editor de código, tipografía monoespaciada (JetBrains
  Mono) en toda la app, un solo acento ámbar, y el total de la cotización
  presentado como el display de una calculadora.

## 🛠️ Stack técnico

| Capa | Tecnología |
|---|---|
| Escritorio | [Tauri 2](https://tauri.app) (Rust + WebView del sistema) |
| Frontend | React 19 + TypeScript + Vite |
| Estilos | Tailwind CSS 4 |
| Formularios | `react-hook-form` + `zod` |
| PDF | `@react-pdf/renderer` |
| Persistencia | SQLite vía `tauri-plugin-sql` |

## 📦 Instalación (uso normal)

Si solo quieres **usar** la app (no desarrollarla), descarga el
instalador más reciente desde la sección
[Releases](https://github.com/willrd14/Calculadora-Tarifas/releases) de
este repositorio y corre el `.exe` (NSIS) o el `.msi`. Queda instalada
como cualquier programa de Windows, con su ícono en el menú de inicio y
su desinstalador — no hace falta terminal ni Node/Rust para usarla.

## 💻 Desarrollo

Requiere [Node.js](https://nodejs.org) y el
[toolchain de Rust](https://tauri.app/start/prerequisites/) instalados.

```bash
npm install
npm run tauri dev     # levanta la app en modo desarrollo (hot reload)
```

Otros comandos útiles:

```bash
npm run build          # type-check + build del frontend (sin Rust)
npm run tauri build     # compila el instalador de producción
```

En `src-tauri`, `cargo check` valida el backend sin abrir la ventana de la
app.

## 📁 Estructura

```
Calculadora-Tarifas/
  docs/
    PRD.md              plan funcional original
  src/
    app/                App.tsx — shell, pestañas
    components/         FormField, listas de ítems/cargos, vista previa
    features/
      quote/             formulario, cálculo, plantillas, multiplicadores
      history/            historial de cotizaciones (SQLite)
      clients/             clientes guardados (SQLite)
      settings/            configuración (SQLite)
      pdf/                 generación del documento PDF
    lib/                cálculo puro, moneda, fecha, conexión SQLite
  src-tauri/            backend Rust: comandos, plugins, migraciones SQL
  Template/             diseño de referencia del PDF (no se importa en código)
```
Proyecto personal de [Williams Villavizar](https://portafolio.w-tech.uk).
