import type { SuggestedSpecialty } from '../types/ai.types';

interface SpecialtySuggestionCardProps {
  specialty: SuggestedSpecialty;
  onAction: (message: string) => Promise<void>;
}

export function SpecialtySuggestionCard({
  specialty,
  onAction,
}: SpecialtySuggestionCardProps) {
  return (
    <article className="specialty-card">
      <div className="card-kicker">Especialidad sugerida para evaluación</div>
      <h4>{specialty.name}</h4>
      <p>{specialty.description}</p>
      <div className="specialty-card__reason">
        <strong>¿Por qué podría orientarte?</strong>
        <span>{specialty.reason}</span>
      </div>
      <button
        type="button"
        onClick={() =>
          void onAction(`Buscar centros con ${specialty.name}.`)
        }
      >
        Buscar centros
      </button>
    </article>
  );
}
