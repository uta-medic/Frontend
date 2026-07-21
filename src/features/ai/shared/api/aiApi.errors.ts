import axios from 'axios';
import type { AiErrorCode } from '../types/ai.types';

export class AiApiError extends Error {
  public readonly code: AiErrorCode;
  public readonly status?: number;

  constructor(
    message: string,
    code: AiErrorCode = 'general',
    status?: number,
  ) {
    super(message);
    this.name = 'AiApiError';
    this.code = code;
    this.status = status;
  }
}

export function toAiApiError(error: unknown) {
  if (error instanceof AiApiError) return error;

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (error.code === 'ECONNABORTED') {
      return new AiApiError(
        'La solicitud excedió el tiempo de espera. Verifica la conexión y reintenta.',
        'timeout',
      );
    }

    if (!error.response) {
      return new AiApiError(
        'No pudimos comunicarnos con el asistente. Revisa tu conexión e inténtalo nuevamente.',
        'offline',
      );
    }

    if (status === 401 || status === 403) {
      return new AiApiError(
        'No tienes autorización para usar este asistente.',
        'forbidden',
        status,
      );
    }

    if (status === 429) {
      return new AiApiError(
        'Se alcanzó el límite temporal de consultas. Espera un momento antes de reintentar.',
        'rate-limit',
        status,
      );
    }

    if (status === 502 || status === 503 || status === 504) {
      return new AiApiError(
        'El agente no está disponible en este momento. Inténtalo más tarde.',
        'unavailable',
        status,
      );
    }

    return new AiApiError(
      'El asistente no pudo procesar la solicitud. Inténtalo nuevamente.',
      'general',
      status,
    );
  }

  return error instanceof Error
    ? new AiApiError(error.message)
    : new AiApiError('Ocurrió un error inesperado.');
}
