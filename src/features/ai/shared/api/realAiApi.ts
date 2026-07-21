import { httpClient } from '../../../../config/httpClient';
import type {
  AiApiProvider,
  AssistantChatMessage,
  ClinicalDifferentialResult,
  ClinicalSummary,
  SendMessageInput,
} from '../types/ai.types';
import { AiApiError, toAiApiError } from './aiApi.errors';
import { MOCK_DOCTOR_USER_ID } from '../../doctor-agent/doctorAgent.config';

interface DoctorAnalyzeResponse {
  patientId: string;
  patientName?: string;
  answer: string;
  generatedAt: string;
  disclaimer: string;
}

interface UserAiChatResponse {
  answer: string;
  generatedAt: string;
  disclaimer?: string;
}

// La baseURL ya contiene /api/v1.
const proposedUserPaths = {
  chat: '/user-ai/chat',
};

// CONTRATO PROPUESTO Y NO VERIFICADO para el copiloto clínico.
const proposedDoctorPaths = {
  analyze: '/doctor-ai/analyze',
  summary: (patientId: string) =>
    `/ai/doctor/patients/${encodeURIComponent(patientId)}/summary`,
  differential: (patientId: string) =>
    `/ai/doctor/patients/${encodeURIComponent(patientId)}/differential`,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isUserAiChatResponse(value: unknown): value is UserAiChatResponse {
  return (
    isRecord(value) &&
    typeof value.answer === 'string' &&
    typeof value.generatedAt === 'string'
  );
}

function isDoctorAnalyzeResponse(
  value: unknown,
): value is DoctorAnalyzeResponse {
  return (
    isRecord(value) &&
    typeof value.patientId === 'string' &&
    (value.patientName === undefined || typeof value.patientName === 'string') &&
    typeof value.answer === 'string' &&
    typeof value.generatedAt === 'string' &&
    typeof value.disclaimer === 'string'
  );
}

function createAssistantMessageFromDoctorResponse(
  data: DoctorAnalyzeResponse,
): AssistantChatMessage {
  return {
    id: `doctor-ai-${data.generatedAt}-${Math.random().toString(16).slice(2)}`,
    role: 'assistant',
    content: `${data.answer}\n\n**Aviso:** ${data.disclaimer}`,
    responseType: 'general',
    requiresMedicalEvaluation: true,
    createdAt: data.generatedAt,
  };
}

function createAssistantMessageFromUserResponse(
  data: UserAiChatResponse,
): AssistantChatMessage {
  const content = data.disclaimer
    ? `${data.answer}\n\n**Aviso:** ${data.disclaimer}`
    : data.answer;

  return {
    id: `user-ai-${data.generatedAt}-${Math.random().toString(16).slice(2)}`,
    role: 'assistant',
    content,
    responseType: 'general',
    createdAt: data.generatedAt,
  };
}

function formatLocation(context: SendMessageInput['context']) {
  if (!context) return undefined;

  if (context.manualZone) {
    return context.manualZone;
  }

  if (context.location) {
    return `${context.location.latitude}, ${context.location.longitude}`;
  }

  return undefined;
}

function isClinicalSummary(value: unknown): value is ClinicalSummary {
  return (
    isRecord(value) &&
    typeof value.patientId === 'string' &&
    typeof value.summary === 'string' &&
    Array.isArray(value.alerts) &&
    Array.isArray(value.allergies) &&
    Array.isArray(value.activeConditions) &&
    Array.isArray(value.activeMedications) &&
    Array.isArray(value.recentConsultations) &&
    Array.isArray(value.recentLaboratoryResults) &&
    Array.isArray(value.recentVitalSigns) &&
    Array.isArray(value.missingInformation) &&
    Array.isArray(value.contradictions) &&
    Array.isArray(value.sources) &&
    value.requiresProfessionalReview === true &&
    typeof value.generatedAt === 'string'
  );
}

function isDifferentialResult(
  value: unknown,
): value is ClinicalDifferentialResult {
  return (
    isRecord(value) &&
    Array.isArray(value.possibilities) &&
    Array.isArray(value.supportingElements) &&
    Array.isArray(value.missingOrContradictoryData) &&
    Array.isArray(value.suggestedQuestions) &&
    Array.isArray(value.warningSigns) &&
    Array.isArray(value.sources) &&
    typeof value.disclaimer === 'string' &&
    value.requiresProfessionalReview === true &&
    typeof value.generatedAt === 'string'
  );
}

export const realAiApi: AiApiProvider = {
  async sendMessage(input, options) {
    try {
      if (input.agent === 'doctor') {
        const { data } = await httpClient.post<DoctorAnalyzeResponse>(
          proposedDoctorPaths.analyze,
          {
            patientId: input.context?.patientId,
            question: input.message,
          },
          {
            headers: { 'x-doctor-user-id': MOCK_DOCTOR_USER_ID },
            signal: options?.signal,
            timeout: 90_000,
          },
        );

        if (!isDoctorAnalyzeResponse(data)) {
          throw new AiApiError(
            'El backend devolvió una respuesta de IA inválida.',
            'invalid-response',
          );
        }

        return {
          conversationId:
            input.conversationId ?? `doctor-ai-conversation-${Date.now()}`,
          message: createAssistantMessageFromDoctorResponse(data),
        };
      }

      const conversationId =
        input.conversationId ?? `user-ai-conversation-${Date.now()}`;
      const { data } = await httpClient.post<UserAiChatResponse>(
        proposedUserPaths.chat,
        { message: input.message, location: formatLocation(input.context) },
        { signal: options?.signal },
      );

      if (!isUserAiChatResponse(data)) {
        throw new AiApiError(
          'El backend devolvió una respuesta de IA inválida.',
          'invalid-response',
        );
      }

      return {
        conversationId,
        message: createAssistantMessageFromUserResponse(data),
      };
    } catch (error) {
      if (options?.signal?.aborted) {
        throw new DOMException('Solicitud cancelada', 'AbortError');
      }
      throw toAiApiError(error);
    }
  },

  async getConversationMessages(input, options) {
    void input;
    void options;
    return [];
  },

  async deleteConversation(input) {
    if (input.agent === 'user') return;
  },

  async generateClinicalSummary(input, options) {
    try {
      const { data } = await httpClient.post<ClinicalSummary>(
        proposedDoctorPaths.summary(input.patientId),
        {},
        { signal: options?.signal },
      );
      if (!isClinicalSummary(data)) {
        throw new AiApiError(
          'El backend devolvió un resumen clínico inválido.',
          'invalid-response',
        );
      }
      return data;
    } catch (error) {
      throw toAiApiError(error);
    }
  },

  async generateDifferential(input, options) {
    try {
      const { patientId, ...request } = input;
      const { data } = await httpClient.post<ClinicalDifferentialResult>(
        proposedDoctorPaths.differential(patientId),
        request,
        { signal: options?.signal },
      );
      if (!isDifferentialResult(data)) {
        throw new AiApiError(
          'El backend devolvió posibilidades diferenciales inválidas.',
          'invalid-response',
        );
      }
      return data;
    } catch (error) {
      throw toAiApiError(error);
    }
  },
};
