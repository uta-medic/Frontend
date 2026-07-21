import type { AssistantChatMessage } from '../types/ai.types';
import { EmergencyAlert } from './EmergencyAlert';
import { HealthCenterCard } from './HealthCenterCard';
import { SourcesList } from './SourcesList';
import { SpecialtySuggestionCard } from './SpecialtySuggestionCard';

interface StructuredResponseProps {
  message: AssistantChatMessage;
  onAction: (message: string) => Promise<void>;
}

export function StructuredResponse({
  message,
  onAction,
}: StructuredResponseProps) {
  return (
    <div className="structured-response">
      {message.emergencyWarning && (
        <EmergencyAlert warning={message.emergencyWarning} onAction={onAction} />
      )}

      {message.requiresMedicalEvaluation && !message.emergencyWarning && (
        <div className="evaluation-notice">
          <strong>Evaluación profesional recomendada</strong>
          <span>La orientación del asistente no sustituye una consulta médica.</span>
        </div>
      )}

      {message.noResults && (
        <div className="no-results-state" role="status">
          <strong>No encontramos resultados</strong>
          <span>Prueba con otra zona, especialidad o servicio.</span>
        </div>
      )}

      {message.suggestedSpecialties &&
        message.suggestedSpecialties.length > 0 && (
          <div className="response-section">
            <h3>Especialidades que podrían orientarte</h3>
            <div className="response-grid">
              {message.suggestedSpecialties.map((specialty) => (
                <SpecialtySuggestionCard
                  key={specialty.id}
                  specialty={specialty}
                  onAction={onAction}
                />
              ))}
            </div>
          </div>
        )}

      {message.healthCenters && message.healthCenters.length > 0 && (
        <div className="response-section">
          <h3>Centros relacionados</h3>
          <div className="response-grid">
            {message.healthCenters.map((center) => (
              <HealthCenterCard
                key={center.id}
                center={center}
                onAction={onAction}
              />
            ))}
          </div>
        </div>
      )}

      {message.sources && message.sources.length > 0 && (
        <SourcesList sources={message.sources} />
      )}
    </div>
  );
}
