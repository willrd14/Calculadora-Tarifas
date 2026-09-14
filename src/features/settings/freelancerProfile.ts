export interface FreelancerProfile {
  name: string;
  email: string;
  phone: string;
  portfolio: string;
}

/**
 * Datos del freelancer que aparecen en el PDF. Es un placeholder hasta que
 * exista la pantalla de Configuración (Fase 4) — edita estos valores a mano
 * mientras tanto, o reemplaza este archivo cuando se construya esa fase.
 */
export const freelancerProfile: FreelancerProfile = {
  name: "Williams",
  email: "",
  phone: "",
  portfolio: "",
};
