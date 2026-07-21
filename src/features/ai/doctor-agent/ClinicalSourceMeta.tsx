import type { ClinicalSource } from '../shared/types/ai.types';

interface ClinicalSourceMetaProps {
  source: ClinicalSource;
}

const statusLabels = {
  'confirmed-record': 'Registro documentado',
  pending: 'Pendiente',
  'requires-verification': 'Requiere verificación',
};

export function ClinicalSourceMeta({ source }: ClinicalSourceMetaProps) {
  return (
    <div className="clinical-source">
      <span>{source.recordType}</span>
      <span>{source.date}</span>
      <span>{source.medicalCenter}</span>
      <span>{statusLabels[source.status]}</span>
      {source.internalId && <small>Ref. {source.internalId}</small>}
    </div>
  );
}
