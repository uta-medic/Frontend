import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FormEvent } from 'react';

import { ApiError } from '../api/api-client';
import { getAppointments } from '../api/appointments.api';
import {
  createTriageAssessment,
  getTriageAssessments,
} from '../api/triage.api';

import type { Appointment } from '../types/appointment.types';
import type {
  TriageAssessment,
  TriageAssessmentStatus,
} from '../types/triage.types';

interface SymptomsForm {
  appointmentId: string;
  reportedSymptoms: string;
  additionalNotes: string;
}

const initialForm: SymptomsForm = {
  appointmentId: '',
  reportedSymptoms: '',
  additionalNotes: '',
};

const assessmentStatusLabels: Record<
  TriageAssessmentStatus,
  string
> = {
  pending_review: 'Pendiente de revisión',
  reviewed: 'Revisada',
  requires_more_information: 'Requiere información',
  cancelled: 'Cancelada',
};

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado';
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function shortenId(value: string): string {
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export function RegisterSymptomsPage() {
  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [assessments, setAssessments] = useState<
    TriageAssessment[]
  >([]);

  const [form, setForm] =
    useState<SymptomsForm>(initialForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  const assessmentByAppointment = useMemo(() => {
    return new Map(
      assessments.map((assessment) => [
        assessment.appointmentId,
        assessment,
      ]),
    );
  }, [assessments]);

  const selectableAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const unavailableStatuses = [
          'cancelled',
          'completed',
          'no_show',
        ];

        return (
          !unavailableStatuses.includes(
            appointment.status,
          ) &&
          !assessmentByAppointment.has(appointment.id)
        );
      })
      .sort(
        (first, second) =>
          new Date(first.scheduledAt).getTime() -
          new Date(second.scheduledAt).getTime(),
      );
  }, [appointments, assessmentByAppointment]);

  const selectedAppointment = useMemo(() => {
    return appointments.find(
      (appointment) =>
        appointment.id === form.appointmentId,
    );
  }, [appointments, form.appointmentId]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [appointmentsResponse, assessmentsResponse] =
        await Promise.all([
          getAppointments(),
          getTriageAssessments(),
        ]);

      setAppointments(appointmentsResponse);
      setAssessments(assessmentsResponse);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.appointmentId) {
      setErrorMessage('Selecciona una cita médica');
      return;
    }

    if (!form.reportedSymptoms.trim()) {
      setErrorMessage(
        'Describe los síntomas presentados por el paciente',
      );
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const createdAssessment =
        await createTriageAssessment({
          appointmentId: form.appointmentId,
          reportedSymptoms:
            form.reportedSymptoms.trim(),
          additionalNotes:
            form.additionalNotes.trim() || undefined,
        });

      setAssessments((current) => [
        createdAssessment,
        ...current,
      ]);

      setForm(initialForm);

      setSuccessMessage(
        'Los síntomas fueron registrados. La evaluación quedó pendiente de revisión médica.',
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  }
  const priorityLabels = {
  low: 'Leve',
  medium: 'Media',
  medium_high: 'Media-alta',
  high: 'Alta',
  very_high: 'Muy alta',
} as const;

  return (
    <section>
      <div className="page-heading symptoms-heading">
        <div>
          <span className="page-kicker">
            Información del paciente
          </span>

          <h2>Registrar síntomas</h2>

          <p>
            Registra los síntomas relacionados con una cita.
            El personal médico revisará la información antes de
            asignar una prioridad clínica.
          </p>
        </div>

        <button
          className="medical-button medical-button-secondary"
          type="button"
          disabled={isLoading}
          onClick={() => void loadData()}
        >
          {isLoading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {errorMessage && (
        <div className="medical-alert medical-alert-error">
          <strong>No se pudo completar la operación</strong>
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="medical-alert medical-alert-success">
          <strong>Síntomas registrados</strong>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="symptoms-workspace">
        <article className="content-card symptoms-form-panel">
          <div className="appointments-section-header">
            <div>
              <span className="page-kicker">
                Registro clínico inicial
              </span>
              <h3>Información de síntomas</h3>
            </div>

            <span className="appointments-section-icon">
              ✚
            </span>
          </div>

          {isLoading ? (
            <div className="appointments-loading">
              <span className="medical-spinner" />
              <p>Cargando citas disponibles...</p>
            </div>
          ) : selectableAppointments.length === 0 ? (
            <div className="symptoms-no-appointments">
              <span>✓</span>
              <h4>No existen citas disponibles</h4>
              <p>
                Todas las citas activas ya tienen una evaluación
                registrada o todavía no existen citas.
              </p>
            </div>
          ) : (
            <form
              className="symptoms-form"
              onSubmit={(event) =>
                void handleSubmit(event)
              }
            >
              <label className="medical-field">
                <span>Cita médica</span>

                <select
                  required
                  value={form.appointmentId}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      appointmentId:
                        event.target.value,
                    }))
                  }
                >
                  <option value="">
                    Selecciona una cita
                  </option>

                  {selectableAppointments.map(
                    (appointment) => (
                      <option
                        key={appointment.id}
                        value={appointment.id}
                      >
                        {formatDate(
                          appointment.scheduledAt,
                        )}{' '}
                        — {appointment.reason}
                      </option>
                    ),
                  )}
                </select>
              </label>

              {selectedAppointment && (
                <article className="selected-appointment-card">
                  <div>
                    <span>Fecha de atención</span>
                    <strong>
                      {formatDate(
                        selectedAppointment.scheduledAt,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Motivo registrado</span>
                    <strong>
                      {selectedAppointment.reason}
                    </strong>
                  </div>

                  <div>
                    <span>Paciente</span>
                    <strong
                      title={
                        selectedAppointment.patientId
                      }
                    >
                      {shortenId(
                        selectedAppointment.patientId,
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>Estado</span>
                    <strong>
                      {selectedAppointment.status ===
                      'scheduled'
                        ? 'Programada'
                        : selectedAppointment.status}
                    </strong>
                  </div>
                </article>
              )}

              <label className="medical-field">
                <span>¿Qué síntomas presenta?</span>

                <textarea
                  required
                  rows={7}
                  maxLength={2000}
                  value={form.reportedSymptoms}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      reportedSymptoms:
                        event.target.value,
                    }))
                  }
                  placeholder="Ejemplo: dolor intenso de cabeza, mareos y náuseas"
                />

                <small className="field-counter">
                  {form.reportedSymptoms.length}/2000
                </small>
              </label>

              <label className="medical-field">
                <span>Información adicional</span>

                <textarea
                  rows={4}
                  maxLength={1000}
                  value={form.additionalNotes}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      additionalNotes:
                        event.target.value,
                    }))
                  }
                  placeholder="Ejemplo: los síntomas comenzaron esta mañana"
                />

                <small className="field-counter">
                  {form.additionalNotes.length}/1000
                </small>
              </label>

              <div className="medical-notice">
                <span className="medical-notice-icon">
                  i
                </span>

                <div>
                  <strong>
                    La prioridad no se asigna automáticamente
                  </strong>
                  <p>
                    Los síntomas serán revisados por personal
                    médico antes de establecer la prioridad de
                    atención.
                  </p>
                </div>
              </div>

              <button
                className="medical-button medical-button-primary"
                type="submit"
                disabled={isSaving}
              >
                {isSaving
                  ? 'Registrando síntomas...'
                  : 'Registrar síntomas'}
              </button>
            </form>
          )}
        </article>

        <article className="content-card assessments-history-panel">
          <div className="appointments-section-header">
            <div>
              <span className="page-kicker">
                Historial reciente
              </span>
              <h3>Evaluaciones registradas</h3>
            </div>

            <span className="appointment-count">
              {assessments.length}
            </span>
          </div>

          {isLoading ? (
            <div className="appointments-loading">
              <span className="medical-spinner" />
              <p>Cargando evaluaciones...</p>
            </div>
          ) : assessments.length === 0 ? (
            <div className="appointments-empty">
              <span>✚</span>
              <h4>No existen síntomas registrados</h4>
              <p>
                Selecciona una cita para registrar la primera
                evaluación.
              </p>
            </div>
          ) : (
            <div className="assessment-history-list">
              {assessments.map((assessment) => {
                const appointment = appointments.find(
                  (item) =>
                    item.id === assessment.appointmentId,
                );

                return (
                  <article
                    className="assessment-history-item"
                    key={assessment.id}
                  >
                    <div className="assessment-history-header">
                      <div>
                        <span>
                          {formatDate(
                            assessment.createdAt,
                          )}
                        </span>
                        <h4>
                          {appointment?.reason ??
                            'Evaluación de síntomas'}
                        </h4>
                      </div>

                      <span
                        className={`assessment-status assessment-status-${assessment.status}`}
                      >
                        {
                          assessmentStatusLabels[
                            assessment.status
                          ]
                        }
                      </span>
                    </div>

                    <div className="assessment-symptoms">
                      <span>Síntomas declarados</span>
                      <p>{assessment.reportedSymptoms}</p>
                    </div>

                    {assessment.additionalNotes && (
                      <div className="assessment-notes">
                        <span>Información adicional</span>
                        <p>
                          {assessment.additionalNotes}
                        </p>
                      </div>
                    )}

                    <div className="assessment-footer">
                      <span>
                        Prioridad:{' '}
                        <strong>
                          {assessment.assignedPriority
  ? priorityLabels[assessment.assignedPriority]
  : 'Sin asignar'}
                        </strong>
                      </span>

                      <span
                        title={assessment.appointmentId}
                      >
                        Cita:{' '}
                        {shortenId(
                          assessment.appointmentId,
                        )}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}