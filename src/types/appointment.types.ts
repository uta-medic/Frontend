export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'waiting'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId: string;
  specialtyId: string;
  scheduledAt: string;
  reason: string;
  status: AppointmentStatus;
  cancellationReason: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentPayload {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  specialtyId: string;
  scheduledAt: string;
  reason: string;
}

export interface UpdateAppointmentPayload {
  scheduledAt?: string;
  reason?: string;
  status?: AppointmentStatus;
  cancellationReason?: string | null;
}