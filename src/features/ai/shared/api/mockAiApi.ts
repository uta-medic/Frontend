import type { AiApiProvider } from '../types/ai.types';
import { AiApiError } from './aiApi.errors';
import { createMockResponse } from './mockAiScenarios';
import {
  createMockClinicalSummary,
  createMockDifferential,
  DEMO_PATIENTS,
  getDemoPatient,
} from '../../doctor-agent/doctorMockData';
import { createDoctorMockChatResponse } from '../../doctor-agent/doctorMockScenarios';

// Simulación exclusiva de desarrollo. No representa datos reales ni llama a Azure.
function delay(signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeoutId = window.setTimeout(resolve, 240);

    signal?.addEventListener(
      'abort',
      () => {
        window.clearTimeout(timeoutId);
        reject(new DOMException('Solicitud cancelada', 'AbortError'));
      },
      { once: true },
    );
  });
}

export const mockAiApi: AiApiProvider = {
  async sendMessage(input, options) {
    await delay(options?.signal);

    return {
      conversationId: input.conversationId ?? `mock-conversation-${Date.now()}`,
      message:
        input.agent === 'doctor'
          ? createDoctorMockChatResponse(input, DEMO_PATIENTS)
          : createMockResponse(input),
    };
  },

  async getConversationMessages() {
    return [];
  },

  async deleteConversation() {
    return Promise.resolve();
  },

  async generateClinicalSummary(input, options) {
    await delay(options?.signal);
    const patient = getDemoPatient(input.patientId);
    if (!patient) {
      throw new AiApiError('Paciente demo no encontrado.', 'invalid-response');
    }
    return createMockClinicalSummary(patient);
  },

  async generateDifferential(input, options) {
    await delay(options?.signal);
    const patient = getDemoPatient(input.patientId);
    if (!patient) {
      throw new AiApiError('Paciente demo no encontrado.', 'invalid-response');
    }
    return createMockDifferential(patient, input);
  },
};
