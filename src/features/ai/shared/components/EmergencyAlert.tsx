interface EmergencyAlertProps {
  warning: string;
  onAction: (message: string) => Promise<void>;
}

export function EmergencyAlert({ warning, onAction }: EmergencyAlertProps) {
  return (
    <section className="emergency-alert" role="alert" aria-labelledby="emergency-title">
      <span className="emergency-alert__icon" aria-hidden="true">
        !
      </span>
      <div>
        <p className="card-kicker">Atención prioritaria</p>
        <h4 id="emergency-title">Busca atención inmediata</h4>
        <p>{warning}</p>
        <small>Esta alerta no confirma un diagnóstico.</small>
        <button
          type="button"
          onClick={() =>
            void onAction('Buscar centros con atención de emergencia.')
          }
        >
          Buscar centros de emergencia
        </button>
      </div>
    </section>
  );
}
