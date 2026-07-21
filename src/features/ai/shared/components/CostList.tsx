import type { CostItem } from '../types/ai.types';

interface CostListProps {
  costs: CostItem[];
}

function formatCost(cost: CostItem) {
  if (cost.isFree) return 'Gratuito';
  if (cost.amount === undefined) return 'Precio no disponible';

  return `${new Intl.NumberFormat('es-BO', {
    maximumFractionDigits: 2,
  }).format(cost.amount)} ${cost.currency ?? ''}`.trim();
}

export function CostList({ costs }: CostListProps) {
  return (
    <div className="detail-block">
      <h5>Costos</h5>
      <ul className="cost-list">
        {costs.map((cost) => (
          <li key={cost.service}>
            <span>{cost.service}</span>
            <strong>{formatCost(cost)}</strong>
            {cost.isSimulated && (
              <small>Precio simulado; confirma el monto con el centro.</small>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
