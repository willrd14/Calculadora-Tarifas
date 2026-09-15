export interface ScopeTier {
  id: string;
  label: string;
  minHours: number;
  maxHours: number;
}

/** Referencia rápida de tamaño de proyecto — no se guarda, solo orienta mientras armas los ítems. */
export const SCOPE_TIERS: ScopeTier[] = [
  { id: "mvp", label: "MVP", minHours: 40, maxHours: 120 },
  { id: "core", label: "Producción core", minHours: 160, maxHours: 320 },
  { id: "enterprise", label: "Enterprise", minHours: 320, maxHours: 800 },
];
