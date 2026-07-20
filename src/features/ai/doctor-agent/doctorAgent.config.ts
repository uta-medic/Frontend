export interface DoctorQuickAction {
  id: string;
  label: string;
  shortCode: string;
  prompt: string;
}

export const MOCK_DOCTOR_USER_ID = '1fffff44-a958-4367-b046-e10ce34d6432';

export const DOCTOR_SAFETY_NOTICE =
  'La IA organiza y sugiere; el médico verifica y decide.';

export const DOCTOR_DIFFERENTIAL_DISCLAIMER =
  'Estas posibilidades fueron generadas como apoyo informativo. No representan un diagnóstico y requieren anamnesis, examen físico, estudios pertinentes y criterio médico.';

export const DOCTOR_WELCOME_MESSAGE =
  'Paciente autorizado cargado. Puedo analizar su contexto clínico, resumir hallazgos y preparar insumos para revisión profesional.';

export const DOCTOR_QUICK_ACTIONS: DoctorQuickAction[] = [
  {
    id: 'summary',
    label: 'Resumen y diagnósticos diferenciales',
    shortCode: 'RD',
    prompt:
      'Resume los hallazgos principales y sugiere posibles diagnósticos diferenciales.',
  },
  {
    id: 'alerts',
    label: 'Mostrar alertas',
    shortCode: 'AL',
    prompt:
      'Identifica las alertas clínicas y señales de alarma documentadas para este paciente.',
  },
  {
    id: 'allergies',
    label: 'Revisar alergias',
    shortCode: 'AG',
    prompt:
      'Resume las alergias documentadas y los datos que deben verificarse.',
  },
  {
    id: 'medications',
    label: 'Revisar medicamentos activos',
    shortCode: 'MA',
    prompt:
      'Revisa los medicamentos activos documentados e identifica posibles datos faltantes.',
  },
  {
    id: 'consultations',
    label: 'Mostrar consultas recientes',
    shortCode: 'CR',
    prompt: 'Resume las consultas recientes y su relevancia clínica.',
  },
  {
    id: 'results',
    label: 'Mostrar resultados recientes',
    shortCode: 'LR',
    prompt:
      'Analiza los resultados recientes e identifica valores que requieren revisión.',
  },
  {
    id: 'missing',
    label: 'Identificar información faltante',
    shortCode: 'IF',
    prompt:
      'Identifica la información clínica faltante necesaria para completar la evaluación.',
  },
  {
    id: 'contradictions',
    label: 'Detectar contradicciones',
    shortCode: 'DC',
    prompt:
      'Detecta contradicciones o datos clínicos que requieren verificación.',
  },
  {
    id: 'questions',
    label: 'Sugerir preguntas',
    shortCode: 'PQ',
    prompt:
      'Sugiere preguntas concretas para continuar la consulta de este paciente.',
  },
];
