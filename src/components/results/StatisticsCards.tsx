import { TrendingUp, TrendingDown, Target, BarChart3, Info } from 'lucide-react';
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

      {/* Erklärung Mittelwert vs. Median */}
      <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Was ist der Unterschied zwischen Mittelwert und Median?</h4>
            <div className="space-y-2 text-xs text-blue-800">
              <p>
                <strong>Mittelwert (Durchschnitt):</strong> Die Summe aller simulierten Werte geteilt durch deren Anzahl.
                Er ist empfindlich gegenüber Ausreißern – einzelne sehr hohe oder sehr niedrige Werte können den
                Mittelwert stark beeinflussen.
              </p>
              <p>
                <strong>Median (Zentralwert):</strong> Der Wert, der genau in der Mitte liegt, wenn alle Ergebnisse
                der Größe nach sortiert werden. Er ist robust gegenüber Ausreißern und zeigt den "typischen" Wert.
              </p>
              <p className="pt-1 border-t border-blue-200 mt-2">
                <strong>Wann welchen Wert verwenden?</strong> Wenn Mittelwert und Median ähnlich sind, ist die Verteilung
                symmetrisch und beide Werte sind aussagekräftig. Liegt der <strong>Mittelwert deutlich über dem Median</strong>,
                gibt es einige hohe Ausreißer (rechtsschiefe Verteilung) – der Median ist dann der konservativere,
                realistischere Schätzwert. Liegt der <strong>Mittelwert unter dem Median</strong>, gibt es niedrige
                Ausreißer (linksschiefe Verteilung).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Zusätzliche Statistiken */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatBox
          label="Standardabweichung"
          value={formatCurrency(stats.stdDev)}
        />
        <StatBox
          label="Variationskoeffizient"
          value={`${stats.coefficientOfVariation.toFixed(1)}%`}
          highlight={stats.coefficientOfVariation > 20}
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

function StatBox({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-lg p-3 ${highlight ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
      <p className={`text-xs mb-1 ${highlight ? 'text-amber-700' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-sm font-medium ${highlight ? 'text-amber-900' : 'text-gray-900'}`}>{value}</p>
      {highlight && (
        <p className="text-xs text-amber-600 mt-1">Hohe Unsicherheit</p>
      )}
    </div>
  );
}
