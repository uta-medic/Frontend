export type AiAgent = 'user' | 'doctor';

export type AiResponseType =
  | 'general'
  | 'symptom-guidance'
  | 'specialty-suggestion'
  | 'health-center-search'
  | 'schedule-information'
  | 'price-information'
  | 'medical-service-search'
  | 'emergency-warning';

export interface SuggestedSpecialty {
  id: string;
  name: string;
  description: string;
  reason: string;
}

export interface ScheduleEntry {
  day: string;
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
  notes?: string;
}

export interface CostItem {
  service: string;
  amount?: number;
  currency?: string;
  isFree?: boolean;
  isSimulated?: boolean;
}

export type CenterAvailability = 'available' | 'limited' | 'unavailable';

export interface HealthCenter {
  id: string;
  name: string;
  type?: string;
  address?: string;
  zone?: string;
  specialties?: string[];
  services?: string[];
  schedules?: ScheduleEntry[];
  costs?: CostItem[];
  institutionalPhone?: string;
  availability?: CenterAvailability;
}

export interface InformationSource {
  id?: string;
  title: string;
  type: string;
  center?: string;
  updatedAt?: string;
}

interface BaseChatMessage {
  id: string;
  content: string;
  createdAt: string;
}

export interface UserChatMessage extends BaseChatMessage {
  role: 'user';
}

export interface AssistantChatMessage extends BaseChatMessage {
  role: 'assistant';
  responseType: AiResponseType;
  requiresMedicalEvaluation?: boolean;
  emergencyWarning?: string;
  suggestedSpecialties?: SuggestedSpecialty[];
  healthCenters?: HealthCenter[];
  sources?: InformationSource[];
  noResults?: boolean;
}

export type ChatMessage = UserChatMessage | AssistantChatMessage;

export interface AuthorizedLocation {
  latitude: number;
  longitude: number;
  source: 'browser-permission';
}

export interface SendMessageContext {
  location?: AuthorizedLocation;
  manualZone?: string;
  patientId?: string;
}

export interface SendMessageInput {
  agent: AiAgent;
  message: string;
  conversationId?: string;
  context?: SendMessageContext;
}

export interface SendMessageResult {
  message: AssistantChatMessage;
  conversationId: string;
}

export interface ConversationInput {
  agent: AiAgent;
  conversationId: string;
}

export interface AiApiProvider {
  sendMessage(
    input: SendMessageInput,
    options?: { signal?: AbortSignal },
  ): Promise<SendMessageResult>;
  getConversationMessages?(
    input: ConversationInput,
    options?: { signal?: AbortSignal },
  ): Promise<ChatMessage[]>;
  deleteConversation?(
    input: ConversationInput,
    options?: { signal?: AbortSignal },
  ): Promise<void>;
  generateClinicalSummary(
    input: GenerateClinicalSummaryInput,
    options?: { signal?: AbortSignal },
  ): Promise<ClinicalSummary>;
  generateDifferential(
    input: GenerateDifferentialInput,
    options?: { signal?: AbortSignal },
  ): Promise<ClinicalDifferentialResult>;
}

export type AiErrorCode =
  | 'offline'
  | 'unavailable'
  | 'rate-limit'
  | 'timeout'
  | 'forbidden'
  | 'invalid-response'
  | 'general';

export type ClinicalRecordStatus =
  | 'confirmed-record'
  | 'pending'
  | 'requires-verification';

export interface ClinicalSource {
  recordType: string;
  date: string;
  medicalCenter: string;
  status: ClinicalRecordStatus;
  internalId?: string;
}

export interface ClinicalAlert {
  id: string;
  title: string;
  description: string;
  protocolRecommendation?: string;
  source: ClinicalSource;
}

export interface ClinicalAllergy {
  id: string;
  substance: string;
  reaction?: string;
  severity?: 'low' | 'moderate' | 'high';
  source: ClinicalSource;
}

export interface ActiveCondition {
  id: string;
  name: string;
  status: string;
  diagnosedAt?: string;
  source: ClinicalSource;
}

export interface ActiveMedication {
  id: string;
  name: string;
  documentedDose?: string;
  frequency?: string;
  route?: string;
  status: string;
  source: ClinicalSource;
}

export interface RecentConsultation {
  id: string;
  date: string;
  specialty: string;
  reason: string;
  summary: string;
  source: ClinicalSource;
}

export interface LaboratoryResult {
  id: string;
  test: string;
  value?: string;
  unit?: string;
  referenceRange?: string;
  status: 'within-range' | 'outside-range' | 'pending';
  date: string;
  source: ClinicalSource;
}

export interface VitalSignsRecord {
  id: string;
  date: string;
  bloodPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  temperature?: string;
  oxygenSaturation?: string;
  source: ClinicalSource;
}

export interface ContradictionVersion {
  value: string;
  source: ClinicalSource;
}

export interface ClinicalContradiction {
  id: string;
  description: string;
  firstVersion: ContradictionVersion;
  secondVersion: ContradictionVersion;
  reviewMessage: string;
}

export interface DemoPatient {
  patientId: string;
  displayName: string;
  age: number;
  sex?: string;
  bloodType?: string;
  documentCode?: string;
  phone?: string;
  assignedAt?: string;
  lastEncounterStatus?: string;
  lastEncounterAt?: string;
  currentHospital: string;
  chiefComplaint: string;
  symptoms: string[];
  alerts: ClinicalAlert[];
  allergies: ClinicalAllergy[];
  activeConditions: ActiveCondition[];
  activeMedications: ActiveMedication[];
  recentConsultations: RecentConsultation[];
  recentLaboratoryResults: LaboratoryResult[];
  recentVitalSigns: VitalSignsRecord[];
  missingInformation: string[];
  contradictions: ClinicalContradiction[];
  sources: ClinicalSource[];
}

export interface ClinicalSummary {
  patientId: string;
  summary: string;
  alerts: ClinicalAlert[];
  allergies: ClinicalAllergy[];
  activeConditions: ActiveCondition[];
  activeMedications: ActiveMedication[];
  recentConsultations: RecentConsultation[];
  recentLaboratoryResults: LaboratoryResult[];
  recentVitalSigns: VitalSignsRecord[];
  missingInformation: string[];
  contradictions: ClinicalContradiction[];
  sources: ClinicalSource[];
  requiresProfessionalReview: true;
  generatedAt: string;
}

export interface GenerateClinicalSummaryInput {
  patientId: string;
}

export interface DifferentialRequest {
  chiefComplaint: string;
  symptoms: string[];
  duration: string;
  additionalContext?: string;
}

export interface GenerateDifferentialInput extends DifferentialRequest {
  patientId: string;
}

export interface DifferentialPossibility {
  id: string;
  name: string;
  supportingElements: string[];
  elementsThatDoNotFit: string[];
}

export interface ClinicalWarningSign {
  id: string;
  text: string;
  explanation: string;
  protocolRecommendation: string;
}

export interface ClinicalDifferentialResult {
  possibilities: DifferentialPossibility[];
  supportingElements: string[];
  missingOrContradictoryData: string[];
  suggestedQuestions: string[];
  warningSigns: ClinicalWarningSign[];
  sources: ClinicalSource[];
  disclaimer: string;
  requiresProfessionalReview: true;
  generatedAt: string;
}
