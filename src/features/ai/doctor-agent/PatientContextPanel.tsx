import type { DemoPatient } from '../shared/types/ai.types';
import { ClinicalRecordSections } from './ClinicalRecordSections';

interface PatientContextPanelProps {
  patient: DemoPatient;
  patients: DemoPatient[];
  onPatientChange: (patientId: string) => Promise<void>;
}

export function PatientContextPanel({
  patient,
  patients,
  onPatientChange,
}: PatientContextPanelProps) {
  return (
    <aside className="patient-context-panel" aria-labelledby="patient-context-title">
      <div className="demo-data-label">Datos ficticios de demostración</div>
      <label htmlFor="demo-patient">Paciente demo autorizado para esta sesión</label>
      <select
        id="demo-patient"
        value={patient.patientId}
        onChange={(event) => void onPatientChange(event.target.value)}
      >
        {patients.map((item) => (
          <option value={item.patientId} key={item.patientId}>
            {item.displayName} · {item.patientId}
          </option>
        ))}
      </select>

      <header className="patient-overview">
        <div>
          <p className="section-heading__eyebrow">Contexto clínico disponible</p>
          <h2 id="patient-context-title">{patient.displayName}</h2>
          <span>{patient.patientId}</span>
        </div>
        <span className="patient-age">{patient.age} años</span>
      </header>

      <dl className="patient-facts">
        <div><dt>Sexo</dt><dd>{patient.sex ?? 'No disponible'}</dd></div>
        <div><dt>Hospital actual</dt><dd>{patient.currentHospital}</dd></div>
        <div><dt>Motivo de consulta</dt><dd>{patient.chiefComplaint}</dd></div>
      </dl>

      <ClinicalRecordSections {...patient} />
    </aside>
  );
}
