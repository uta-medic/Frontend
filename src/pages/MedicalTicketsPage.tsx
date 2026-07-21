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
  checkInMedicalTicket,
  createMedicalTicket,
  getMedicalTicketPosition,
  getMedicalTickets,
} from '../api/medical-tickets.api';
import { getTriageAssessments } from '../api/triage.api';

import type { Appointment } from '../types/appointment.types';
import type {
  MedicalTicket,
  MedicalTicketPosition,
  MedicalTicketStatus,
  PriorityPatientType,
} from '../types/medical-ticket.types';
import type {
  TriageAssessment,
  TriagePriority,
} from '../types/triage.types';

const priorityLabels: Record<TriagePriority, string> = {
  low: 'Leve',
  medium: 'Media',
  medium_high: 'Media-alta',
  high: 'Alta',
  very_high: 'Muy alta',
};

const priorityPatientLabels: Record<
  PriorityPatientType,
  string
> = {
  none: 'Ninguna',
  older_adult: 'Persona adulta mayor',
  pregnant: 'Persona embarazada',
  disability: 'Persona con discapacidad',
  child: 'Niña o niño',
  dependent_patient: 'Paciente dependiente',
  other: 'Otra condición preferente',
};

const ticketStatusLabels: Record<
  MedicalTicketStatus,
  string
> = {
  waiting_for_triage: 'Pendiente de triaje',
  ready_for_check_in: 'Pendiente de llegada',
  waiting: 'En espera',
  called: 'Paciente llamado',
  in_service: 'En atención',
  completed: 'Atención completada',
  cancelled: 'Cancelada',
  no_show: 'No asistió',
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

function formatDateOnly(value: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function shortenId(value: string): string {
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export function MedicalTicketsPage() {
  const [assessments, setAssessments] = useState<
    TriageAssessment[]
  >([]);

  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [tickets, setTickets] = useState<MedicalTicket[]>(
    [],
  );

  const [selectedAssessmentId, setSelectedAssessmentId] =
    useState<string | null>(null);

  const [
    priorityPatientType,
    setPriorityPatientType,
  ] = useState<PriorityPatientType>('none');

  const [position, setPosition] =
    useState<MedicalTicketPosition | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] =
    useState(false);
  const [isCheckingIn, setIsCheckingIn] =
    useState(false);
  const [isLoadingPosition, setIsLoadingPosition] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  const reviewedAssessments = useMemo(() => {
    return assessments
      .filter(
        (assessment) =>
          assessment.status === 'reviewed' &&
          assessment.assignedPriority !== null,
      )
      .sort(
        (first, second) =>
          new Date(second.reviewedAt ?? second.updatedAt)
            .getTime() -
          new Date(first.reviewedAt ?? first.updatedAt)
            .getTime(),
      );
  }, [assessments]);

  const appointmentsById = useMemo(() => {
    return new Map(
      appointments.map((appointment) => [
        appointment.id,
        appointment,
      ]),
    );
  }, [appointments]);

  const ticketsByAssessmentId = useMemo(() => {
    return new Map(
      tickets.map((ticket) => [
        ticket.triageAssessmentId,
        ticket,
      ]),
    );
  }, [tickets]);

  const selectedAssessment = useMemo(() => {
    return reviewedAssessments.find(
      (assessment) =>
        assessment.id === selectedAssessmentId,
    );
  }, [reviewedAssessments, selectedAssessmentId]);

  const selectedAppointment = selectedAssessment
    ? appointmentsById.get(
        selectedAssessment.appointmentId,
      )
    : undefined;

  const selectedTicket = selectedAssessment
    ? ticketsByAssessmentId.get(selectedAssessment.id)
    : undefined;

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [
        assessmentsResponse,
        appointmentsResponse,
        ticketsResponse,
      ] = await Promise.all([
        getTriageAssessments(),
        getAppointments(),
        getMedicalTickets(),
      ]);

      const availableAssessments =
        assessmentsResponse.filter(
          (assessment) =>
            assessment.status === 'reviewed' &&
            assessment.assignedPriority !== null,
        );

      setAssessments(assessmentsResponse);
      setAppointments(appointmentsResponse);
      setTickets(ticketsResponse);

      setSelectedAssessmentId((currentId) => {
        if (
          currentId &&
          availableAssessments.some(
            (assessment) => assessment.id === currentId,
          )
        ) {
          return currentId;
        }

        return availableAssessments[0]?.id ?? null;
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
    setPriorityPatientType('none');
    setPosition(null);
    setErrorMessage(null);
    setSuccessMessage(null);
  }

  async function handleGenerateTicket(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!selectedAssessment) {
      setErrorMessage(
        'Selecciona una evaluación revisada',
      );
      return;
    }

    if (selectedTicket) {
      setErrorMessage(
        'Esta evaluación ya tiene una ficha médica',
      );
      return;
    }

    try {
      setIsGenerating(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      setPosition(null);

      const createdTicket = await createMedicalTicket({
        triageAssessmentId: selectedAssessment.id,
        priorityPatientType,
      });

      setTickets((current) => [
        createdTicket,
        ...current,
      ]);

      setSuccessMessage(
        `La ficha ${createdTicket.ticketNumber} fue generada correctamente.`,
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCheckIn(ticket: MedicalTicket) {
    try {
      setIsCheckingIn(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      setPosition(null);

      const updatedTicket =
        await checkInMedicalTicket(ticket.id);

      setTickets((current) =>
        current.map((item) =>
          item.id === updatedTicket.id
            ? updatedTicket
            : item,
        ),
      );

      setSuccessMessage(
        'La llegada del paciente fue registrada y la ficha ingresó a la cola.',
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCheckingIn(false);
    }
  }

  async function handleGetPosition(
    ticket: MedicalTicket,
  ) {
    try {
      setIsLoadingPosition(true);
      setErrorMessage(null);

      const response = await getMedicalTicketPosition(
        ticket.id,
      );

      setPosition(response);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setPosition(null);
    } finally {
      setIsLoadingPosition(false);
    }
  }

  return (
    <section>
      <div className="page-heading tickets-heading">
        <div>
          <span className="page-kicker">
            Gestión de fichas
          </span>

          <h2>Fichas médicas</h2>

          <p>
            Genera una ficha después de la revisión clínica,
            registra la llegada del paciente y consulta su
            posición en la cola.
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
          <strong>Operación completada</strong>
          <span>{successMessage}</span>
        </div>
      )}

      <div className="tickets-workspace">
        <article className="content-card tickets-assessments-panel">
          <div className="appointments-section-header">
            <div>
              <span className="page-kicker">
                Pacientes evaluados
              </span>
              <h3>Listos para ficha</h3>
            </div>

            <span className="appointment-count">
              {reviewedAssessments.length}
            </span>
          </div>

          {isLoading ? (
            <div className="appointments-loading">
              <span className="medical-spinner" />
              <p>Cargando evaluaciones revisadas...</p>
            </div>
          ) : reviewedAssessments.length === 0 ? (
            <div className="tickets-empty">
              <span>▤</span>
              <h4>No existen evaluaciones revisadas</h4>
              <p>
                Primero debe registrarse y revisarse una
                evaluación de síntomas.
              </p>
            </div>
          ) : (
            <div className="tickets-assessment-list">
              {reviewedAssessments.map((assessment) => {
                const appointment =
                  appointmentsById.get(
                    assessment.appointmentId,
                  );

                const ticket =
                  ticketsByAssessmentId.get(assessment.id);

                const isSelected =
                  selectedAssessmentId === assessment.id;

                return (
                  <button
                    className={`tickets-assessment-item ${
                      isSelected
                        ? 'tickets-assessment-item-selected'
                        : ''
                    }`}
                    type="button"
                    key={assessment.id}
                    onClick={() =>
                      selectAssessment(assessment.id)
                    }
                  >
                    <div className="tickets-assessment-header">
                      <span
                        className={`ticket-priority ticket-priority-${assessment.assignedPriority}`}
                      >
                        {assessment.assignedPriority
                          ? priorityLabels[
                              assessment.assignedPriority
                            ]
                          : 'Sin prioridad'}
                      </span>

                      <span
                        className={
                          ticket
                            ? 'ticket-generation-state ticket-generated'
                            : 'ticket-generation-state ticket-not-generated'
                        }
                      >
                        {ticket
                          ? 'Ficha generada'
                          : 'Lista para ficha'}
                      </span>
                    </div>

                    <h4>
                      {appointment?.reason ??
                        'Consulta médica'}
                    </h4>

                    <p>{assessment.reportedSymptoms}</p>

                    <div className="tickets-assessment-footer">
                      <span>
                        {appointment
                          ? formatDate(
                              appointment.scheduledAt,
                            )
                          : 'Fecha no disponible'}
                      </span>

                      <span>
                        {shortenId(assessment.id)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </article>

        <article className="content-card ticket-detail-panel">
          <div className="appointments-section-header">
            <div>
              <span className="page-kicker">
                Ficha de atención
              </span>
              <h3>
                {selectedTicket
                  ? 'Detalle de la ficha'
                  : 'Generar ficha médica'}
              </h3>
            </div>

            <span className="appointments-section-icon">
              ▤
            </span>
          </div>

          {!selectedAssessment ? (
            <div className="tickets-empty">
              <span>▤</span>
              <h4>Selecciona una evaluación</h4>
              <p>
                Elige una evaluación revisada para generar o
                consultar su ficha médica.
              </p>
            </div>
          ) : (
            <>
              <section className="ticket-clinical-summary">
                <div className="ticket-clinical-heading">
                  <div>
                    <span>Motivo de la consulta</span>
                    <h4>
                      {selectedAppointment?.reason ??
                        'Consulta médica'}
                    </h4>
                  </div>

                  {selectedAssessment.assignedPriority && (
                    <span
                      className={`ticket-priority ticket-priority-${selectedAssessment.assignedPriority}`}
                    >
                      {
                        priorityLabels[
                          selectedAssessment
                            .assignedPriority
                        ]
                      }
                    </span>
                  )}
                </div>

                <div className="ticket-clinical-grid">
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

                <div className="ticket-symptoms-summary">
                  <span>Síntomas revisados</span>
                  <p>
                    {selectedAssessment.reportedSymptoms}
                  </p>
                </div>
              </section>

              {!selectedTicket ? (
                <form
                  className="ticket-generation-form"
                  onSubmit={(event) =>
                    void handleGenerateTicket(event)
                  }
                >
                  <label className="medical-field">
                    <span>Atención preferente</span>

                    <select
                      value={priorityPatientType}
                      onChange={(event) =>
                        setPriorityPatientType(
                          event.target
                            .value as PriorityPatientType,
                        )
                      }
                    >
                      {Object.entries(
                        priorityPatientLabels,
                      ).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="medical-notice">
                    <span className="medical-notice-icon">
                      i
                    </span>

                    <div>
                      <strong>
                        Orden de atención clínica
                      </strong>
                      <p>
                        La prioridad médica tiene mayor peso.
                        La atención preferente se utiliza como
                        criterio adicional entre pacientes con
                        la misma prioridad.
                      </p>
                    </div>
                  </div>

                  <button
                    className="medical-button medical-button-primary"
                    type="submit"
                    disabled={isGenerating}
                  >
                    {isGenerating
                      ? 'Generando ficha...'
                      : 'Generar ficha médica'}
                  </button>
                </form>
              ) : (
                <section className="generated-ticket">
                  <div className="generated-ticket-number">
                    <span>Número de ficha</span>
                    <strong>
                      {selectedTicket.ticketNumber}
                    </strong>
                  </div>

                  <div className="generated-ticket-grid">
                    <div>
                      <span>Estado actual</span>
                      <strong
                        className={`ticket-status ticket-status-${selectedTicket.status}`}
                      >
                        {
                          ticketStatusLabels[
                            selectedTicket.status
                          ]
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Fecha de atención</span>
                      <strong>
                        {formatDateOnly(
                          selectedTicket.ticketDate,
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>Secuencia diaria</span>
                      <strong>
                        {selectedTicket.dailySequence}
                      </strong>
                    </div>

                    <div>
                      <span>Atención preferente</span>
                      <strong>
                        {
                          priorityPatientLabels[
                            selectedTicket
                              .priorityPatientType
                          ]
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Prioridad clínica</span>
                      <strong>
                        {
                          priorityLabels[
                            selectedTicket.triagePriority
                          ]
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Hora de llegada</span>
                      <strong>
                        {selectedTicket.checkedInAt
                          ? formatDate(
                              selectedTicket.checkedInAt,
                            )
                          : 'Pendiente'}
                      </strong>
                    </div>
                  </div>

                  <div className="generated-ticket-actions">
                    {selectedTicket.status ===
                      'ready_for_check_in' && (
                      <button
                        className="medical-button medical-button-primary"
                        type="button"
                        disabled={isCheckingIn}
                        onClick={() =>
                          void handleCheckIn(
                            selectedTicket,
                          )
                        }
                      >
                        {isCheckingIn
                          ? 'Registrando llegada...'
                          : 'Registrar llegada'}
                      </button>
                    )}

                    {selectedTicket.status ===
                      'waiting' && (
                      <button
                        className="medical-button medical-button-secondary"
                        type="button"
                        disabled={isLoadingPosition}
                        onClick={() =>
                          void handleGetPosition(
                            selectedTicket,
                          )
                        }
                      >
                        {isLoadingPosition
                          ? 'Consultando...'
                          : 'Consultar posición'}
                      </button>
                    )}
                  </div>

                  {position && (
                    <article className="ticket-position-card">
                      <div>
                        <span>Posición actual</span>
                        <strong>{position.position}</strong>
                      </div>

                      <div>
                        <span>Pacientes esperando</span>
                        <strong>
                          {position.totalWaiting}
                        </strong>
                      </div>
                    </article>
                  )}
                </section>
              )}
            </>
          )}
        </article>
      </div>
    </section>
  );
}