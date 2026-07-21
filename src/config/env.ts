function readBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) return fallback;
  return value.toLowerCase() === 'true';
}

function readApiUrl(value: string | undefined) {
  if (!value) {
    throw new Error('Falta configurar VITE_API_URL.');
  }

  try {
    return new URL(value).toString().replace(/\/$/, '');
  } catch {
    throw new Error('VITE_API_URL debe ser una URL válida.');
  }
}

export const env = Object.freeze({
  apiUrl: readApiUrl(import.meta.env.VITE_API_URL),
  useAiMocks: readBoolean(import.meta.env.VITE_USE_AI_MOCKS, true),
});
