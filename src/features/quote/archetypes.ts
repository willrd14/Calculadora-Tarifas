import type { ComplexityLevel } from "./schema";

export interface ArchetypeItem {
  name: string;
  complexity: ComplexityLevel;
  hours: number;
}

export interface ProjectArchetype {
  id: string;
  label: string;
  items: ArchetypeItem[];
}

/**
 * Plantillas de arranque rápido: al elegir una, reemplaza la lista de
 * funcionalidades con ítems y horas típicas para ese tipo de proyecto
 * (editables después). Puramente una ayuda de UI — no se guarda en la
 * cotización ni en el historial.
 */
export const PROJECT_ARCHETYPES: ProjectArchetype[] = [
  {
    id: "web_app",
    label: "Web app (Next.js / Node / Postgres)",
    items: [
      { name: "Autenticación y gestión de usuarios", complexity: "Media", hours: 16 },
      { name: "API backend (Node + Postgres)", complexity: "Alta", hours: 40 },
      { name: "Interfaz de usuario (Next.js)", complexity: "Media", hours: 32 },
      { name: "Despliegue y configuración inicial", complexity: "Baja", hours: 8 },
    ],
  },
  {
    id: "microservices",
    label: "Microservicios en la nube",
    items: [
      { name: "Diseño de servicios y contratos gRPC", complexity: "Alta", hours: 20 },
      { name: "Implementación de servicios", complexity: "Alta", hours: 60 },
      { name: "Orquestación de contenedores", complexity: "Media", hours: 16 },
    ],
  },
  {
    id: "mobile",
    label: "App móvil (React Native)",
    items: [
      { name: "Pantallas principales y navegación", complexity: "Media", hours: 32 },
      { name: "Integración con backend/API", complexity: "Media", hours: 20 },
      { name: "Publicación en tiendas (App Store / Play Store)", complexity: "Baja", hours: 8 },
    ],
  },
  {
    id: "data_pipeline",
    label: "Pipeline de datos / analítica",
    items: [
      { name: "Ingesta y transformación de datos (ETL)", complexity: "Alta", hours: 32 },
      { name: "Modelado y almacenamiento de datos", complexity: "Media", hours: 20 },
      { name: "Dashboards y reportes", complexity: "Media", hours: 16 },
    ],
  },
];
