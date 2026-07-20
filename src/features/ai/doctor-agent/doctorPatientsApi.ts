import { httpClient } from '../../../config/httpClient';
import { AiApiError, toAiApiError } from '../shared/api/aiApi.errors';
import type { DemoPatient } from '../shared/types/ai.types';

interface DoctorPatientResponse {
  patientId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  approximateAge: number;
  sex: string | null;
  bloodType: string | null;
  documentCode: string | null;
  phone: string | null;
  assignedAt: string | null;
  lastEncounter: {
    reason: string | null;
    status: string | null;
    startedAt: string | null;
  };
}

interface DoctorPatientsResponse {
  count: number;
  patients: DoctorPatientResponse[];
}

const MOCK_DOCTOR_USER_ID = '1fffff44-a958-4367-b046-e10ce34d6432';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNullableString(value: unknown): value is string | null {
  return typeof value === 'string' || value === null;
}

function isDoctorPatient(value: unknown): value is DoctorPatientResponse {
  if (!isRecord(value) || !isRecord(value.lastEncounter)) return false;

  return (
    typeof value.patientId === 'string' &&
    typeof value.firstName === 'string' &&
    typeof value.lastName === 'string' &&
    typeof value.fullName === 'string' &&
    typeof value.approximateAge === 'number' &&
    isNullableString(value.sex) &&
    isNullableString(value.bloodType) &&
    isNullableString(value.documentCode) &&
    isNullableString(value.phone) &&
    isNullableString(value.assignedAt) &&
    isNullableString(value.lastEncounter.reason) &&
    isNullableString(value.lastEncounter.status) &&
    isNullableString(value.lastEncounter.startedAt)
  );
}

function toPatient(patient: DoctorPatientResponse): DemoPatient {
  return {
    patientId: patient.patientId,
    displayName: patient.fullName,
    age: patient.approximateAge,
    sex: patient.sex ?? undefined,
    bloodType: patient.bloodType ?? undefined,
    documentCode: patient.documentCode ?? undefined,
    phone: patient.phone ?? undefined,
    assignedAt: patient.assignedAt ?? undefined,
    lastEncounterStatus: patient.lastEncounter.status ?? undefined,
    lastEncounterAt: patient.lastEncounter.startedAt ?? undefined,
    currentHospital: 'No disponible en este endpoint',
    chiefComplaint: patient.lastEncounter.reason ?? 'Sin consulta reciente registrada',
    symptoms: [],
    alerts: [],
    allergies: [],
    activeConditions: [],
    activeMedications: [],
    recentConsultations: [],
    recentLaboratoryResults: [],
    recentVitalSigns: [],
    missingInformation: [],
    contradictions: [],
    sources: [],
  };
}

export async function getDoctorPatients(
  signal?: AbortSignal,
) {
  try {
    const { data } = await httpClient.get<DoctorPatientsResponse>(
      '/doctor-ai/patients',
      {
        headers: { 'x-doctor-user-id': MOCK_DOCTOR_USER_ID },
        signal,
      },
    );

    if (
      !isRecord(data) ||
      typeof data.count !== 'number' ||
      !Array.isArray(data.patients) ||
      !data.patients.every(isDoctorPatient)
    ) {
      throw new AiApiError(
        'El backend devolvió una lista de pacientes inválida.',
        'invalid-response',
      );
    }

    return data.patients.map(toPatient);
  } catch (error) {
    if (signal?.aborted) {
      throw new DOMException('Solicitud cancelada', 'AbortError');
    }
    throw toAiApiError(error);
  }
}
