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
      <div className="patient-count-label">
        {patients.length} {patients.length === 1 ? 'paciente asignado' : 'pacientes asignados'}
      </div>
      <label htmlFor="doctor-patient">Paciente autorizado para este doctor</label>
      <select
        id="doctor-patient"
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
        <div><dt>Tipo de sangre</dt><dd>{patient.bloodType ?? 'No disponible'}</dd></div>
        <div><dt>Documento</dt><dd>{patient.documentCode ?? 'No disponible'}</dd></div>
        <div><dt>Teléfono</dt><dd>{patient.phone ?? 'No disponible'}</dd></div>
        <div><dt>Última consulta</dt><dd>{patient.chiefComplaint}</dd></div>
        <div><dt>Estado</dt><dd>{patient.lastEncounterStatus ?? 'No disponible'}</dd></div>
      </dl>

      <ClinicalRecordSections {...patient} />
    </aside>
  );
}
