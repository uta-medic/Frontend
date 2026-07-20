export interface QuickAction {
  id: string;
  label: string;
  description: string;
  prompt: string;
  shortCode: string;
}

export const USER_WELCOME_MESSAGE =
  'Hola, soy el Asistente Utamedic. Puedo ayudarte a encontrar servicios de salud o brindarte orientación general. ¿Qué necesitas consultar?';

export const USER_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'specialty',
    label: 'Buscar especialidad',
    description: 'Encuentra el tipo de atención que necesitas.',
    prompt: '¿Qué centros tienen cardiología?',
    shortCode: 'ES',
  },
  {
    id: 'center',
    label: 'Buscar centro médico',
    description: 'Consulta centros y zonas de atención.',
    prompt: 'Quiero buscar un centro médico por zona.',
    shortCode: 'CM',
  },
  {
    id: 'cost',
    label: 'Consultar costos',
    description: 'Revisa precios referenciales disponibles.',
    prompt: '¿Cuánto cuesta una consulta de dermatología?',
    shortCode: 'CO',
  },
  {
    id: 'schedule',
    label: 'Consultar horarios',
    description: 'Verifica días y horarios de atención.',
    prompt: '¿Qué centros atienden los sábados?',
    shortCode: 'HO',
  },
  {
    id: 'service',
    label: 'Buscar análisis o servicio',
    description: 'Busca laboratorios y servicios médicos.',
    prompt: '¿Dónde puedo realizarme un análisis de glucosa?',
    shortCode: 'AS',
  },
  {
    id: 'symptoms',
    label: 'Orientación por síntomas',
    description: 'Conoce qué especialidad podría orientarte.',
    prompt:
      'Tengo dolor persistente en la rodilla. ¿A qué especialidad debería acudir?',
    shortCode: 'OS',
  },
];
