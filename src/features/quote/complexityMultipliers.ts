export interface ComplexityMultiplier {
  id: string;
  label: string;
  percent: number;
}

/**
 * Trabajo extra que compuesta sobre el costo de mano de obra (no sobre
 * cargos adicionales) — infraestructura, cumplimiento, urgencia, etc. Se
 * suman los % de los seleccionados y se aplican en `calculateQuote()`.
 */
export const COMPLEXITY_MULTIPLIERS: ComplexityMultiplier[] = [
  {
    id: "cloud_infra",
    label: "Infraestructura cloud / Kubernetes",
    percent: 15,
  },
  {
    id: "compliance",
    label: "Seguridad y cumplimiento (SOC2, GDPR)",
    percent: 20,
  },
  { id: "cicd", label: "CI/CD y pruebas automatizadas", percent: 10 },
  { id: "rush", label: "Entrega urgente (rush)", percent: 25 },
  { id: "ai_ml", label: "IA / Machine learning", percent: 15 },
];

export function sumComplexityMultipliers(ids: string[]): number {
  return COMPLEXITY_MULTIPLIERS.filter((multiplier) =>
    ids.includes(multiplier.id),
  ).reduce((total, multiplier) => total + multiplier.percent, 0);
}
