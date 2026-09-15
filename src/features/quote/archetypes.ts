import type { ComplexityLevel, ProjectType } from "./schema";

export interface ArchetypeItem {
  name: string;
  complexity: ComplexityLevel;
  hours: number;
}

export interface ProjectArchetype {
  id: string;
  label: string;
  /** Al aplicar la plantilla, también fija "Tipo de proyecto" a este valor. */
  projectType: ProjectType;
  items: ArchetypeItem[];
}

/**
 * Plantillas de arranque rápido: al elegir una, reemplaza la lista de
 * funcionalidades con ítems y horas típicas para ese tipo de proyecto
 * (editables después) y fija "Tipo de proyecto" al valor correspondiente.
 * Puramente una ayuda de UI — no se guarda en la cotización ni en el
 * historial. Una por cada `PROJECT_TYPES` (menos "Otro", que no tiene un
 * patrón típico).
 */
export const PROJECT_ARCHETYPES: ProjectArchetype[] = [
  {
    id: "web",
    label: "Web (sitio informativo / landing)",
    projectType: "Web",
    items: [
      { name: "Diseño y maquetación de páginas principales", complexity: "Media", hours: 12 },
      { name: "Adaptación responsive (móvil/tablet)", complexity: "Baja", hours: 8 },
      { name: "Formulario de contacto y validaciones", complexity: "Baja", hours: 4 },
      { name: "SEO básico y optimización de rendimiento", complexity: "Baja", hours: 6 },
      { name: "Despliegue y configuración de dominio", complexity: "Baja", hours: 3 },
    ],
  },
  {
    id: "web_app",
    label: "Web App (Next.js / Node / Postgres)",
    projectType: "Web App",
    items: [
      { name: "Autenticación y gestión de usuarios", complexity: "Media", hours: 16 },
      { name: "API backend (Node + Postgres)", complexity: "Alta", hours: 40 },
      { name: "Interfaz de usuario (Next.js)", complexity: "Media", hours: 32 },
      { name: "Despliegue y configuración inicial", complexity: "Baja", hours: 8 },
    ],
  },
  {
    id: "mobile",
    label: "App Móvil (React Native)",
    projectType: "App Móvil",
    items: [
      { name: "Pantallas principales y navegación", complexity: "Media", hours: 32 },
      { name: "Integración con backend/API", complexity: "Media", hours: 20 },
      { name: "Notificaciones push", complexity: "Baja", hours: 8 },
      { name: "Publicación en tiendas (App Store / Play Store)", complexity: "Baja", hours: 8 },
    ],
  },
  {
    id: "desktop",
    label: "Escritorio (Tauri / Electron)",
    projectType: "Escritorio",
    items: [
      { name: "Interfaz de usuario principal", complexity: "Media", hours: 24 },
      { name: "Persistencia local (SQLite / archivos)", complexity: "Media", hours: 16 },
      { name: "Empaquetado e instaladores (Win/Mac/Linux)", complexity: "Media", hours: 10 },
      { name: "Actualizaciones automáticas", complexity: "Baja", hours: 8 },
    ],
  },
  {
    id: "web_desktop",
    label: "Web + Escritorio",
    projectType: "Web + Escritorio",
    items: [
      { name: "Núcleo compartido (lógica de negocio)", complexity: "Alta", hours: 24 },
      { name: "Interfaz web", complexity: "Media", hours: 24 },
      { name: "Interfaz de escritorio", complexity: "Media", hours: 24 },
      { name: "Sincronización de datos entre plataformas", complexity: "Alta", hours: 16 },
    ],
  },
  {
    id: "saas",
    label: "SaaS",
    projectType: "SaaS",
    items: [
      { name: "Autenticación multi-usuario y organizaciones", complexity: "Alta", hours: 24 },
      { name: "Suscripciones y facturación (Stripe)", complexity: "Alta", hours: 24 },
      { name: "Panel de administración", complexity: "Media", hours: 20 },
      { name: "Onboarding y planes de uso", complexity: "Media", hours: 12 },
    ],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    projectType: "E-commerce",
    items: [
      { name: "Catálogo de productos y carrito", complexity: "Media", hours: 24 },
      { name: "Pasarela de pagos", complexity: "Alta", hours: 16 },
      { name: "Gestión de pedidos e inventario", complexity: "Media", hours: 20 },
      { name: "Panel de administración", complexity: "Media", hours: 16 },
    ],
  },
  {
    id: "crm",
    label: "CRM",
    projectType: "CRM",
    items: [
      { name: "Gestión de contactos y clientes", complexity: "Media", hours: 20 },
      { name: "Pipeline de ventas / oportunidades", complexity: "Alta", hours: 24 },
      { name: "Reportes y dashboards", complexity: "Media", hours: 16 },
      { name: "Roles y permisos de usuario", complexity: "Media", hours: 12 },
    ],
  },
  {
    id: "api_integration",
    label: "API / Integración",
    projectType: "API / Integración",
    items: [
      { name: "Diseño de endpoints y documentación (OpenAPI)", complexity: "Media", hours: 12 },
      { name: "Implementación de la API", complexity: "Alta", hours: 32 },
      { name: "Integración con servicio(s) externo(s)", complexity: "Media", hours: 16 },
      { name: "Pruebas y manejo de errores", complexity: "Media", hours: 10 },
    ],
  },
  {
    id: "automation",
    label: "Automatización",
    projectType: "Automatización",
    items: [
      { name: "Análisis del proceso a automatizar", complexity: "Baja", hours: 6 },
      { name: "Desarrollo del script / bot", complexity: "Media", hours: 20 },
      { name: "Programación de tareas (cron / triggers)", complexity: "Baja", hours: 6 },
      { name: "Monitoreo y manejo de errores", complexity: "Media", hours: 8 },
    ],
  },
  {
    id: "ai",
    label: "IA",
    projectType: "IA",
    items: [
      { name: "Preparación e ingesta de datos", complexity: "Media", hours: 16 },
      { name: "Integración de modelo/LLM (API o embeddings)", complexity: "Alta", hours: 24 },
      { name: "Interfaz para interactuar con el modelo", complexity: "Media", hours: 16 },
      { name: "Pruebas y ajuste de prompts/resultados", complexity: "Media", hours: 12 },
    ],
  },
];
