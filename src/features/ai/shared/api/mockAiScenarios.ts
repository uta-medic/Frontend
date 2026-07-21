import { AiApiError } from './aiApi.errors';
import type {
  AssistantChatMessage,
  HealthCenter,
  InformationSource,
  SendMessageInput,
  SuggestedSpecialty,
} from '../types/ai.types';

interface MockScenario {
  id: string;
  matches: (normalizedMessage: string) => boolean;
  response: Omit<AssistantChatMessage, 'id' | 'createdAt'> | AiApiError;
}

const directorySource: InformationSource = {
  id: 'mock-directory-2026',
  title: 'Directorio demostrativo de servicios Utamedic',
  type: 'Datos simulados de desarrollo',
  updatedAt: '2026-07-19',
};

const cardiologyCenter: HealthCenter = {
  id: 'mock-center-horizonte',
  name: 'Centro Médico Horizonte',
  type: 'Centro ambulatorio ficticio',
  address: 'Avenida Demostración 120',
  zone: 'Zona Norte (simulada)',
  specialties: ['Cardiología', 'Medicina interna'],
  services: ['Consulta cardiológica', 'Electrocardiograma'],
  schedules: [
    {
      day: 'Lunes a viernes',
      startTime: '08:00',
      endTime: '17:00',
      isAvailable: true,
      notes: 'Horario simulado; confirmar con el centro.',
    },
  ],
  availability: 'available',
};

const saturdayCenter: HealthCenter = {
  id: 'mock-center-amanecer',
  name: 'Clínica Ambulatoria Amanecer',
  type: 'Clínica ficticia',
  address: 'Calle Ejemplo 45',
  zone: 'Zona Central (simulada)',
  specialties: ['Medicina general', 'Dermatología'],
  schedules: [
    {
      day: 'Sábado',
      startTime: '08:30',
      endTime: '12:30',
      isAvailable: true,
      notes: 'Atención demostrativa con cupos limitados.',
    },
    {
      day: 'Domingo',
      isAvailable: false,
      notes: 'Sin atención programada.',
    },
  ],
  availability: 'limited',
};

const dermatologyCenter: HealthCenter = {
  id: 'mock-center-bienestar',
  name: 'Consultorios Bienestar',
  type: 'Consultorio ficticio',
  address: 'Paseo Referencial 18',
  zone: 'Zona Sur (simulada)',
  specialties: ['Dermatología'],
  costs: [
    {
      service: 'Consulta de dermatología',
      amount: 180,
      currency: 'BOB',
      isSimulated: true,
    },
  ],
  availability: 'available',
};

const laboratoryCenter: HealthCenter = {
  id: 'mock-center-vida-clara',
  name: 'Laboratorio Vida Clara',
  type: 'Laboratorio ficticio',
  address: 'Calle Simulación 77',
  zone: 'Zona Oeste (simulada)',
  services: ['Análisis de glucosa', 'Perfil lipídico'],
  schedules: [
    {
      day: 'Lunes a sábado',
      startTime: '07:00',
      endTime: '13:00',
      isAvailable: true,
      notes: 'Consultar previamente requisitos de preparación.',
    },
  ],
  costs: [
    {
      service: 'Análisis de glucosa',
      currency: 'BOB',
      isSimulated: true,
    },
  ],
  availability: 'available',
};

const traumatologySuggestion: SuggestedSpecialty = {
  id: 'mock-specialty-traumatology',
  name: 'Traumatología',
  description:
    'Área médica que evalúa lesiones y molestias del sistema musculoesquelético.',
  reason:
    'Podría ser una opción para la evaluación general de dolor persistente en articulaciones.',
};

function includesAny(message: string, terms: string[]) {
  return terms.some((term) => message.includes(term));
}

export function normalizeMockMessage(message: string) {
  return message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export const mockAiScenarios: MockScenario[] = [
  {
    id: 'simulated-error',
    matches: (message) => message.includes('simular error'),
    response: new AiApiError(
      'Ocurrió un error simulado durante la consulta.',
      'general',
    ),
  },
  {
    id: 'agent-unavailable',
    matches: (message) => message.includes('agente no disponible'),
    response: new AiApiError(
      'El agente no está disponible en este momento. Inténtalo más tarde.',
      'unavailable',
      503,
    ),
  },
  {
    id: 'rate-limit',
    matches: (message) => message.includes('limite de consultas'),
    response: new AiApiError(
      'Se alcanzó el límite temporal de consultas. Espera un momento antes de reintentar.',
      'rate-limit',
      429,
    ),
  },
  {
    id: 'emergency-warning',
    matches: (message) =>
      includesAny(message, [
        'dolor de pecho',
        'perdida de conciencia',
        'sangrado intenso',
        'convulsion',
        'dificultad respiratoria severa',
        'problemas para hablar',
        'debilidad subita',
      ]),
    response: {
      role: 'assistant',
      responseType: 'emergency-warning',
      content:
        'Lo que describes puede requerir atención inmediata. No puedo confirmar una causa o diagnóstico mediante este chat.',
      emergencyWarning:
        'Busca atención médica inmediata o comunícate con el servicio de emergencias de tu localidad. No permanezcas sin compañía si necesitas ayuda.',
      requiresMedicalEvaluation: true,
    },
  },
  {
    id: 'no-results',
    matches: (message) => message.includes('sin resultados'),
    response: {
      role: 'assistant',
      responseType: 'health-center-search',
      content:
        'No encontré coincidencias para esa búsqueda en los datos de demostración. Puedes probar otra zona o servicio.',
      noResults: true,
    },
  },
  {
    id: 'knee-guidance',
    matches: (message) => includesAny(message, ['rodilla', 'traumatologia']),
    response: {
      role: 'assistant',
      responseType: 'symptom-guidance',
      content:
        'Esta orientación no es un diagnóstico. Por tratarse de dolor persistente en la rodilla, conviene una evaluación profesional para conocer la causa.',
      requiresMedicalEvaluation: true,
      suggestedSpecialties: [traumatologySuggestion],
      healthCenters: [saturdayCenter],
      sources: [directorySource],
    },
  },
  {
    id: 'glucose-service',
    matches: (message) => includesAny(message, ['glucosa', 'analisis']),
    response: {
      role: 'assistant',
      responseType: 'medical-service-search',
      content:
        'Encontré una opción ficticia en los datos de demostración para realizar un análisis de glucosa.',
      healthCenters: [laboratoryCenter],
      sources: [directorySource],
    },
  },
  {
    id: 'dermatology-cost',
    matches: (message) =>
      message.includes('dermatologia') &&
      includesAny(message, ['costo', 'cuanto', 'precio']),
    response: {
      role: 'assistant',
      responseType: 'price-information',
      content:
        'Este es un precio simulado para la demostración. Debe confirmarse directamente con el centro antes de la atención.',
      healthCenters: [dermatologyCenter],
      sources: [directorySource],
    },
  },
  {
    id: 'saturday-schedule',
    matches: (message) => includesAny(message, ['sabado', 'horario']),
    response: {
      role: 'assistant',
      responseType: 'schedule-information',
      content:
        'Encontré un horario sabatino ficticio para demostrar cómo se presentará esta información.',
      healthCenters: [saturdayCenter],
      sources: [directorySource],
    },
  },
  {
    id: 'cardiology-search',
    matches: (message) => message.includes('cardiolog'),
    response: {
      role: 'assistant',
      responseType: 'health-center-search',
      content:
        'Encontré un centro ficticio con cardiología en el directorio de demostración.',
      healthCenters: [cardiologyCenter],
      sources: [directorySource],
    },
  },
  {
    id: 'general',
    matches: () => true,
    response: {
      role: 'assistant',
      responseType: 'general',
      content:
        'Puedo ayudarte con centros, especialidades, horarios, costos, análisis y orientación general. Los datos mostrados en este modo son simulados.',
      sources: [directorySource],
    },
  },
];

export function createMockResponse(input: SendMessageInput): AssistantChatMessage {
  const normalizedMessage = normalizeMockMessage(input.message);
  const scenario = mockAiScenarios.find(({ matches }) => matches(normalizedMessage));
  const response = scenario?.response;

  if (!response) {
    throw new AiApiError('No existe un escenario mock para esta consulta.');
  }

  if (response instanceof AiApiError) throw response;

  return {
    ...response,
    id: `mock-${scenario.id}-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
}
