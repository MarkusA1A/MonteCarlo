import { TrendingUp, TrendingDown, Target, BarChart3 } from 'lucide-react';
import { Statistics } from '../../types';
import { formatCurrency } from '../../lib/statistics';

interface StatisticsCardsProps {
  stats: Statistics;
  title?: string;
}

export function StatisticsCards({ stats, title = 'Kombinierter Wert' }: StatisticsCardsProps) {
  const cards = [
    {
      label: 'Mittelwert',
      value: formatCurrency(stats.mean),
      icon: Target,
      color: 'text-[#0066FF]',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Median',
      value: formatCurrency(stats.median),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: '10. Perzentil',
      value: formatCurrency(stats.percentile10),
      icon: TrendingDown,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      subtext: 'Pessimistisch',
    },
    {
      label: '90. Perzentil',
      value: formatCurrency(stats.percentile90),
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      subtext: 'Optimistisch',
    },
  ];

  return (
    <div>
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">{card.label}</span>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <p className={`text-xl font-bold ${card.color}`}>{card.value}</p>
              {card.subtext && (
                <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Zusätzliche Statistiken */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox
          label="Standardabweichung"
          value={formatCurrency(stats.stdDev)}
        />
        <StatBox
          label="Minimum"
          value={formatCurrency(stats.min)}
        />
        <StatBox
          label="Maximum"
          value={formatCurrency(stats.max)}
        />
        <StatBox
          label="95% Konfidenzintervall"
          value={`${formatCurrency(stats.confidenceInterval95[0])} - ${formatCurrency(stats.confidenceInterval95[1])}`}
        />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
