export type DoctorActionKind = 'chat' | 'summary' | 'differential';

export interface DoctorQuickAction {
  id: string;
  label: string;
  shortCode: string;
  prompt: string;
  kind: DoctorActionKind;
}

export const DOCTOR_SAFETY_NOTICE =
  'La IA organiza y sugiere; el médico verifica y decide.';

export const DOCTOR_DIFFERENTIAL_DISCLAIMER =
  'Estas posibilidades fueron generadas como apoyo informativo. No representan un diagnóstico y requieren anamnesis, examen físico, estudios pertinentes y criterio médico.';

export const DOCTOR_WELCOME_MESSAGE =
  'Contexto de demostración cargado. Puedo organizar la información disponible, señalar datos faltantes y preparar insumos para revisión profesional.';

export const DOCTOR_QUICK_ACTIONS: DoctorQuickAction[] = [
  { id: 'summary', label: 'Generar resumen clínico', shortCode: 'RC', prompt: 'Generar resumen clínico.', kind: 'summary' },
  { id: 'alerts', label: 'Mostrar alertas', shortCode: 'AL', prompt: 'Mostrar alertas clínicas documentadas.', kind: 'chat' },
  { id: 'allergies', label: 'Revisar alergias', shortCode: 'AG', prompt: 'Revisar alergias documentadas.', kind: 'chat' },
  { id: 'medications', label: 'Revisar medicamentos activos', shortCode: 'MA', prompt: 'Revisar medicamentos activos documentados.', kind: 'chat' },
  { id: 'consultations', label: 'Mostrar consultas recientes', shortCode: 'CR', prompt: 'Mostrar consultas recientes.', kind: 'chat' },
  { id: 'results', label: 'Mostrar resultados recientes', shortCode: 'LR', prompt: 'Mostrar resultados de laboratorio recientes.', kind: 'chat' },
  { id: 'missing', label: 'Identificar información faltante', shortCode: 'IF', prompt: 'Identificar información clínica faltante.', kind: 'chat' },
  { id: 'contradictions', label: 'Detectar contradicciones', shortCode: 'DC', prompt: 'Detectar información contradictoria.', kind: 'chat' },
  { id: 'questions', label: 'Sugerir preguntas', shortCode: 'PQ', prompt: 'Sugerir preguntas para la consulta.', kind: 'chat' },
  { id: 'differential', label: 'Posibilidades diferenciales', shortCode: 'PD', prompt: 'Preparar posibilidades diferenciales.', kind: 'differential' },
];
