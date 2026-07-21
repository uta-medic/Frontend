import type {
  ActiveCondition,
  ActiveMedication,
  ClinicalAlert,
  ClinicalAllergy,
  ClinicalContradiction,
  ClinicalSource,
  LaboratoryResult,
  RecentConsultation,
  VitalSignsRecord,
} from '../shared/types/ai.types';
import { ClinicalSourceMeta } from './ClinicalSourceMeta';

interface ClinicalRecordSectionsProps {
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

function EmptyRecord() {
  return <p className="clinical-empty">No disponible en el contexto actual.</p>;
}

export function ClinicalRecordSections({
  alerts,
  allergies,
  activeConditions,
  activeMedications,
  recentConsultations,
  recentLaboratoryResults,
  recentVitalSigns,
  missingInformation,
  contradictions,
  sources,
}: ClinicalRecordSectionsProps) {
  return (
    <div className="clinical-sections">
      <section className="clinical-section clinical-section--alert" aria-labelledby="clinical-alerts-title">
        <h3 id="clinical-alerts-title">Alertas</h3>
        {alerts.length === 0 ? <EmptyRecord /> : alerts.map((alert) => (
          <article className="clinical-alert" key={alert.id} role="alert">
            <span aria-hidden="true">!</span>
            <div>
              <strong>{alert.title}</strong>
              <p>{alert.description}</p>
              {alert.protocolRecommendation && <small>{alert.protocolRecommendation}</small>}
              <ClinicalSourceMeta source={alert.source} />
            </div>
          </article>
        ))}
      </section>

      <section className="clinical-section" aria-labelledby="allergies-title">
        <h3 id="allergies-title">Alergias</h3>
        {allergies.length === 0 ? <EmptyRecord /> : (
          <ul className="clinical-list">
            {allergies.map((allergy) => (
              <li key={allergy.id}>
                <strong>{allergy.substance}</strong>
                <span>{allergy.reaction ?? 'Reacción no disponible'}</span>
                <span>Severidad: {allergy.severity ?? 'No disponible'}</span>
                <ClinicalSourceMeta source={allergy.source} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="clinical-section" aria-labelledby="conditions-title">
        <h3 id="conditions-title">Condiciones activas</h3>
        {activeConditions.length === 0 ? <EmptyRecord /> : (
          <ul className="clinical-list">
            {activeConditions.map((condition) => (
              <li key={condition.id}>
                <strong>{condition.name}</strong>
                <span>{condition.status}</span>
                <ClinicalSourceMeta source={condition.source} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="clinical-section" aria-labelledby="medications-title">
        <h3 id="medications-title">Medicamentos activos</h3>
        {activeMedications.length === 0 ? <EmptyRecord /> : (
          <ul className="clinical-list">
            {activeMedications.map((medication) => (
              <li key={medication.id}>
                <strong>{medication.name}</strong>
                <span>{medication.documentedDose ?? 'Dosis no disponible'} · {medication.frequency ?? 'Frecuencia no disponible'}</span>
                <span>{medication.status}</span>
                <ClinicalSourceMeta source={medication.source} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="clinical-section" aria-labelledby="consultations-title">
        <h3 id="consultations-title">Consultas recientes</h3>
        {recentConsultations.length === 0 ? <EmptyRecord /> : (
          <ul className="clinical-list">
            {recentConsultations.map((consultation) => (
              <li key={consultation.id}>
                <strong>{consultation.specialty} · {consultation.date}</strong>
                <span>{consultation.reason}</span>
                <p>{consultation.summary}</p>
                <ClinicalSourceMeta source={consultation.source} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="clinical-section" aria-labelledby="labs-title">
        <h3 id="labs-title">Laboratorios recientes</h3>
        {recentLaboratoryResults.length === 0 ? <EmptyRecord /> : (
          <div className="clinical-table-wrap">
            <table className="clinical-table">
              <thead><tr><th>Estudio</th><th>Resultado</th><th>Estado</th><th>Fecha</th></tr></thead>
              <tbody>
                {recentLaboratoryResults.map((result) => (
                  <tr key={result.id}>
                    <th scope="row">{result.test}</th>
                    <td>{result.value ? `${result.value} ${result.unit ?? ''}` : 'Pendiente'}</td>
                    <td>{result.status}</td>
                    <td>{result.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="clinical-section" aria-labelledby="vitals-title">
        <h3 id="vitals-title">Signos vitales recientes</h3>
        {recentVitalSigns.length === 0 ? <EmptyRecord /> : recentVitalSigns.map((vitals) => (
          <article className="vital-grid" key={vitals.id}>
            <span><small>Presión arterial</small>{vitals.bloodPressure ?? 'No disponible'}</span>
            <span><small>Frecuencia cardiaca</small>{vitals.heartRate ?? 'No disponible'}</span>
            <span><small>Frecuencia respiratoria</small>{vitals.respiratoryRate ?? 'No disponible'}</span>
            <span><small>Temperatura</small>{vitals.temperature ?? 'No disponible'}</span>
            <span><small>Saturación O₂</small>{vitals.oxygenSaturation ?? 'No disponible'}</span>
          </article>
        ))}
      </section>

      <section className="clinical-section" aria-labelledby="missing-title">
        <h3 id="missing-title">Información pendiente</h3>
        {missingInformation.length === 0 ? <EmptyRecord /> : (
          <ul className="plain-clinical-list">{missingInformation.map((item) => <li key={item}>{item}</li>)}</ul>
        )}
      </section>

      {contradictions.length > 0 && (
        <section className="clinical-section clinical-section--contradiction" aria-labelledby="contradictions-title">
          <h3 id="contradictions-title">Contradicciones</h3>
          {contradictions.map((item) => (
            <article className="contradiction-card" key={item.id} role="alert">
              <strong>{item.description}</strong>
              <div><span>Primera versión</span><p>{item.firstVersion.value}</p><ClinicalSourceMeta source={item.firstVersion.source} /></div>
              <div><span>Segunda versión</span><p>{item.secondVersion.value}</p><ClinicalSourceMeta source={item.secondVersion.source} /></div>
              <small>{item.reviewMessage}</small>
            </article>
          ))}
        </section>
      )}

      <section className="clinical-section" aria-labelledby="clinical-sources-title">
        <h3 id="clinical-sources-title">Fuentes utilizadas</h3>
        <div className="source-stack">
          {sources.map((source, index) => <ClinicalSourceMeta source={source} key={`${source.internalId ?? source.recordType}-${index}`} />)}
        </div>
      </section>
    </div>
  );
}
