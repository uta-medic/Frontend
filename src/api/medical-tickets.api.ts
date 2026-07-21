import type {
  CreateMedicalTicketPayload,
  MedicalTicket,
  MedicalTicketPosition,
  MedicalTicketQueueQuery,
} from '../types/medical-ticket.types';

import { apiRequest } from './api-client';

export function getMedicalTickets(): Promise<
  MedicalTicket[]
> {
  return apiRequest<MedicalTicket[]>('/medical-tickets');
}

export function getMedicalTicket(
  ticketId: string,
): Promise<MedicalTicket> {
  return apiRequest<MedicalTicket>(
    `/medical-tickets/${ticketId}`,
  );
}

export function createMedicalTicket(
  payload: CreateMedicalTicketPayload,
): Promise<MedicalTicket> {
  return apiRequest<MedicalTicket>('/medical-tickets', {
    method: 'POST',
    body: payload,
  });
}

export function checkInMedicalTicket(
  ticketId: string,
): Promise<MedicalTicket> {
  return apiRequest<MedicalTicket>(
    `/medical-tickets/${ticketId}/check-in`,
    {
      method: 'PATCH',
    },
  );
}

export function getMedicalTicketPosition(
  ticketId: string,
): Promise<MedicalTicketPosition> {
  return apiRequest<MedicalTicketPosition>(
    `/medical-tickets/${ticketId}/position`,
  );
}

export function getMedicalTicketQueue(
  query: MedicalTicketQueueQuery,
): Promise<MedicalTicket[]> {
  const searchParams = new URLSearchParams({
    hospitalId: query.hospitalId,
    specialtyId: query.specialtyId,
  });

  if (query.ticketDate) {
    searchParams.set('ticketDate', query.ticketDate);
  }

  return apiRequest<MedicalTicket[]>(
    `/medical-tickets/queue?${searchParams.toString()}`,
  );
}