import { httpClient } from '../../../../config/httpClient';
import type {
  AiApiProvider,
  AssistantChatMessage,
  ChatMessage,
  ClinicalDifferentialResult,
  ClinicalSummary,
  SendMessageInput,
} from '../types/ai.types';
import { AiApiError, toAiApiError } from './aiApi.errors';

interface ConversationResponse {
  conversationId: string;
}

interface AiChatResponse {
  conversationId?: string;
  message: AssistantChatMessage;
}

interface UserAiChatResponse {
  answer: string;
  generatedAt: string;
  disclaimer?: string;
}

interface ConversationMessagesResponse {
  messages: ChatMessage[];
}

// La baseURL ya contiene /api/v1.
const proposedUserPaths = {
  chat: '/user-ai/chat',
};

// CONTRATO PROPUESTO Y NO VERIFICADO para el copiloto clínico.
const proposedDoctorPaths = {
  conversations: '/ai/doctor/conversations',
  messages: (conversationId: string) =>
    `/ai/doctor/conversations/${encodeURIComponent(conversationId)}/messages`,
  summary: (patientId: string) =>
    `/ai/doctor/patients/${encodeURIComponent(patientId)}/summary`,
  differential: (patientId: string) =>
    `/ai/doctor/patients/${encodeURIComponent(patientId)}/differential`,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAssistantMessage(value: unknown): value is AssistantChatMessage {
  if (!isRecord(value)) return false;

  return (
    typeof value.id === 'string' &&
    value.role === 'assistant' &&
    typeof value.content === 'string' &&
    typeof value.createdAt === 'string' &&
    typeof value.responseType === 'string'
  );
}

function isUserAiChatResponse(value: unknown): value is UserAiChatResponse {
  return (
    isRecord(value) &&
    typeof value.answer === 'string' &&
    typeof value.generatedAt === 'string'
  );
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

function readConversationId(value: unknown) {
  if (!isRecord(value) || typeof value.conversationId !== 'string') {
    throw new AiApiError(
      'El backend devolvió una conversación inválida.',
      'invalid-response',
    );
  }

  return value.conversationId;
}

async function createDoctorConversation(
  input: SendMessageInput,
  signal?: AbortSignal,
) {
  const { data } = await httpClient.post<ConversationResponse>(
    proposedDoctorPaths.conversations,
    { patientId: input.context?.patientId },
    { signal },
  );

  return readConversationId(data);
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
        const conversationId =
          input.conversationId ??
          (await createDoctorConversation(input, options?.signal));
        const { data } = await httpClient.post<AiChatResponse>(
          proposedDoctorPaths.messages(conversationId),
          { message: input.message, patientId: input.context?.patientId },
          { signal: options?.signal },
        );

        if (!isAssistantMessage(data.message)) {
          throw new AiApiError(
            'El backend devolvió una respuesta de IA inválida.',
            'invalid-response',
          );
        }

        return {
          conversationId,
          message: data.message,
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
      throw toAiApiError(error);
    }
  },

  async getConversationMessages(input, options) {
    if (input.agent === 'user') return [];

    try {
      const { data } = await httpClient.get<ConversationMessagesResponse>(
        proposedDoctorPaths.messages(input.conversationId),
        { signal: options?.signal },
      );

      return Array.isArray(data.messages) ? data.messages : [];
    } catch (error) {
      throw toAiApiError(error);
    }
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
