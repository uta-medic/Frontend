import { AiApiError } from '../shared/api/aiApi.errors';
import type {
  AssistantChatMessage,
  DemoPatient,
  SendMessageInput,
} from '../shared/types/ai.types';
import { normalizeMockMessage } from '../shared/api/mockAiScenarios';

function listOrFallback(items: string[], fallback: string) {
  return items.length > 0 ? items.join('; ') : fallback;
}

function patientFromContext(input: SendMessageInput, patients: DemoPatient[]) {
  return patients.find(
    (patient) => patient.patientId === input.context?.patientId,
  );
}

export function createDoctorMockChatResponse(
  input: SendMessageInput,
  patients: DemoPatient[],
): AssistantChatMessage {
  const message = normalizeMockMessage(input.message);

  if (message.includes('simular 403')) {
    throw new AiApiError(
      'El modo demo simuló una respuesta 403 del backend.',
      'forbidden',
      403,
    );
  }

  if (message.includes('agente medico no disponible')) {
    throw new AiApiError(
      'El agente médico no está disponible en este momento.',
      'unavailable',
      503,
    );
  }

  if (message.includes('simular timeout')) {
    throw new AiApiError(
      'La solicitud excedió el tiempo de espera configurado.',
      'timeout',
    );
  }

  if (message.includes('respuesta invalida')) {
    throw new AiApiError(
      'El backend devolvió una respuesta clínica inválida.',
      'invalid-response',
    );
  }

  const patient = patientFromContext(input, patients);
  if (!patient) {
    throw new AiApiError(
      'No se encontró el contexto demo seleccionado.',
      'invalid-response',
    );
  }

  let content =
    'Puedo organizar la información del contexto demo seleccionado para revisión profesional.';

  if (message.includes('alertas')) {
    content = listOrFallback(
      patient.alerts.map((alert) => `${alert.title}: ${alert.description}`),
      'No hay alertas documentadas en el contexto demo actual.',
    );
  } else if (message.includes('alergias')) {
    content = listOrFallback(
      patient.allergies.map(
        (allergy) =>
          `${allergy.substance}: ${allergy.reaction ?? 'reacción no disponible'}`,
      ),
      'No hay alergias documentadas en el contexto demo actual.',
    );
  } else if (message.includes('medicamentos')) {
    content = listOrFallback(
      patient.activeMedications.map(
        (medication) =>
          `${medication.name}, ${medication.documentedDose ?? 'dosis no disponible'}, ${medication.status}`,
      ),
      'No hay medicamentos activos documentados.',
    );
  } else if (message.includes('consultas')) {
    content = listOrFallback(
      patient.recentConsultations.map(
        (consultation) =>
          `${consultation.date}, ${consultation.specialty}: ${consultation.summary}`,
      ),
      'No hay consultas recientes documentadas.',
    );
  } else if (message.includes('laboratorio')) {
    content = listOrFallback(
      patient.recentLaboratoryResults.map(
        (result) =>
          `${result.test}: ${result.value ?? result.status}${result.unit ? ` ${result.unit}` : ''}`,
      ),
      'No hay resultados recientes documentados.',
    );
  } else if (message.includes('faltante')) {
    content = listOrFallback(
      patient.missingInformation,
      'No se identificó información faltante en el contexto demo.',
    );
  } else if (message.includes('contradictoria')) {
    content = listOrFallback(
      patient.contradictions.map(
        (contradiction) =>
          `${contradiction.description} ${contradiction.reviewMessage}`,
      ),
      'No se identificaron contradicciones en el contexto demo.',
    );
  } else if (message.includes('preguntas')) {
    content =
      'Preguntas sugeridas para revisión: ¿cuándo comenzaron los síntomas?, ¿qué los modifica?, ¿se verificó la adherencia a los tratamientos registrados?';
  }

  return {
    id: `mock-doctor-${Date.now()}`,
    role: 'assistant',
    responseType: 'general',
    content,
    createdAt: new Date().toISOString(),
  };
}
