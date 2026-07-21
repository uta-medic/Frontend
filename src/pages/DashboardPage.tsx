import { Link } from 'react-router-dom';

const summaryItems = [
  {
    title: 'Citas registradas',
    value: '—',
    description: 'Consultas programadas',
    icon: '▣',
  },
  {
    title: 'Evaluaciones pendientes',
    value: '—',
    description: 'Pacientes por revisar',
    icon: '✓',
  },
  {
    title: 'Pacientes en cola',
    value: '—',
    description: 'Esperando atención',
    icon: '☷',
  },
  {
    title: 'Fichas médicas',
    value: '—',
    description: 'Fichas generadas',
    icon: '▤',
  },
];

export function DashboardPage() {
  return (
    <section>
      <div className="page-heading">
        <span className="page-kicker">Resumen general</span>
        <h2>Bienvenido a UtaMedic</h2>
        <p>
          Gestiona citas, síntomas, evaluaciones médicas y fichas
          desde un solo lugar.
        </p>
      </div>

      <div className="summary-grid">
        {summaryItems.map((item) => (
          <article className="summary-card" key={item.title}>
            <div className="summary-icon">{item.icon}</div>

            <div>
              <span>{item.title}</span>
              <strong>{item.value}</strong>
              <small>{item.description}</small>
            </div>
          </article>
        ))}
      </div>

      <article className="content-card">
        <div className="section-heading">
          <span className="page-kicker">Accesos rápidos</span>
          <h3>¿Qué necesitas realizar?</h3>
        </div>

        <div className="quick-actions">
          <Link className="quick-action" to="/citas">
            <span>+</span>
            <div>
              <strong>Registrar cita</strong>
              <small>Programar una consulta médica</small>
            </div>
          </Link>

          <Link className="quick-action" to="/sintomas">
            <span>✚</span>
            <div>
              <strong>Registrar síntomas</strong>
              <small>Enviar síntomas para revisión</small>
            </div>
          </Link>

          <Link className="quick-action" to="/evaluaciones">
            <span>✓</span>
            <div>
              <strong>Revisar evaluaciones</strong>
              <small>Asignar prioridad clínica</small>
            </div>
          </Link>

          <Link className="quick-action" to="/cola">
            <span>☷</span>
            <div>
              <strong>Consultar cola</strong>
              <small>Ver el orden de atención</small>
            </div>
          </Link>
        </div>
      </article>
    </section>
  );
}