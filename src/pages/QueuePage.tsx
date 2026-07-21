import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ApiError } from '../api/api-client';
import {
  callMedicalTicketPatient,
  completeMedicalTicketService,
  getMedicalTicketQueue,
  getMedicalTickets,
  markMedicalTicketNoShow,
  startMedicalTicketService,
} from '../api/medical-tickets.api';

import type {
  MedicalTicket,
  PriorityPatientType,
} from '../types/medical-ticket.types';
import type { TriagePriority } from '../types/triage.types';

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
  none: 'Sin atención preferente',
  older_adult: 'Persona adulta mayor',
  pregnant: 'Persona embarazada',
  disability: 'Persona con discapacidad',
  child: 'Niña o niño',
  dependent_patient: 'Paciente dependiente',
  other: 'Otra condición preferente',
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

function shortenId(value: string): string {
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

function formatDateOnly(value: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${value}T00:00:00Z`));
}

function formatTime(value: string | null): string {
  if (!value) {
    return 'Sin registro';
  }

  return new Intl.DateTimeFormat('es-BO', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

export function QueuePage() {
  const [allTickets, setAllTickets] = useState<
    MedicalTicket[]
  >([]);

  const [queue, setQueue] = useState<MedicalTicket[]>([]);

  const [hospitalId, setHospitalId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [ticketDate, setTicketDate] = useState('');

  const [isLoadingTickets, setIsLoadingTickets] =
    useState(true);

  const [isLoadingQueue, setIsLoadingQueue] =
    useState(false);

  const [actionTicketId, setActionTicketId] = useState<
    string | null
  >(null);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  
  const hospitalOptions = useMemo(
    () =>
      Array.from(
        new Set(
          allTickets
            .filter((ticket) =>
              ['waiting', 'called', 'in_service'].includes(
                ticket.status,
              ),
            )
            .map((ticket) => ticket.hospitalId),
        ),
      ),
    [allTickets],
  );

  const specialtyOptions = useMemo(
    () =>
      Array.from(
        new Set(
          allTickets
            .filter(
              (ticket) =>
                ['waiting', 'called', 'in_service'].includes(
                  ticket.status,
                ) &&
                (!hospitalId ||
                  ticket.hospitalId === hospitalId),
            )
            .map((ticket) => ticket.specialtyId),
        ),
      ),
    [allTickets, hospitalId],
  );

  const dateOptions = useMemo(
    () =>
      Array.from(
        new Set(
          allTickets
            .filter(
              (ticket) =>
                ['waiting', 'called', 'in_service'].includes(
                  ticket.status,
                ) &&
                (!hospitalId ||
                  ticket.hospitalId === hospitalId) &&
                (!specialtyId ||
                  ticket.specialtyId === specialtyId),
            )
            .map((ticket) => ticket.ticketDate),
        ),
      ).sort(),
    [allTickets, hospitalId, specialtyId],
  );

  const activeTickets = useMemo(
    () =>
      allTickets
        .filter(
          (ticket) =>
            ticket.hospitalId === hospitalId &&
            ticket.specialtyId === specialtyId &&
            ticket.ticketDate === ticketDate &&
            ['called', 'in_service'].includes(ticket.status),
        )
        .sort(
          (first, second) =>
            new Date(
              first.calledAt ?? first.updatedAt,
            ).getTime() -
            new Date(
              second.calledAt ?? second.updatedAt,
            ).getTime(),
        ),
    [allTickets, hospitalId, specialtyId, ticketDate],
  );

  const completedToday = useMemo(
    () =>
      allTickets.filter(
        (ticket) =>
          ticket.hospitalId === hospitalId &&
          ticket.specialtyId === specialtyId &&
          ticket.ticketDate === ticketDate &&
          ticket.status === 'completed',
      ),
    [allTickets, hospitalId, specialtyId, ticketDate],
  );

  const prioritySummary = useMemo(
    () =>
      queue.reduce<Record<TriagePriority, number>>(
        (summary, ticket) => {
          summary[ticket.triagePriority] += 1;
          return summary;
        },
        {
          low: 0,
          medium: 0,
          medium_high: 0,
          high: 0,
          very_high: 0,
        },
      ),
    [queue],
  );

  const loadTickets = useCallback(async () => {
    try {
      setIsLoadingTickets(true);
      setErrorMessage(null);

      const response = await getMedicalTickets();

      setAllTickets(response);

      const firstActiveTicket = response.find((ticket) =>
        ['waiting', 'called', 'in_service'].includes(
          ticket.status,
        ),
      );

      if (firstActiveTicket) {
        setHospitalId((current) =>
          current || firstActiveTicket.hospitalId,
        );

        setSpecialtyId((current) =>
          current || firstActiveTicket.specialtyId,
        );

        setTicketDate((current) =>
          current || firstActiveTicket.ticketDate,
        );
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoadingTickets(false);
    }
  }, []);

  const loadQueue = useCallback(async () => {
    if (!hospitalId || !specialtyId || !ticketDate) {
      setQueue([]);
      return;
    }

    try {
      setIsLoadingQueue(true);
      setErrorMessage(null);

      const response = await getMedicalTicketQueue({
        hospitalId,
        specialtyId,
        ticketDate,
      });

      setQueue(response);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
      setQueue([]);
    } finally {
      setIsLoadingQueue(false);
    }
  }, [hospitalId, specialtyId, ticketDate]);

  useEffect(() => {
    void loadTickets();
  }, [loadTickets]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  function updateTicket(updatedTicket: MedicalTicket) {
    setAllTickets((current) =>
      current.map((ticket) =>
        ticket.id === updatedTicket.id
          ? updatedTicket
          : ticket,
      ),
    );
  }

  async function runTicketAction(
    ticket: MedicalTicket,
    action: (
      ticketId: string,
    ) => Promise<MedicalTicket>,
    message: string,
  ) {
    try {
      setActionTicketId(ticket.id);
      setErrorMessage(null);
      setSuccessMessage(null);

      const updatedTicket = await action(ticket.id);

      updateTicket(updatedTicket);

      setSuccessMessage(message);

      await loadQueue();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setActionTicketId(null);
    }
  }

  function handleHospitalChange(value: string) {
    setHospitalId(value);

    const matchingTicket = allTickets.find(
      (ticket) =>
        ticket.hospitalId === value &&
        ['waiting', 'called', 'in_service'].includes(
          ticket.status,
        ),
    );

    setSpecialtyId(matchingTicket?.specialtyId ?? '');
    setTicketDate(matchingTicket?.ticketDate ?? '');
  }

  function handleSpecialtyChange(value: string) {
    setSpecialtyId(value);

    const matchingTicket = allTickets.find(
      (ticket) =>
        ticket.hospitalId === hospitalId &&
        ticket.specialtyId === value &&
        ['waiting', 'called', 'in_service'].includes(
          ticket.status,
        ),
    );

    setTicketDate(matchingTicket?.ticketDate ?? '');
  }

  return (
    <section>
      <div className="page-heading queue-heading">
        <div>
          <span className="page-kicker">
            Orden de atención
          </span>

          <h2>Cola de atención</h2>

          <p>
            Llama pacientes, inicia consultas y registra la
            finalización de cada atención médica.
          </p>
        </div>

        <button
          className="medical-button medical-button-secondary"
          type="button"
          disabled={isLoadingTickets}
          onClick={() => void loadTickets()}
        >
          {isLoadingTickets
            ? 'Actualizando...'
            : 'Actualizar cola'}
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
          <strong>Estado actualizado</strong>
          <span>{successMessage}</span>
        </div>
      )}

      <article className="content-card queue-filter-card">
        <div className="appointments-section-header">
          <div>
            <span className="page-kicker">
              Filtros de atención
            </span>
            <h3>Seleccionar cola</h3>
          </div>

          <span className="appointments-section-icon">
            ☷
          </span>
        </div>

        <div className="queue-filters">
          <label className="medical-field">
            <span>Centro médico</span>

            <select
              value={hospitalId}
              onChange={(event) =>
                handleHospitalChange(event.target.value)
              }
            >
              {hospitalOptions.length === 0 && (
                <option value="">
                  No existen centros activos
                </option>
              )}

              {hospitalOptions.map((option) => (
                <option key={option} value={option}>
                  Centro {shortenId(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="medical-field">
            <span>Especialidad</span>

            <select
              value={specialtyId}
              onChange={(event) =>
                handleSpecialtyChange(event.target.value)
              }
            >
              {specialtyOptions.length === 0 && (
                <option value="">
                  No existen especialidades activas
                </option>
              )}

              {specialtyOptions.map((option) => (
                <option key={option} value={option}>
                  Especialidad {shortenId(option)}
                </option>
              ))}
            </select>
          </label>

          <label className="medical-field">
            <span>Fecha de atención</span>

            <select
              value={ticketDate}
              onChange={(event) =>
                setTicketDate(event.target.value)
              }
            >
              {dateOptions.length === 0 && (
                <option value="">
                  No existen fechas activas
                </option>
              )}

              {dateOptions.map((option) => (
                <option key={option} value={option}>
                  {formatDateOnly(option)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </article>

      <div className="queue-summary-grid">
        <article className="queue-summary-card">
          <span>Total en espera</span>
          <strong>{queue.length}</strong>
          <small>Pacientes pendientes de llamada</small>
        </article>

        <article className="queue-summary-card queue-summary-critical">
          <span>Prioridad muy alta</span>
          <strong>{prioritySummary.very_high}</strong>
          <small>Requieren atención inmediata</small>
        </article>

        <article className="queue-summary-card queue-summary-high">
          <span>Prioridad alta</span>
          <strong>{prioritySummary.high}</strong>
          <small>Atención prioritaria</small>
        </article>

        <article className="queue-summary-card queue-summary-preferential">
          <span>Atenciones completadas</span>
          <strong>{completedToday.length}</strong>
          <small>Finalizadas en la cola seleccionada</small>
        </article>
      </div>

      {activeTickets.length > 0 && (
        <article className="content-card active-care-card">
          <div className="appointments-section-header">
            <div>
              <span className="page-kicker">
                Atención actual
              </span>
              <h3>Pacientes llamados o en consulta</h3>
            </div>

            <span className="appointment-count">
              {activeTickets.length}
            </span>
          </div>

          <div className="active-care-list">
            {activeTickets.map((ticket) => (
              <article
                className="active-care-item"
                key={ticket.id}
              >
                <div>
                  <span>Número de ficha</span>
                  <h4>{ticket.ticketNumber}</h4>

                  <p>
                    {ticket.status === 'called'
                      ? `Paciente llamado a las ${formatTime(
                          ticket.calledAt,
                        )}`
                      : `Atención iniciada a las ${formatTime(
                          ticket.serviceStartedAt,
                        )}`}
                  </p>
                </div>

                <span
                  className={`active-care-status active-care-status-${ticket.status}`}
                >
                  {ticket.status === 'called'
                    ? 'Paciente llamado'
                    : 'En atención'}
                </span>

                <div className="active-care-actions">
                  {ticket.status === 'called' && (
                    <>
                      <button
                        className="medical-button medical-button-primary"
                        type="button"
                        disabled={actionTicketId === ticket.id}
                        onClick={() =>
                          void runTicketAction(
                            ticket,
                            startMedicalTicketService,
                            'La atención médica fue iniciada.',
                          )
                        }
                      >
                        Iniciar atención
                      </button>

                      <button
                        className="medical-button medical-button-danger"
                        type="button"
                        disabled={actionTicketId === ticket.id}
                        onClick={() =>
                          void runTicketAction(
                            ticket,
                            markMedicalTicketNoShow,
                            'El paciente fue marcado como no asistió.',
                          )
                        }
                      >
                        No se presentó
                      </button>
                    </>
                  )}

                  {ticket.status === 'in_service' && (
                    <button
                      className="medical-button medical-button-primary"
                      type="button"
                      disabled={actionTicketId === ticket.id}
                      onClick={() =>
                        void runTicketAction(
                          ticket,
                          completeMedicalTicketService,
                          'La atención médica fue completada.',
                        )
                      }
                    >
                      Finalizar atención
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </article>
      )}

      <article className="content-card queue-list-card">
        <div className="appointments-section-header">
          <div>
            <span className="page-kicker">
              Pacientes esperando
            </span>
            <h3>Orden actual de atención</h3>
          </div>

          <span className="appointment-count">
            {queue.length}
          </span>
        </div>

        {isLoadingTickets || isLoadingQueue ? (
          <div className="appointments-loading">
            <span className="medical-spinner" />
            <p>Consultando la cola de atención...</p>
          </div>
        ) : queue.length === 0 ? (
          <div className="queue-empty">
            <span>✓</span>
            <h4>No existen pacientes en espera</h4>
            <p>
              Los pacientes llamados o atendidos dejan de
              aparecer en la cola de espera.
            </p>
          </div>
        ) : (
          <div className="queue-list">
            {queue.map((ticket, index) => (
              <article
                className="queue-patient-card"
                key={ticket.id}
              >
                <div
                  className={`queue-position queue-position-${ticket.triagePriority}`}
                >
                  <span>Posición</span>
                  <strong>{index + 1}</strong>
                </div>

                <div className="queue-patient-information">
                  <div className="queue-patient-header">
                    <div>
                      <span>Número de ficha</span>
                      <h4>{ticket.ticketNumber}</h4>
                    </div>

                    <span
                      className={`ticket-priority ticket-priority-${ticket.triagePriority}`}
                    >
                      {priorityLabels[ticket.triagePriority]}
                    </span>
                  </div>

                  <div className="queue-patient-grid">
                    <div>
                      <span>Hora de llegada</span>
                      <strong>
                        {formatTime(ticket.checkedInAt)}
                      </strong>
                    </div>

                    <div>
                      <span>Secuencia diaria</span>
                      <strong>{ticket.dailySequence}</strong>
                    </div>

                    <div>
                      <span>Atención preferente</span>
                      <strong>
                        {
                          priorityPatientLabels[
                            ticket.priorityPatientType
                          ]
                        }
                      </strong>
                    </div>

                    <div>
                      <span>Estado</span>
                      <strong>En espera</strong>
                    </div>
                  </div>

                  <div className="queue-call-action">
                    <button
                      className="medical-button medical-button-primary"
                      type="button"
                      disabled={actionTicketId === ticket.id}
                      onClick={() =>
                        void runTicketAction(
                          ticket,
                          callMedicalTicketPatient,
                          `El paciente con ficha ${ticket.ticketNumber} fue llamado.`,
                        )
                      }
                    >
                      {actionTicketId === ticket.id
                        ? 'Llamando...'
                        : 'Llamar paciente'}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}