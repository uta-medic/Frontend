import type { HealthCenter } from '../types/ai.types';
import { CostList } from './CostList';
import { ScheduleList } from './ScheduleList';

interface HealthCenterCardProps {
  center: HealthCenter;
  onAction: (message: string) => Promise<void>;
}

const availabilityLabels = {
  available: 'Disponible',
  limited: 'Disponibilidad limitada',
  unavailable: 'No disponible',
};

function OptionalValue({ value }: { value?: string }) {
  return <span>{value || 'No disponible'}</span>;
}

export function HealthCenterCard({ center, onAction }: HealthCenterCardProps) {
  return (
    <article className="health-center-card">
      <div className="health-center-card__header">
        <div>
          <span className="card-kicker">{center.type ?? 'Tipo no disponible'}</span>
          <h4>{center.name}</h4>
        </div>
        <span
          className={`center-availability center-availability--${center.availability ?? 'unavailable'}`}
        >
          <i aria-hidden="true" />
          {availabilityLabels[center.availability ?? 'unavailable']}
        </span>
      </div>

      <dl className="center-details">
        <div>
          <dt>Dirección</dt>
          <dd><OptionalValue value={center.address} /></dd>
        </div>
        <div>
          <dt>Zona</dt>
          <dd><OptionalValue value={center.zone} /></dd>
        </div>
        <div>
          <dt>Teléfono institucional</dt>
          <dd><OptionalValue value={center.institutionalPhone} /></dd>
        </div>
      </dl>

      {center.specialties && center.specialties.length > 0 && (
        <div className="tag-group" aria-label="Especialidades">
          {center.specialties.map((specialty) => (
            <span key={specialty}>{specialty}</span>
          ))}
        </div>
      )}

      {center.services && center.services.length > 0 && (
        <div className="center-services">
          <strong>Servicios</strong>
          <span>{center.services.join(' · ')}</span>
        </div>
      )}

      {center.schedules && center.schedules.length > 0 && (
        <ScheduleList schedules={center.schedules} />
      )}
      {center.costs && center.costs.length > 0 && (
        <CostList costs={center.costs} />
      )}

      <div className="card-actions">
        <button
          type="button"
          onClick={() =>
            void onAction(`Quiero ver la ubicación de ${center.name}.`)
          }
        >
          Ver ubicación
        </button>
        <button
          type="button"
          onClick={() =>
            void onAction(`Consultar los horarios de ${center.name}.`)
          }
        >
          Consultar horarios
        </button>
      </div>
    </article>
  );
}
