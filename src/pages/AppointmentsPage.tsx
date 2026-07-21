import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { FormEvent } from 'react';

import { ApiError } from '../api/api-client';
import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  updateAppointment,
} from '../api/appointments.api';

import type {
  Appointment,
  AppointmentStatus,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '../types/appointment.types';

interface CreateAppointmentForm {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  specialtyId: string;
  scheduledAt: string;
  reason: string;
}

interface EditAppointmentForm {
  scheduledAt: string;
  reason: string;
  status: AppointmentStatus;
}

const initialCreateForm: CreateAppointmentForm = {
  patientId: '',
  doctorId: '',
  hospitalId: '',
  specialtyId: '',
  scheduledAt: '',
  reason: '',
};

const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Programada',
  confirmed: 'Confirmada',
  waiting: 'En espera',
  in_progress: 'En atención',
  completed: 'Completada',
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

function formatAppointmentDate(value: string): string {
  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value));
}

function toDateTimeLocal(value: string): string {
  const date = new Date(value);
  const timezoneOffset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - timezoneOffset)
    .toISOString()
    .slice(0, 16);
}

function shortenId(value: string): string {
  return `${value.slice(0, 8)}...${value.slice(-4)}`;
}

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<
    Appointment[]
  >([]);

  const [createForm, setCreateForm] =
    useState<CreateAppointmentForm>(initialCreateForm);

  const [editingId, setEditingId] = useState<
    string | null
  >(null);

  const [editForm, setEditForm] =
    useState<EditAppointmentForm | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<
    string | null
  >(null);

  const [errorMessage, setErrorMessage] = useState<
    string | null
  >(null);

  const [successMessage, setSuccessMessage] = useState<
    string | null
  >(null);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((first, second) => {
      return (
        new Date(first.scheduledAt).getTime() -
        new Date(second.scheduledAt).getTime()
      );
    });
  }, [appointments]);

  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const response = await getAppointments();
      setAppointments(response);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAppointments();
  }, [loadAppointments]);

  async function handleCreate(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const selectedDate = new Date(
      createForm.scheduledAt,
    );

    if (Number.isNaN(selectedDate.getTime())) {
      setErrorMessage(
        'Selecciona una fecha y hora válidas',
      );
      return;
    }

    try {
      setIsCreating(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const payload: CreateAppointmentPayload = {
        patientId: createForm.patientId.trim(),
        doctorId: createForm.doctorId.trim(),
        hospitalId: createForm.hospitalId.trim(),
        specialtyId: createForm.specialtyId.trim(),
        scheduledAt: selectedDate.toISOString(),
        reason: createForm.reason.trim(),
      };

      const createdAppointment =
        await createAppointment(payload);

      setAppointments((current) => [
        ...current,
        createdAppointment,
      ]);

      setCreateForm(initialCreateForm);

      setSuccessMessage(
        'La cita médica fue registrada correctamente',
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsCreating(false);
    }
  }

  function startEditing(appointment: Appointment) {
    setEditingId(appointment.id);

    setEditForm({
      scheduledAt: toDateTimeLocal(
        appointment.scheduledAt,
      ),
      reason: appointment.reason,
      status: appointment.status,
    });

    setErrorMessage(null);
    setSuccessMessage(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditForm(null);
  }

  async function handleUpdate(
    appointmentId: string,
  ) {
    if (!editForm) {
      return;
    }

    const selectedDate = new Date(editForm.scheduledAt);

    if (Number.isNaN(selectedDate.getTime())) {
      setErrorMessage(
        'Selecciona una fecha y hora válidas',
      );
      return;
    }

    try {
      setIsUpdating(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      const payload: UpdateAppointmentPayload = {
        scheduledAt: selectedDate.toISOString(),
        reason: editForm.reason.trim(),
        status: editForm.status,
      };

      const updatedAppointment =
        await updateAppointment(appointmentId, payload);

      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === appointmentId
            ? updatedAppointment
            : appointment,
        ),
      );

      cancelEditing();

      setSuccessMessage(
        'La cita médica fue actualizada correctamente',
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete(
    appointment: Appointment,
  ) {
    const confirmed = window.confirm(
      `¿Eliminar la cita programada para ${formatAppointmentDate(
        appointment.scheduledAt,
      )}?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(appointment.id);
      setErrorMessage(null);
      setSuccessMessage(null);

      await deleteAppointment(appointment.id);

      setAppointments((current) =>
        current.filter(
          (item) => item.id !== appointment.id,
        ),
      );

      setSuccessMessage(
        'La cita médica fue eliminada correctamente',
      );
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section>
      <div className="page-heading appointments-heading">
        <div>
          <span className="page-kicker">
            Gestión de consultas
          </span>

          <h2>Citas médicas</h2>

          <p>
            Programa nuevas consultas y administra las citas
            registradas en el sistema.
          </p>
        </div>

        <button
          className="medical-button medical-button-secondary"
          type="button"
          onClick={() => void loadAppointments()}
          disabled={isLoading}
        >
          {isLoading ? 'Actualizando...' : 'Actualizar lista'}
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

      <div className="appointments-workspace">
        <article className="content-card appointment-form-panel">
          <div className="appointments-section-header">
            <div>
              <span className="page-kicker">
                Nueva consulta
              </span>
              <h3>Registrar una cita</h3>
            </div>

            <span className="appointments-section-icon">
              +
            </span>
          </div>

          <form
            className="appointment-form"
            onSubmit={(event) => void handleCreate(event)}
          >
            <label className="medical-field">
              <span>Paciente</span>
              <input
                required
                value={createForm.patientId}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    patientId: event.target.value,
                  }))
                }
                placeholder="Identificador del paciente"
              />
            </label>

            <label className="medical-field">
              <span>Médico</span>
              <input
                required
                value={createForm.doctorId}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    doctorId: event.target.value,
                  }))
                }
                placeholder="Identificador del médico"
              />
            </label>

            <label className="medical-field">
              <span>Centro médico</span>
              <input
                required
                value={createForm.hospitalId}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    hospitalId: event.target.value,
                  }))
                }
                placeholder="Identificador del centro"
              />
            </label>

            <label className="medical-field">
              <span>Especialidad</span>
              <input
                required
                value={createForm.specialtyId}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    specialtyId: event.target.value,
                  }))
                }
                placeholder="Identificador de la especialidad"
              />
            </label>

            <label className="medical-field medical-field-full">
              <span>Fecha y hora de atención</span>
              <input
                required
                type="datetime-local"
                value={createForm.scheduledAt}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    scheduledAt: event.target.value,
                  }))
                }
              />
            </label>

            <label className="medical-field medical-field-full">
              <span>Motivo de la consulta</span>
              <textarea
                required
                rows={4}
                maxLength={500}
                value={createForm.reason}
                onChange={(event) =>
                  setCreateForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                placeholder="Describe brevemente el motivo de la consulta"
              />
            </label>

            <button
              className="medical-button medical-button-primary medical-field-full"
              type="submit"
              disabled={isCreating}
            >
              {isCreating
                ? 'Registrando cita...'
                : 'Registrar cita médica'}
            </button>
          </form>

          <div className="appointment-form-note">
            <strong>Nota del MVP</strong>
            <p>
              Los identificadores se escriben manualmente porque
              todavía no existen endpoints para listar pacientes,
              médicos, centros y especialidades.
            </p>
          </div>
        </article>

        <article className="content-card appointment-list-panel">
          <div className="appointments-section-header">
            <div>
              <span className="page-kicker">
                Agenda hospitalaria
              </span>
              <h3>Citas registradas</h3>
            </div>

            <span className="appointment-count">
              {appointments.length}
            </span>
          </div>

          {isLoading ? (
            <div className="appointments-loading">
              <span className="medical-spinner" />
              <p>Cargando las citas médicas...</p>
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="appointments-empty">
              <span>▣</span>
              <h4>No existen citas registradas</h4>
              <p>
                Completa el formulario para registrar la primera
                consulta.
              </p>
            </div>
          ) : (
            <div className="appointments-list">
              {sortedAppointments.map((appointment) => {
                const isEditing =
                  editingId === appointment.id;

                return (
                  <article
                    className="appointment-item"
                    key={appointment.id}
                  >
                    {isEditing && editForm ? (
                      <div className="appointment-edit-form">
                        <div className="appointment-edit-heading">
                          <div>
                            <span>Editando cita</span>
                            <strong>
                              {shortenId(appointment.id)}
                            </strong>
                          </div>
                        </div>

                        <label className="medical-field">
                          <span>Fecha y hora</span>
                          <input
                            type="datetime-local"
                            value={editForm.scheduledAt}
                            onChange={(event) =>
                              setEditForm((current) =>
                                current
                                  ? {
                                      ...current,
                                      scheduledAt:
                                        event.target.value,
                                    }
                                  : current,
                              )
                            }
                          />
                        </label>

                        <label className="medical-field">
                          <span>Estado</span>
                          <select
                            value={editForm.status}
                            onChange={(event) =>
                              setEditForm((current) =>
                                current
                                  ? {
                                      ...current,
                                      status: event.target
                                        .value as AppointmentStatus,
                                    }
                                  : current,
                              )
                            }
                          >
                            {Object.entries(statusLabels).map(
                              ([status, label]) => (
                                <option
                                  key={status}
                                  value={status}
                                >
                                  {label}
                                </option>
                              ),
                            )}
                          </select>
                        </label>

                        <label className="medical-field medical-field-full">
                          <span>Motivo</span>
                          <textarea
                            rows={3}
                            maxLength={500}
                            value={editForm.reason}
                            onChange={(event) =>
                              setEditForm((current) =>
                                current
                                  ? {
                                      ...current,
                                      reason:
                                        event.target.value,
                                    }
                                  : current,
                              )
                            }
                          />
                        </label>

                        <div className="appointment-edit-actions">
                          <button
                            className="medical-button medical-button-ghost"
                            type="button"
                            onClick={cancelEditing}
                          >
                            Cancelar
                          </button>

                          <button
                            className="medical-button medical-button-primary"
                            type="button"
                            disabled={isUpdating}
                            onClick={() =>
                              void handleUpdate(
                                appointment.id,
                              )
                            }
                          >
                            {isUpdating
                              ? 'Guardando...'
                              : 'Guardar cambios'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="appointment-item-header">
                          <div>
                            <span className="appointment-item-date">
                              {formatAppointmentDate(
                                appointment.scheduledAt,
                              )}
                            </span>

                            <h4>{appointment.reason}</h4>
                          </div>

                          <span
                            className={`appointment-status appointment-status-${appointment.status}`}
                          >
                            {statusLabels[appointment.status]}
                          </span>
                        </div>

                        <div className="appointment-information-grid">
                          <div>
                            <span>Paciente</span>
                            <strong
                              title={appointment.patientId}
                            >
                              {shortenId(
                                appointment.patientId,
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Médico</span>
                            <strong
                              title={appointment.doctorId}
                            >
                              {shortenId(
                                appointment.doctorId,
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Centro médico</span>
                            <strong
                              title={appointment.hospitalId}
                            >
                              {shortenId(
                                appointment.hospitalId,
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>Especialidad</span>
                            <strong
                              title={
                                appointment.specialtyId
                              }
                            >
                              {shortenId(
                                appointment.specialtyId,
                              )}
                            </strong>
                          </div>
                        </div>

                        <div className="appointment-item-actions">
                          <button
                            className="medical-button medical-button-secondary"
                            type="button"
                            onClick={() =>
                              startEditing(appointment)
                            }
                          >
                            Editar
                          </button>

                          <button
                            className="medical-button medical-button-danger"
                            type="button"
                            disabled={
                              deletingId === appointment.id
                            }
                            onClick={() =>
                              void handleDelete(appointment)
                            }
                          >
                            {deletingId === appointment.id
                              ? 'Eliminando...'
                              : 'Eliminar'}
                          </button>
                        </div>
                      </>
                    )}
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