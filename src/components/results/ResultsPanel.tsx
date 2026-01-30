import { useSimulationStore } from '../../store/simulationStore';
import { StatisticsCards } from './StatisticsCards';
import { HistogramChart } from './HistogramChart';
import { TornadoChart } from './TornadoChart';
import { MethodComparisonChart } from './MethodComparisonChart';
import { Card } from '../ui/Card';
import { Building2, Calendar, Hash, Lightbulb } from 'lucide-react';
import { formatCurrency } from '../../lib/statistics';

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

      {/* Interpretation */}
      <InterpretationCard results={results} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Histogramm */}
        <div className="lg:col-span-2" id="chart-histogram">
          <HistogramChart
            data={results.histogram}
            stats={results.combinedStats}
          />
        </div>

        {/* Methodenvergleich */}
        <div id="chart-method-comparison">
          <MethodComparisonChart
            mieteinnahmenStats={results.mieteinnahmenStats}
            vergleichswertStats={results.vergleichswertStats}
            dcfStats={results.dcfStats}
            combinedStats={results.combinedStats}
          />
        </div>

        {/* Tornado-Diagramm */}
        <div id="chart-tornado">
          <TornadoChart data={results.sensitivityAnalysis} />
        </div>
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

function InterpretationCard({ results }: { results: import('../../types').SimulationResults }) {
  const { params, combinedStats, sensitivityAnalysis, mieteinnahmenStats, vergleichswertStats, dcfStats } = results;
  const cv = combinedStats.coefficientOfVariation;
  const range = combinedStats.percentile90 - combinedStats.percentile10;
  const rangePercent = (range / combinedStats.mean * 100).toFixed(0);

  // Bestimme Unsicherheitslevel
  let uncertaintyLevel: string;
  let uncertaintyColor: string;
  let uncertaintyBg: string;
  if (cv < 15) {
    uncertaintyLevel = 'gering';
    uncertaintyColor = 'text-green-700';
    uncertaintyBg = 'bg-green-50 border-green-200';
  } else if (cv < 25) {
    uncertaintyLevel = 'moderat';
    uncertaintyColor = 'text-amber-700';
    uncertaintyBg = 'bg-amber-50 border-amber-200';
  } else {
    uncertaintyLevel = 'hoch';
    uncertaintyColor = 'text-red-700';
    uncertaintyBg = 'bg-red-50 border-red-200';
  }

  // Zähle aktive Methoden
  const methods: string[] = [];
  if (params.mieteinnahmen?.enabled) methods.push('Ertragswertverfahren');
  if (params.vergleichswert?.enabled) methods.push('Vergleichswertverfahren');
  if (params.dcf?.enabled) methods.push('DCF-Modell');

  // Finde dominante Einflussfaktoren
  const topFactors = sensitivityAnalysis?.slice(0, 3).map((s) => s.label) || [];

  // Berechne Methodenabweichungen
  let methodComparison = '';
  const methodStats = [
    { name: 'Ertragswertverfahren', stats: mieteinnahmenStats },
    { name: 'Vergleichswertverfahren', stats: vergleichswertStats },
    { name: 'DCF-Modell', stats: dcfStats },
  ].filter(m => m.stats);

  if (methodStats.length > 1) {
    const means = methodStats.map(m => m.stats!.mean);
    const maxDiff = Math.max(...means) - Math.min(...means);
    const maxDiffPercent = (maxDiff / combinedStats.mean * 100).toFixed(0);

    if (Number(maxDiffPercent) > 20) {
      methodComparison = `Die Bewertungsmethoden weichen um bis zu ${maxDiffPercent}% voneinander ab, was auf unterschiedliche Werttreiber hindeutet.`;
    } else {
      methodComparison = `Die verschiedenen Bewertungsmethoden liefern konsistente Ergebnisse (max. ${maxDiffPercent}% Abweichung).`;
    }
  }

  return (
    <Card>
      <div className="flex items-start space-x-4">
        <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Interpretation</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              Basierend auf {params.numberOfSimulations.toLocaleString('de-DE')} Monte-Carlo-Simulationen wird der
              Marktwert der Immobilie auf <span className="font-semibold text-[#0066FF]">{formatCurrency(combinedStats.mean)}</span> geschätzt.
            </p>

            <p>
              Mit einer <span className="font-medium">80%igen Wahrscheinlichkeit</span> liegt der tatsächliche Wert zwischen{' '}
              {formatCurrency(combinedStats.percentile10)} und {formatCurrency(combinedStats.percentile90)}{' '}
              (Spanne: {rangePercent}% des Mittelwerts).
            </p>

            <div className={`inline-flex items-center px-3 py-1.5 rounded-lg border ${uncertaintyBg}`}>
              <span className="text-gray-600 mr-2">Bewertungsunsicherheit:</span>
              <span className={`font-semibold ${uncertaintyColor}`}>{uncertaintyLevel}</span>
              <span className="text-gray-500 ml-2">(CV: {cv.toFixed(1)}%)</span>
            </div>

            {methods.length > 0 && (
              <p>
                Die Bewertung basiert auf {methods.length === 1 ? methods[0] : methods.length === 2 ? methods.join(' und ') : methods.slice(0, -1).join(', ') + ' und ' + methods[methods.length - 1]}.
                {methodComparison && ` ${methodComparison}`}
              </p>
            )}

            {topFactors.length > 0 && (
              <p>
                <span className="font-medium">Wichtigste Einflussfaktoren:</span> {topFactors.join(', ')}.
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
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
