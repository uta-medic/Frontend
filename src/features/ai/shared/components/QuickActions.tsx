export interface QuickActionItem {
  id: string;
  label: string;
  description: string;
  prompt: string;
  shortCode: string;
}

interface QuickActionsProps {
  actions: QuickActionItem[];
  disabled: boolean;
  onSelect: (prompt: string) => Promise<void>;
}

export function QuickActions({
  actions,
  disabled,
  onSelect,
}: QuickActionsProps) {
  return (
    <section className="quick-actions" aria-labelledby="quick-actions-title">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Accesos rápidos</p>
          <h2 id="quick-actions-title">¿Qué quieres consultar?</h2>
        </div>
        <span>Selecciona una opción para comenzar</span>
      </div>
      <div className="quick-actions__grid">
        {actions.map((action) => (
          <button
            type="button"
            className="quick-action"
            key={action.id}
            disabled={disabled}
            onClick={() => void onSelect(action.prompt)}
          >
            <span className="quick-action__icon" aria-hidden="true">
              {action.shortCode}
            </span>
            <span>
              <strong>{action.label}</strong>
              <small>{action.description}</small>
            </span>
            <span className="quick-action__arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
