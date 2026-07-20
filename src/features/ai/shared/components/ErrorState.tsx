import type { AiApiError } from '../api/aiApi.errors';

interface ErrorStateProps {
  error: AiApiError;
  onRetry: () => Promise<void>;
}

const errorTitles = {
  offline: 'Sin conexión',
  unavailable: 'Agente no disponible',
  'rate-limit': 'Límite de consultas alcanzado',
  timeout: 'Tiempo de espera agotado',
  forbidden: 'Acceso no autorizado',
  'invalid-response': 'Respuesta no válida',
  general: 'No pudimos responder',
} as const;

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  const canRetry = error.code !== 'forbidden';

  return (
    <div className={`error-state error-state--${error.code}`} role="alert">
      <span className="error-state__icon" aria-hidden="true">
        !
      </span>
      <div>
        <strong>{errorTitles[error.code]}</strong>
        <p>{error.message}</p>
      </div>
      {canRetry && (
        <button type="button" onClick={() => void onRetry()}>
          Reintentar
        </button>
      )}
    </div>
  );
}
