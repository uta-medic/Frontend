import type { InformationSource } from '../types/ai.types';

interface SourcesListProps {
  sources: InformationSource[];
}

export function SourcesList({ sources }: SourcesListProps) {
  return (
    <details className="sources-list">
      <summary>Fuentes de información</summary>
      <ul>
        {sources.map((source, index) => (
          <li key={source.id ?? `${source.title}-${index}`}>
            <strong>{source.title}</strong>
            <span>{source.type}</span>
            {source.center && <span>Centro: {source.center}</span>}
            {source.updatedAt && (
              <span>Actualizado: {source.updatedAt}</span>
            )}
            {source.id && <small>Referencia interna: {source.id}</small>}
          </li>
        ))}
      </ul>
    </details>
  );
}
