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
  getPendingTriageAssessments,
  reviewTriageAssessment,
} from '../api/triage.api';

import type { Appointment } from '../types/appointment.types';
import type {
  TriageAssessment,
  TriagePriority,
} from '../types/triage.types';

interface ReviewForm {
  assignedPriority: TriagePriority | '';
  reviewNotes: string;
}

const TEMPORARY_REVIEWER_ID =
  '55555555-5555-4555-8555-555555555555';

const initialReviewForm: ReviewForm = {
  assignedPriority: '',
  reviewNotes: '',
};

const priorityOptions: Array<{
  value: TriagePriority;
  label: string;
  description: string;
}> = [
  {
    value: 'low',
    label: 'Leve',
    description: 'Puede esperar sin riesgo inmediato',
  },
  {
    value: 'medium',
    label: 'Media',
    description: 'Requiere atención regular',
  },
  {
    value: 'medium_high',
    label: 'Media-alta',
    description: 'Debe ser atendido con prontitud',
  },
  {
    value: 'high',
    label: 'Alta',
    description: 'Requiere atención prioritaria',
  },
  {
    value: 'very_high',
    label: 'Muy alta',
    description: 'Atención médica inmediata',
  },
];

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

export function TriageAssessmentsPage() {
  const [pendingAssessments, setPendingAssessments] =
    useState<TriageAssessment[]>([]);

  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [selectedAssessmentId, setSelectedAssessmentId] =
    useState<string | null>(null);

  const [reviewForm, setReviewForm] =
    useState<ReviewForm>(initialReviewForm);

  const [isLoading, setIsLoading] = useState(true);
  const [isReviewing, setIsReviewing] = useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  const appointmentsById = useMemo(() => {
    return new Map(
      appointments.map((appointment) => [
        appointment.id,
        appointment,
      ]),
    );
  }, [appointments]);

  const selectedAssessment = useMemo(() => {
    return pendingAssessments.find(
      (assessment) =>
        assessment.id === selectedAssessmentId,
    );
  }, [pendingAssessments, selectedAssessmentId]);

  const selectedAppointment = selectedAssessment
    ? appointmentsById.get(
        selectedAssessment.appointmentId,
      )
    : undefined;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [assessmentsResponse, appointmentsResponse] =
        await Promise.all([
          getPendingTriageAssessments(),
          getAppointments(),
        ]);

      setPendingAssessments(assessmentsResponse);
      setAppointments(appointmentsResponse);

      setSelectedAssessmentId((currentId) => {
        if (
          currentId &&
          assessmentsResponse.some(
            (assessment) => assessment.id === currentId,
          )
        ) {
          return currentId;
        }

        return assessmentsResponse[0]?.id ?? null;
      });
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function selectAssessment(assessmentId: string) {
    setSelectedAssessmentId(assessmentId);
    setReviewForm(initialReviewForm);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function handleReview(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedAssessment) {
      setErrorMessage(
        'Selecciona una evaluación pendiente',
      );
      return;
    }

    if (!reviewForm.assignedPriority) {
      setErrorMessage(
        'Selecciona una prioridad clínica',
      );
      return;
    }

    try {
      setIsReviewing(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      await reviewTriageAssessment(
        selectedAssessment.id,
        {
          assignedPriority:
            reviewForm.assignedPriority,
          reviewedByUserId: TEMPORARY_REVIEWER_ID,
          reviewNotes:
            reviewForm.reviewNotes.trim() || undefined,
        },
      );

      const remainingAssessments =
        pendingAssessments.filter(
          (assessment) =>
            assessment.id !== selectedAssessment.id,
        );

      setPendingAssessments(remainingAssessments);
      setSelectedAssessmentId(
        remainingAssessments[0]?.id ?? null,
      );

      setReviewForm(initialReviewForm);

      setSuccessMessage(
        'La evaluación fue revisada y la prioridad clínica quedó asignada.',
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsReviewing(false);
    }
  }

  return (
    <section>
      <div className="page-heading triage-heading">
        <div>
          <span className="page-kicker">
            Triaje médico
          </span>

          <h2>Evaluación de pacientes</h2>

          <p>
            Revisa los síntomas registrados por los pacientes y
            asigna la prioridad clínica correspondiente.
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
          <strong>Evaluación completada</strong>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="triage-workspace">
        <article className="content-card triage-pending-panel">
          <div className="appointments-section-header">
            <div>
              <span className="page-kicker">
                Pacientes por revisar
              </span>
              <h3>Evaluaciones pendientes</h3>
            </div>

            <span className="appointment-count">
              {pendingAssessments.length}
            </span>
          </div>

          {isLoading ? (
            <div className="appointments-loading">
              <span className="medical-spinner" />
              <p>Cargando evaluaciones pendientes...</p>
            </div>
          ) : pendingAssessments.length === 0 ? (
            <div className="triage-empty">
              <span>✓</span>
              <h4>No existen evaluaciones pendientes</h4>
              <p>
                Todas las evaluaciones registradas ya fueron
                revisadas por el personal médico.
              </p>
            </div>
          ) : (
            <div className="triage-pending-list">
              {pendingAssessments.map((assessment) => {
                const appointment =
                  appointmentsById.get(
                    assessment.appointmentId,
                  );

                const isSelected =
                  assessment.id ===
                  selectedAssessmentId;

                return (
                  <button
                    className={`triage-pending-item ${
                      isSelected
                        ? 'triage-pending-item-selected'
                        : ''
                    }`}
                    type="button"
                    key={assessment.id}
                    onClick={() =>
                      selectAssessment(assessment.id)
                    }
                  >
                    <div className="triage-pending-header">
                      <span>
                        {formatDate(assessment.createdAt)}
                      </span>

                      <strong>Pendiente</strong>
                    </div>

                    <h4>
                      {appointment?.reason ??
                        'Evaluación médica'}
                    </h4>

                    <p>{assessment.reportedSymptoms}</p>

                    <div className="triage-pending-footer">
                      <span
                        title={assessment.appointmentId}
                      >
                        Cita:{' '}
                        {shortenId(
                          assessment.appointmentId,
                        )}
                      </span>

                      {appointment && (
                        <span
                          title={appointment.patientId}
                        >
                          Paciente:{' '}
                          {shortenId(
                            appointment.patientId,
                          )}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </article>

        <article className="content-card triage-review-panel">
          <div className="appointments-section-header">
            <div>
              <span className="page-kicker">
                Revisión clínica
              </span>
              <h3>Asignar prioridad</h3>
            </div>

            <span className="appointments-section-icon">
              ✓
            </span>
          </div>

          {!selectedAssessment ? (
            <div className="triage-empty">
              <span>✓</span>
              <h4>Selecciona una evaluación</h4>
              <p>
                Elige un paciente de la lista para revisar los
                síntomas y asignar su prioridad.
              </p>
            </div>
          ) : (
            <form
              className="triage-review-form"
              onSubmit={(event) =>
                void handleReview(event)
              }
            >
              <section className="triage-patient-summary">
                <div className="triage-summary-heading">
                  <div>
                    <span>Motivo de la cita</span>
                    <h4>
                      {selectedAppointment?.reason ??
                        'Consulta médica'}
                    </h4>
                  </div>

                  <span className="triage-pending-label">
                    Pendiente
                  </span>
                </div>

                <div className="triage-summary-grid">
                  <div>
                    <span>Fecha de atención</span>
                    <strong>
                      {selectedAppointment
                        ? formatDate(
                            selectedAppointment.scheduledAt,
                          )
                        : 'No disponible'}
                    </strong>
                  </div>

                  <div>
                    <span>Paciente</span>
                    <strong
                      title={
                        selectedAppointment?.patientId
                      }
                    >
                      {selectedAppointment
                        ? shortenId(
                            selectedAppointment.patientId,
                          )
                        : 'No disponible'}
                    </strong>
                  </div>

                  <div>
                    <span>Centro médico</span>
                    <strong
                      title={
                        selectedAppointment?.hospitalId
                      }
                    >
                      {selectedAppointment
                        ? shortenId(
                            selectedAppointment.hospitalId,
                          )
                        : 'No disponible'}
                    </strong>
                  </div>

                  <div>
                    <span>Especialidad</span>
                    <strong
                      title={
                        selectedAppointment?.specialtyId
                      }
                    >
                      {selectedAppointment
                        ? shortenId(
                            selectedAppointment.specialtyId,
                          )
                        : 'No disponible'}
                    </strong>
                  </div>
                </div>
              </section>

              <section className="triage-clinical-information">
                <div>
                  <span>Síntomas declarados</span>
                  <p>
                    {selectedAssessment.reportedSymptoms}
                  </p>
                </div>

                <div>
                  <span>Información adicional</span>
                  <p>
                    {selectedAssessment.additionalNotes ??
                      'El paciente no agregó información adicional.'}
                  </p>
                </div>
              </section>

              <fieldset className="triage-priority-fieldset">
                <legend>Prioridad clínica</legend>

                <p>
                  Selecciona la prioridad de acuerdo con la
                  revisión realizada por el personal médico.
                </p>

                <div className="triage-priority-options">
                  {priorityOptions.map((priority) => (
                    <label
                      className={`triage-priority-option triage-priority-${priority.value} ${
                        reviewForm.assignedPriority ===
                        priority.value
                          ? 'triage-priority-selected'
                          : ''
                      }`}
                      key={priority.value}
                    >
                      <input
                        type="radio"
                        name="assignedPriority"
                        value={priority.value}
                        checked={
                          reviewForm.assignedPriority ===
                          priority.value
                        }
                        onChange={() =>
                          setReviewForm((current) => ({
                            ...current,
                            assignedPriority:
                              priority.value,
                          }))
                        }
                      />

                      <span className="triage-priority-dot" />

                      <div>
                        <strong>{priority.label}</strong>
                        <small>
                          {priority.description}
                        </small>
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="medical-field">
                <span>Observaciones médicas</span>

                <textarea
                  rows={5}
                  maxLength={1000}
                  value={reviewForm.reviewNotes}
                  onChange={(event) =>
                    setReviewForm((current) => ({
                      ...current,
                      reviewNotes: event.target.value,
                    }))
                  }
                  placeholder="Agrega observaciones sobre la evaluación realizada"
                />

                <small className="field-counter">
                  {reviewForm.reviewNotes.length}/1000
                </small>
              </label>

              <div className="medical-notice">
                <span className="medical-notice-icon">
                  i
                </span>

                <div>
                  <strong>
                    Decisión realizada por personal médico
                  </strong>

                  <p>
                    La prioridad seleccionada determinará el
                    orden clínico cuando se genere la ficha y el
                    paciente ingrese a la cola.
                  </p>
                </div>
              </div>

              <button
                className="medical-button medical-button-primary"
                type="submit"
                disabled={
                  isReviewing ||
                  !reviewForm.assignedPriority
                }
              >
                {isReviewing
                  ? 'Guardando evaluación...'
                  : 'Confirmar evaluación médica'}
              </button>

              <p className="triage-reviewer-note">
                Para esta versión MVP se utiliza un identificador
                temporal de revisor. Después será obtenido
                automáticamente desde el usuario autenticado.
              </p>
            </form>
          )}
        </article>
      </div>
    </section>
  );
}