export interface FreelancerProfile {
  name: string;
  email: string;
  phone: string;
  portfolio: string;
}

/**
 * Datos del freelancer que aparecen en el PDF. Están fijos aquí hasta que
 * exista la pantalla de Configuración (Fase 4) — edítalos a mano mientras
 * tanto, o reemplaza este archivo cuando se construya esa fase.
 */
export const freelancerProfile: FreelancerProfile = {
  name: "Williams Rafael Villavizar Hernandez",
  email: "williamsvillavizar204@gmail.com",
  phone: "849-653-1360",
  portfolio: "portafolio.w-tech.uk",
};
