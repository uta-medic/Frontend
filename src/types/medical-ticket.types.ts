import type { TriagePriority } from './triage.types';

export type PriorityPatientType =
  | 'none'
  | 'older_adult'
  | 'pregnant'
  | 'disability'
  | 'child'
  | 'dependent_patient'
  | 'other';

export type MedicalTicketStatus =
  | 'waiting_for_triage'
  | 'ready_for_check_in'
  | 'waiting'
  | 'called'
  | 'in_service'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface MedicalTicket {
  id: string;
  appointmentId: string;
  triageAssessmentId: string;
  hospitalId: string;
  specialtyId: string;
  ticketNumber: string;
  dailySequence: number;
  ticketDate: string;
  triagePriority: TriagePriority;
  priorityPatientType: PriorityPatientType;
  hasPriorityCare: boolean;
  status: MedicalTicketStatus;
  checkedInAt: string | null;
  calledAt: string | null;
  serviceStartedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMedicalTicketPayload {
  triageAssessmentId: string;
  priorityPatientType?: PriorityPatientType;
}

export interface MedicalTicketPosition {
  ticketId: string;
  ticketNumber: string;
  position: number;
  totalWaiting: number;
  hospitalId: string;
  specialtyId: string;
  ticketDate: string;
}

export interface MedicalTicketQueueQuery {
  hospitalId: string;
  specialtyId: string;
  ticketDate?: string;
}