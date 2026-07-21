import type { ClinicalSummary } from '../shared/types/ai.types';
import { ClinicalRecordSections } from './ClinicalRecordSections';

interface ClinicalSummaryViewProps {
  summary: ClinicalSummary;
}

export function ClinicalSummaryView({ summary }: ClinicalSummaryViewProps) {
  return (
    <section className="generated-clinical-panel" aria-labelledby="generated-summary-title" aria-live="polite">
      <header>
        <div>
          <p className="section-heading__eyebrow">Generado por IA para revisión</p>
          <h2 id="generated-summary-title">Resumen clínico organizado</h2>
        </div>
        <time dateTime={summary.generatedAt}>
          {new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(summary.generatedAt))}
        </time>
      </header>
      <p className="clinical-summary-text">{summary.summary}</p>
      <div className="professional-review-badge">
        <span aria-hidden="true">✓</span>
        Requiere verificación y criterio médico antes de utilizarse
      </div>
      <ClinicalRecordSections {...summary} />
    </section>
  );
}
