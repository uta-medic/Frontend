import type {
  CreateTriageAssessmentPayload,
  ReviewTriageAssessmentPayload,
  TriageAssessment,
} from '../types/triage.types';

import { apiRequest } from './api-client';

export function getTriageAssessments(): Promise<
  TriageAssessment[]
> {
  return apiRequest<TriageAssessment[]>(
    '/triage-assessments',
  );
}

export function getPendingTriageAssessments(): Promise<
  TriageAssessment[]
> {
  return apiRequest<TriageAssessment[]>(
    '/triage-assessments/pending',
  );
}

export function getTriageAssessment(
  assessmentId: string,
): Promise<TriageAssessment> {
  return apiRequest<TriageAssessment>(
    `/triage-assessments/${assessmentId}`,
  );
}

export function createTriageAssessment(
  payload: CreateTriageAssessmentPayload,
): Promise<TriageAssessment> {
  return apiRequest<TriageAssessment>(
    '/triage-assessments',
    {
      method: 'POST',
      body: payload,
    },
  );
}

export function reviewTriageAssessment(
  assessmentId: string,
  payload: ReviewTriageAssessmentPayload,
): Promise<TriageAssessment> {
  return apiRequest<TriageAssessment>(
    `/triage-assessments/${assessmentId}/review`,
    {
      method: 'PATCH',
      body: payload,
    },
  );
}