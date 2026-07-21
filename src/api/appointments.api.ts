import type {
  Appointment,
  CreateAppointmentPayload,
  UpdateAppointmentPayload,
} from '../types/appointment.types';

import { apiRequest } from './api-client';

export function getAppointments(): Promise<Appointment[]> {
  return apiRequest<Appointment[]>('/appointments');
}

export function getAppointment(
  appointmentId: string,
): Promise<Appointment> {
  return apiRequest<Appointment>(
    `/appointments/${appointmentId}`,
  );
}

export function createAppointment(
  payload: CreateAppointmentPayload,
): Promise<Appointment> {
  return apiRequest<Appointment>('/appointments', {
    method: 'POST',
    body: payload,
  });
}

export function updateAppointment(
  appointmentId: string,
  payload: UpdateAppointmentPayload,
): Promise<Appointment> {
  return apiRequest<Appointment>(
    `/appointments/${appointmentId}`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}

export function deleteAppointment(
  appointmentId: string,
): Promise<void> {
  return apiRequest<void>(
    `/appointments/${appointmentId}`,
    {
      method: 'DELETE',
    },
  );
}