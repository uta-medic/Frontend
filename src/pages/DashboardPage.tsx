import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link } from 'react-router-dom';

import { ApiError } from '../api/api-client';
import { getAppointments } from '../api/appointments.api';
import { getMedicalTickets } from '../api/medical-tickets.api';
import { getPendingTriageAssessments } from '../api/triage.api';

interface DashboardSummary {
  appointments: number;
  pendingAssessments: number;
  waitingPatients: number;
  medicalTickets: number;
}

const initialSummary: DashboardSummary = {
  appointments: 0,
  pendingAssessments: 0,
  waitingPatients: 0,
  medicalTickets: 0,
};

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'No se pudo cargar el resumen del sistema';
}

export function DashboardPage() {
  const [summary, setSummary] =
    useState<DashboardSummary>(initialSummary);

  const [isLoading, setIsLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const loadDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [
        appointments,
        pendingAssessments,
        medicalTickets,
      ] = await Promise.all([
        getAppointments(),
        getPendingTriageAssessments(),
        getMedicalTickets(),
      ]);

      setSummary({
        appointments: appointments.length,
        pendingAssessments: pendingAssessments.length,
        waitingPatients: medicalTickets.filter(
          (ticket) => ticket.status === 'waiting',
        ).length,
        medicalTickets: medicalTickets.length,
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const summaryItems = useMemo(
    () => [
      {
        title: 'Citas registradas',
        value: summary.appointments,
        description: 'Consultas programadas',
        icon: '▣',
      },
      {
        title: 'Evaluaciones pendientes',
        value: summary.pendingAssessments,
        description: 'Pacientes por revisar',
        icon: '✓',
      },
      {
        title: 'Pacientes en cola',
        value: summary.waitingPatients,
        description: 'Esperando atención',
        icon: '☷',
      },
      {
        title: 'Fichas médicas',
        value: summary.medicalTickets,
        description: 'Fichas generadas',
        icon: '▤',
      },
    ],
    [summary],
  );

  return (
    <section>
      <div className="page-heading dashboard-heading">
        <div>
          <span className="page-kicker">
            Resumen general
          </span>

          <h2>Bienvenido a UtaMedic</h2>

          <p>
            Gestiona citas, síntomas, evaluaciones médicas y
            fichas desde un solo lugar.
          </p>
        </div>

        <button
          className="medical-button medical-button-secondary"
          type="button"
          disabled={isLoading}
          onClick={() => void loadDashboard()}
        >
          {isLoading
            ? 'Actualizando...'
            : 'Actualizar resumen'}
        </button>
      </div>

      {errorMessage && (
        <div className="medical-alert medical-alert-error">
          <strong>No se pudo cargar el panel</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="summary-grid">
        {summaryItems.map((item) => (
          <article className="summary-card" key={item.title}>
            <div className="summary-icon">{item.icon}</div>

            <div>
              <span>{item.title}</span>

              <strong>
                {isLoading ? '—' : item.value}
              </strong>

              <small>{item.description}</small>
            </div>
          </article>
        ))}
      </div>

      <article className="content-card">
        <div className="section-heading">
          <span className="page-kicker">
            Accesos rápidos
          </span>

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

          <Link
            className="quick-action"
            to="/evaluaciones"
          >
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