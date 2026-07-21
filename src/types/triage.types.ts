export type TriageAssessmentStatus =
  | 'pending_review'
  | 'reviewed'
  | 'requires_more_information'
  | 'cancelled';

export type TriagePriority =
  | 'low'
  | 'medium'
  | 'medium_high'
  | 'high'
  | 'very_high';

export interface TriageAssessment {
  id: string;
  appointmentId: string;
  reportedSymptoms: string;
  additionalNotes: string | null;
  status: TriageAssessmentStatus;
  assignedPriority: TriagePriority | null;
  reviewedByUserId: string | null;
  reviewNotes: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTriageAssessmentPayload {
  appointmentId: string;
  reportedSymptoms: string;
  additionalNotes?: string;
}

export interface ReviewTriageAssessmentPayload {
  assignedPriority: TriagePriority;
  reviewedByUserId: string;
  reviewNotes?: string;
}