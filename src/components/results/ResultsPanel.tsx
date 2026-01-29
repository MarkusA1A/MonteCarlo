import { useSimulationStore } from '../../store/simulationStore';
import { StatisticsCards } from './StatisticsCards';
import { HistogramChart } from './HistogramChart';
import { TornadoChart } from './TornadoChart';
import { MethodComparisonChart } from './MethodComparisonChart';
import { Card } from '../ui/Card';
import { Building2, Calendar, Hash } from 'lucide-react';

export function ResultsPanel() {
  const { results } = useSimulationStore();

  if (!results) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Keine Ergebnisse vorhanden
          </h3>
          <p className="text-sm text-gray-500">
            Führen Sie zuerst eine Simulation durch.
          </p>
        </div>
      </div>
    );
  }

  const { params } = results;

  return (
    <div className="space-y-6">
      {/* Objekt-Info Header */}
      <Card padding="sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#0066FF]/10 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-[#0066FF]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {params.property.name}
              </h2>
              <p className="text-sm text-gray-500">{params.property.address}</p>
            </div>
          </div>
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2 text-gray-500">
              <Hash className="w-4 h-4" />
              <span>{params.numberOfSimulations.toLocaleString('de-DE')} Simulationen</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{new Date(results.runDate).toLocaleDateString('de-DE')}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Haupt-Statistiken */}
      <StatisticsCards stats={results.combinedStats} title="Kombinierter Immobilienwert" />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histogramm */}
        <div className="lg:col-span-2">
          <HistogramChart
            data={results.histogram}
            stats={results.combinedStats}
          />
        </div>

        {/* Methodenvergleich */}
        <MethodComparisonChart
          mieteinnahmenStats={results.mieteinnahmenStats}
          vergleichswertStats={results.vergleichswertStats}
          dcfStats={results.dcfStats}
          combinedStats={results.combinedStats}
        />

        {/* Tornado-Diagramm */}
        <TornadoChart data={results.sensitivityAnalysis} />
      </div>

      {/* Einzelne Methoden-Statistiken */}
      {(results.mieteinnahmenStats || results.vergleichswertStats || results.dcfStats) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Detaillierte Ergebnisse nach Methode
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.mieteinnahmenStats && (
              <MethodCard
                title="Ertragswertverfahren"
                stats={results.mieteinnahmenStats}
                color="blue"
              />
            )}
            {results.vergleichswertStats && (
              <MethodCard
                title="Vergleichswertverfahren"
                stats={results.vergleichswertStats}
                color="purple"
              />
            )}
            {results.dcfStats && (
              <MethodCard
                title="DCF-Modell"
                stats={results.dcfStats}
                color="green"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MethodCard({
  title,
  stats,
  color,
}: {
  title: string;
  stats: import('../../types').Statistics;
  color: 'blue' | 'purple' | 'green';
}) {
  const colors = {
    blue: 'border-l-[#0066FF] bg-blue-50/50',
    purple: 'border-l-purple-500 bg-purple-50/50',
    green: 'border-l-green-500 bg-green-50/50',
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  return (
    <div className={`border-l-4 ${colors[color]} rounded-lg p-4`}>
      <h4 className="font-medium text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-500">Mittelwert:</span>
          <span className="font-medium">{formatCurrency(stats.mean)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Median:</span>
          <span className="font-medium">{formatCurrency(stats.median)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Std.-Abw.:</span>
          <span className="font-medium">{formatCurrency(stats.stdDev)}</span>
        </div>
        <div className="pt-2 mt-2 border-t border-gray-200">
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">P10 - P90:</span>
            <span className="font-medium">
              {formatCurrency(stats.percentile10)} - {formatCurrency(stats.percentile90)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
