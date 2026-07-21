import type { DoctorQuickAction } from './doctorAgent.config';

interface DoctorQuickActionsProps {
  actions: DoctorQuickAction[];
  disabled: boolean;
  onSelect: (action: DoctorQuickAction) => Promise<void>;
}

export function DoctorQuickActions({
  actions,
  disabled,
  onSelect,
}: DoctorQuickActionsProps) {
  return (
    <section className="doctor-actions" aria-labelledby="doctor-actions-title">
      <div className="doctor-section-heading">
        <div>
          <p className="section-heading__eyebrow">Herramientas del copiloto</p>
          <h2 id="doctor-actions-title">Acciones rápidas</h2>
        </div>
        <span>Todo resultado requiere revisión profesional</span>
      </div>
      <div className="doctor-actions__grid">
        {actions.map((action) => (
          <button
            type="button"
            key={action.id}
            disabled={disabled}
            onClick={() => void onSelect(action)}
          >
            <span aria-hidden="true">{action.shortCode}</span>
            <strong>{action.label}</strong>
          </button>
        ))}
      </div>
    </section>
  );
}
