import type { ClinicalDifferentialResult } from '../shared/types/ai.types';
import { ClinicalSourceMeta } from './ClinicalSourceMeta';

interface DifferentialResultViewProps {
  result: ClinicalDifferentialResult;
}

export function DifferentialResultView({ result }: DifferentialResultViewProps) {
  return (
    <section className="differential-result" aria-labelledby="differential-result-title" aria-live="polite">
      <div className="differential-disclaimer" role="alert">
        <span aria-hidden="true">i</span>
        <strong>{result.disclaimer}</strong>
      </div>
      <h2 id="differential-result-title">Posibilidades para considerar</h2>
      <div className="differential-possibilities">
        {result.possibilities.map((possibility) => (
          <article key={possibility.id}>
            <h3>{possibility.name}</h3>
            <div><strong>Elementos que apoyan</strong><ul>{possibility.supportingElements.map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div><strong>Elementos que no encajan o faltan</strong><ul>{possibility.elementsThatDoNotFit.map((item) => <li key={item}>{item}</li>)}</ul></div>
          </article>
        ))}
      </div>

      <div className="differential-columns">
        <section><h3>Información faltante o contradictoria</h3><ul>{result.missingOrContradictoryData.map((item) => <li key={item}>{item}</li>)}</ul></section>
        <section><h3>Preguntas clínicas sugeridas</h3><ul>{result.suggestedQuestions.map((item) => <li key={item}>{item}</li>)}</ul></section>
      </div>

      {result.warningSigns.length > 0 && (
        <section className="doctor-warning-signs" role="alert">
          <h3><span aria-hidden="true">!</span> Señales de alarma para valorar</h3>
          {result.warningSigns.map((warning) => (
            <article key={warning.id}>
              <strong>{warning.text}</strong>
              <p>{warning.explanation}</p>
              <small>{warning.protocolRecommendation}</small>
            </article>
          ))}
        </section>
      )}

      <section className="differential-sources">
        <h3>Fuentes utilizadas</h3>
        {result.sources.map((source, index) => <ClinicalSourceMeta source={source} key={`${source.internalId ?? source.recordType}-${index}`} />)}
      </section>
    </section>
  );
}
