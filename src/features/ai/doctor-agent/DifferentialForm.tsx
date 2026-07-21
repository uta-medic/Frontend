import { useEffect, useState, type FormEvent } from 'react';
import type { DemoPatient, DifferentialRequest } from '../shared/types/ai.types';

interface DifferentialFormProps {
  patient: DemoPatient;
  isLoading: boolean;
  onSubmit: (request: DifferentialRequest) => Promise<void>;
}

export function DifferentialForm({
  patient,
  isLoading,
  onSubmit,
}: DifferentialFormProps) {
  const [chiefComplaint, setChiefComplaint] = useState(patient.chiefComplaint);
  const [symptoms, setSymptoms] = useState(patient.symptoms.join(', '));
  const [duration, setDuration] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');

  useEffect(() => {
    setChiefComplaint(patient.chiefComplaint);
    setSymptoms(patient.symptoms.join(', '));
    setDuration('');
    setAdditionalContext('');
  }, [patient]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsedSymptoms = symptoms.split(',').map((item) => item.trim()).filter(Boolean);
    if (!chiefComplaint.trim() || parsedSymptoms.length === 0 || !duration.trim()) return;

    void onSubmit({
      chiefComplaint: chiefComplaint.trim(),
      symptoms: parsedSymptoms,
      duration: duration.trim(),
      additionalContext: additionalContext.trim() || undefined,
    });
  }

  return (
    <section className="differential-form-panel" aria-labelledby="differential-form-title">
      <div className="doctor-section-heading">
        <div>
          <p className="section-heading__eyebrow">Apoyo al razonamiento clínico</p>
          <h2 id="differential-form-title">Posibilidades diferenciales</h2>
        </div>
      </div>
      <form onSubmit={handleSubmit}>
        <label>Motivo principal de consulta<input value={chiefComplaint} onChange={(event) => setChiefComplaint(event.target.value)} required /></label>
        <label>Síntomas, separados por comas<textarea value={symptoms} onChange={(event) => setSymptoms(event.target.value)} rows={2} required /></label>
        <label>Duración<input value={duration} onChange={(event) => setDuration(event.target.value)} placeholder="Ej.: 3 semanas" required /></label>
        <label>Contexto adicional opcional<textarea value={additionalContext} onChange={(event) => setAdditionalContext(event.target.value)} rows={2} /></label>
        <button type="submit" disabled={isLoading || !chiefComplaint.trim() || !symptoms.trim() || !duration.trim()}>
          {isLoading ? 'Organizando información…' : 'Generar posibilidades para revisión'}
        </button>
      </form>
    </section>
  );
}
