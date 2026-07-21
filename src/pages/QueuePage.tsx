import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { ApiError } from '../api/api-client';
import {
  getMedicalTicketQueue,
  getMedicalTickets,
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

  const [queue, setQueue] = useState<MedicalTicket[]>(
    [],
  );

  const [hospitalId, setHospitalId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [ticketDate, setTicketDate] = useState('');

  const [isLoadingTickets, setIsLoadingTickets] =
    useState(true);

  const [isLoadingQueue, setIsLoadingQueue] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const waitingTickets = useMemo(() => {
    return allTickets.filter(
      (ticket) => ticket.status === 'waiting',
    );
  }, [allTickets]);

  const hospitalOptions = useMemo(() => {
    return Array.from(
      new Set(
        waitingTickets.map((ticket) => ticket.hospitalId),
      ),
    );
  }, [waitingTickets]);

  const specialtyOptions = useMemo(() => {
    return Array.from(
      new Set(
        waitingTickets
          .filter(
            (ticket) =>
              !hospitalId ||
              ticket.hospitalId === hospitalId,
          )
          .map((ticket) => ticket.specialtyId),
      ),
    );
  }, [waitingTickets, hospitalId]);

  const dateOptions = useMemo(() => {
    return Array.from(
      new Set(
        waitingTickets
          .filter(
            (ticket) =>
              (!hospitalId ||
                ticket.hospitalId === hospitalId) &&
              (!specialtyId ||
                ticket.specialtyId === specialtyId),
          )
          .map((ticket) => ticket.ticketDate),
      ),
    ).sort();
  }, [waitingTickets, hospitalId, specialtyId]);

  const prioritySummary = useMemo(() => {
    return queue.reduce<Record<TriagePriority, number>>(
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
    );
  }, [queue]);

  const loadTickets = useCallback(async () => {
    try {
      setIsLoadingTickets(true);
      setErrorMessage(null);

      const response = await getMedicalTickets();
      setAllTickets(response);

      const firstWaitingTicket = response.find(
        (ticket) => ticket.status === 'waiting',
      );

      if (firstWaitingTicket) {
        setHospitalId(firstWaitingTicket.hospitalId);
        setSpecialtyId(firstWaitingTicket.specialtyId);
        setTicketDate(firstWaitingTicket.ticketDate);
      } else {
        setHospitalId('');
        setSpecialtyId('');
        setTicketDate('');
        setQueue([]);
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

  function handleHospitalChange(value: string) {
    setHospitalId(value);

    const firstMatchingTicket = waitingTickets.find(
      (ticket) => ticket.hospitalId === value,
    );

    setSpecialtyId(
      firstMatchingTicket?.specialtyId ?? '',
    );

    setTicketDate(
      firstMatchingTicket?.ticketDate ?? '',
    );
  }

  function handleSpecialtyChange(value: string) {
    setSpecialtyId(value);

    const firstMatchingTicket = waitingTickets.find(
      (ticket) =>
        ticket.hospitalId === hospitalId &&
        ticket.specialtyId === value,
    );

    setTicketDate(
      firstMatchingTicket?.ticketDate ?? '',
    );
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
            Consulta el orden de atención según la prioridad
            clínica, atención preferente y hora de llegada.
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
          <strong>No se pudo consultar la cola</strong>
          <span>{errorMessage}</span>
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
              disabled={hospitalOptions.length === 0}
              onChange={(event) =>
                handleHospitalChange(event.target.value)
              }
            >
              {hospitalOptions.length === 0 && (
                <option value="">
                  No existen centros con pacientes en espera
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
              disabled={specialtyOptions.length === 0}
              onChange={(event) =>
                handleSpecialtyChange(event.target.value)
              }
            >
              {specialtyOptions.length === 0 && (
                <option value="">
                  No existen especialidades disponibles
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
              disabled={dateOptions.length === 0}
              onChange={(event) =>
                setTicketDate(event.target.value)
              }
            >
              {dateOptions.length === 0 && (
                <option value="">
                  No existen fechas disponibles
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
          <small>Pacientes en la cola seleccionada</small>
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
          <span>Atención preferente</span>
          <strong>
            {
              queue.filter(
                (ticket) => ticket.hasPriorityCare,
              ).length
            }
          </strong>
          <small>Pacientes con condición preferente</small>
        </article>
      </div>

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
              No se encontraron fichas activas para el centro,
              especialidad y fecha seleccionados.
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
                      <strong>
                        {ticket.dailySequence}
                      </strong>
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
                </div>
              </article>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}