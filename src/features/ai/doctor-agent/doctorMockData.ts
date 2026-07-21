import type {
  ClinicalDifferentialResult,
  ClinicalSource,
  ClinicalSummary,
  DemoPatient,
  DifferentialRequest,
} from '../shared/types/ai.types';
import { DOCTOR_DIFFERENTIAL_DISCLAIMER } from './doctorAgent.config';

const centralRecord: ClinicalSource = {
  recordType: 'Historia clínica demo',
  date: '2026-07-18',
  medicalCenter: 'Hospital Universitario Ficticio Central',
  status: 'confirmed-record',
  internalId: 'DEMO-HC-1001',
};

const outpatientRecord: ClinicalSource = {
  recordType: 'Consulta ambulatoria demo',
  date: '2026-07-12',
  medicalCenter: 'Centro Clínico Ficticio Norte',
  status: 'confirmed-record',
  internalId: 'DEMO-CA-204',
};

const pendingLabRecord: ClinicalSource = {
  recordType: 'Laboratorio demo',
  date: '2026-07-19',
  medicalCenter: 'Laboratorio Docente Ficticio',
  status: 'pending',
  internalId: 'DEMO-LAB-778',
};

export const DEMO_PATIENTS: DemoPatient[] = [
  {
    patientId: 'DEMO-CL-001',
    displayName: 'Paciente Demo A',
    age: 46,
    sex: 'Femenino',
    currentHospital: 'Hospital Universitario Ficticio Central',
    chiefComplaint: 'Fatiga y mareos intermitentes',
    symptoms: ['Fatiga', 'Mareos al incorporarse', 'Cefalea ocasional'],
    alerts: [
      {
        id: 'alert-allergy-001',
        title: 'Alergia medicamentosa importante',
        description: 'Antecedente documentado de urticaria tras penicilina.',
        protocolRecommendation: 'Verificar alergia antes de cualquier indicación farmacológica.',
        source: centralRecord,
      },
    ],
    allergies: [
      {
        id: 'allergy-001',
        substance: 'Penicilina',
        reaction: 'Urticaria generalizada documentada',
        severity: 'high',
        source: centralRecord,
      },
    ],
    activeConditions: [
      { id: 'condition-001', name: 'Hipertensión arterial', status: 'En seguimiento', diagnosedAt: '2021-04-10', source: centralRecord },
      { id: 'condition-002', name: 'Anemia en estudio', status: 'Evaluación pendiente', source: outpatientRecord },
    ],
    activeMedications: [
      { id: 'med-001', name: 'Losartán', documentedDose: '50 mg', frequency: 'Cada 24 horas', route: 'Oral', status: 'Activo según registro', source: centralRecord },
      { id: 'med-002', name: 'Sulfato ferroso', documentedDose: 'Dosis no verificada', frequency: 'Frecuencia pendiente de confirmar', route: 'Oral', status: 'Reportado por paciente', source: outpatientRecord },
    ],
    recentConsultations: [
      { id: 'consult-001', date: '2026-07-12', specialty: 'Medicina interna', reason: 'Fatiga persistente', summary: 'Se solicitaron hemograma y perfil tiroideo. Pendiente correlación clínica.', source: outpatientRecord },
    ],
    recentLaboratoryResults: [
      { id: 'lab-001', test: 'Hemoglobina', value: '10.8', unit: 'g/dL', referenceRange: '12.0–16.0', status: 'outside-range', date: '2026-07-18', source: centralRecord },
      { id: 'lab-002', test: 'TSH', status: 'pending', date: '2026-07-19', source: pendingLabRecord },
    ],
    recentVitalSigns: [
      { id: 'vitals-001', date: '2026-07-18', bloodPressure: '108/68 mmHg', heartRate: '86 lpm', respiratoryRate: '17 rpm', temperature: '36.6 °C', oxygenSaturation: '97 %', source: centralRecord },
    ],
    missingInformation: ['Duración exacta de los mareos', 'Adherencia farmacológica verificada', 'Resultado pendiente de TSH'],
    contradictions: [
      {
        id: 'contradiction-001',
        description: 'Frecuencia de sulfato ferroso no coincide entre registros.',
        firstVersion: { value: 'Una vez al día', source: outpatientRecord },
        secondVersion: { value: 'Días alternos', source: { ...centralRecord, date: '2026-07-18', status: 'requires-verification' } },
        reviewMessage: 'Se encontró información contradictoria que requiere verificación profesional.',
      },
    ],
    sources: [centralRecord, outpatientRecord, pendingLabRecord],
  },
  {
    patientId: 'DEMO-CL-002',
    displayName: 'Paciente Demo B',
    age: 62,
    sex: 'Masculino',
    currentHospital: 'Clínica Docente Ficticia Sur',
    chiefComplaint: 'Molestia torácica de características no definidas',
    symptoms: ['Molestia torácica intermitente', 'Disnea de esfuerzo referida'],
    alerts: [
      { id: 'alert-002', title: 'Síntomas que requieren valoración prioritaria', description: 'La información disponible no permite determinar gravedad.', protocolRecommendation: 'Aplicar protocolo institucional de evaluación de dolor torácico.', source: outpatientRecord },
    ],
    allergies: [],
    activeConditions: [{ id: 'condition-003', name: 'Dislipidemia', status: 'En seguimiento', source: outpatientRecord }],
    activeMedications: [{ id: 'med-003', name: 'Atorvastatina', documentedDose: '20 mg', frequency: 'Cada 24 horas', route: 'Oral', status: 'Activo según registro', source: outpatientRecord }],
    recentConsultations: [{ id: 'consult-002', date: '2026-07-15', specialty: 'Medicina general', reason: 'Molestia torácica', summary: 'Registro inicial incompleto; se indicó valoración clínica prioritaria.', source: outpatientRecord }],
    recentLaboratoryResults: [],
    recentVitalSigns: [{ id: 'vitals-002', date: '2026-07-15', bloodPressure: '138/84 mmHg', heartRate: '92 lpm', oxygenSaturation: '95 %', source: outpatientRecord }],
    missingInformation: ['Inicio y duración exacta del dolor', 'Relación con esfuerzo', 'Electrocardiograma', 'Antecedentes familiares'],
    contradictions: [],
    sources: [outpatientRecord],
  },
  {
    patientId: 'DEMO-CL-003',
    displayName: 'Paciente Demo C',
    age: 29,
    currentHospital: 'Centro Ambulatorio Ficticio Este',
    chiefComplaint: 'Dolor abdominal sin caracterización completa',
    symptoms: ['Dolor abdominal referido'],
    alerts: [],
    allergies: [],
    activeConditions: [],
    activeMedications: [],
    recentConsultations: [],
    recentLaboratoryResults: [{ id: 'lab-003', test: 'Hemograma', status: 'pending', date: '2026-07-19', source: pendingLabRecord }],
    recentVitalSigns: [],
    missingInformation: ['Localización del dolor', 'Intensidad', 'Duración', 'Síntomas acompañantes', 'Signos vitales actuales'],
    contradictions: [],
    sources: [pendingLabRecord],
  },
];

export function getDemoPatient(patientId: string) {
  return DEMO_PATIENTS.find((patient) => patient.patientId === patientId);
}

export function createMockClinicalSummary(patient: DemoPatient): ClinicalSummary {
  return {
    patientId: patient.patientId,
    summary: `${patient.displayName}, ${patient.age} años. Motivo de consulta: ${patient.chiefComplaint}. La información se organizó desde registros ficticios y debe verificarse antes de cualquier decisión clínica.`,
    alerts: patient.alerts,
    allergies: patient.allergies,
    activeConditions: patient.activeConditions,
    activeMedications: patient.activeMedications,
    recentConsultations: patient.recentConsultations,
    recentLaboratoryResults: patient.recentLaboratoryResults,
    recentVitalSigns: patient.recentVitalSigns,
    missingInformation: patient.missingInformation,
    contradictions: patient.contradictions,
    sources: patient.sources,
    requiresProfessionalReview: true,
    generatedAt: new Date().toISOString(),
  };
}

export function createMockDifferential(
  patient: DemoPatient,
  request: DifferentialRequest,
): ClinicalDifferentialResult {
  return {
    possibilities: [
      {
        id: 'possibility-iron-deficiency',
        name: 'Anemia ferropénica para considerar',
        supportingElements: ['Fatiga referida', 'Hemoglobina documentada fuera de rango'],
        elementsThatDoNotFit: ['No se dispone todavía de ferritina ni perfil de hierro'],
      },
      {
        id: 'possibility-thyroid',
        name: 'Alteración tiroidea para considerar',
        supportingElements: ['Fatiga persistente'],
        elementsThatDoNotFit: ['TSH pendiente; información clínica insuficiente'],
      },
    ],
    supportingElements: [request.chiefComplaint, ...request.symptoms],
    missingOrContradictoryData: [...patient.missingInformation, ...patient.contradictions.map((item) => item.description)],
    suggestedQuestions: ['¿Los mareos aparecen al incorporarse?', '¿Ha existido sangrado reciente?', '¿Cómo es la adherencia a los medicamentos registrados?'],
    warningSigns: patient.alerts.map((alert) => ({ id: `warning-${alert.id}`, text: alert.title, explanation: alert.description, protocolRecommendation: alert.protocolRecommendation ?? 'Aplicar el protocolo institucional correspondiente.' })),
    sources: patient.sources,
    disclaimer: DOCTOR_DIFFERENTIAL_DISCLAIMER,
    requiresProfessionalReview: true,
    generatedAt: new Date().toISOString(),
  };
}
