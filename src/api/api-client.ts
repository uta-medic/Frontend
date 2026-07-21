const configuredApiUrl = import.meta.env.VITE_API_URL_GABO as
  | string
  | undefined;

function normalizeApiUrl(apiUrl: string): string {
  const normalizedUrl = apiUrl.replace(/\/+$/, '');

  return normalizedUrl.endsWith('/api')
    ? `${normalizedUrl}/v1`
    : normalizedUrl;
}

export const API_BASE_URL = normalizeApiUrl(
  configuredApiUrl ?? 'http://localhost:3000/api/v1',
);

interface ApiRequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

interface ApiErrorResponse {
  message?: string | string[];
  error?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly details: unknown;

  constructor(
    message: string,
    status: number,
    details: unknown,
  ) {
    super(message);

    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function getErrorMessage(data: unknown): string {
  if (typeof data !== 'object' || data === null) {
    return 'No se pudo completar la solicitud';
  }

  const errorData = data as ApiErrorResponse;

  if (Array.isArray(errorData.message)) {
    return errorData.message.join('. ');
  }

  if (typeof errorData.message === 'string') {
    return errorData.message;
  }

  if (typeof errorData.error === 'string') {
    return errorData.error;
  }

  return 'No se pudo completar la solicitud';
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body:
      options.body === undefined
        ? undefined
        : JSON.stringify(options.body),
  });

  const responseText = await response.text();

  let responseData: unknown = null;

  if (responseText) {
    try {
      responseData = JSON.parse(responseText) as unknown;
    } catch {
      responseData = responseText;
    }
  }

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(responseData),
      response.status,
      responseData,
    );
  }

  return responseData as T;
}
