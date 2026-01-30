import { SimulationResults, Statistics } from '../../types';
import { formatCurrency } from '../../lib/statistics';

interface PrintableReportProps {
  results: SimulationResults;
  showHeader?: boolean;
}

export function PrintableReport({ results, showHeader = true }: PrintableReportProps) {
  const { params, combinedStats, mieteinnahmenStats, vergleichswertStats, dcfStats, sensitivityAnalysis, histogram } = results;

  return (
    <div className="bg-white text-gray-900 p-8 max-w-4xl mx-auto" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Header */}
      {showHeader && (
        <div className="text-center mb-8 pb-6 border-b-2 border-blue-600">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">Immobilienbewertung</h1>
          <p className="text-lg text-gray-600">Monte-Carlo-Simulation</p>
        </div>
      )}

      {/* Objektdaten */}
      <section className="mb-8 print-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Objektdaten
        </h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Bezeichnung:</span>
            <span className="ml-2 font-medium">{params.property.name}</span>
          </div>
          <div>
            <span className="text-gray-500">Adresse:</span>
            <span className="ml-2 font-medium">{params.property.address}</span>
          </div>
          <div>
            <span className="text-gray-500">Fläche:</span>
            <span className="ml-2 font-medium">{params.property.area} m²</span>
          </div>
          <div>
            <span className="text-gray-500">Baujahr:</span>
            <span className="ml-2 font-medium">{params.property.yearBuilt}</span>
          </div>
          <div>
            <span className="text-gray-500">Simulationen:</span>
            <span className="ml-2 font-medium">{params.numberOfSimulations.toLocaleString('de-DE')}</span>
          </div>
          <div>
            <span className="text-gray-500">Datum:</span>
            <span className="ml-2 font-medium">{new Date(results.runDate).toLocaleDateString('de-DE')}</span>
          </div>
        </div>
      </section>

      {/* Hauptergebnis */}
      <section className="mb-8 print-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Bewertungsergebnis
        </h2>
        <div className="bg-blue-50 rounded-lg p-6 text-center mb-4" style={{ backgroundColor: '#EFF6FF' }}>
          <p className="text-sm text-gray-600 mb-1">Geschätzter Immobilienwert (Mittelwert)</p>
          <p className="text-4xl font-bold text-blue-600" style={{ color: '#0066FF' }}>
            {formatCurrency(combinedStats.mean)}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            80% Wahrscheinlichkeit: {formatCurrency(combinedStats.percentile10)} bis {formatCurrency(combinedStats.percentile90)}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatBox label="Median" value={formatCurrency(combinedStats.median)} />
          <StatBox label="Standardabweichung" value={formatCurrency(combinedStats.stdDev)} />
          <StatBox label="Minimum" value={formatCurrency(combinedStats.min)} />
          <StatBox label="Maximum" value={formatCurrency(combinedStats.max)} />
        </div>
      </section>

      {/* Perzentile Übersicht */}
      <section className="mb-8 print-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Werteverteilung (Perzentile)
        </h2>
        <PercentileVisualization stats={combinedStats} />
      </section>

      {/* Methodenvergleich */}
      {(mieteinnahmenStats || vergleichswertStats || dcfStats) && (
        <section className="mb-8 print-card print-page-break">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Methodenvergleich
          </h2>
          <MethodComparisonTable
            mieteinnahmenStats={mieteinnahmenStats}
            vergleichswertStats={vergleichswertStats}
            dcfStats={dcfStats}
            combinedStats={combinedStats}
          />
          <MethodComparisonBars
            mieteinnahmenStats={mieteinnahmenStats}
            vergleichswertStats={vergleichswertStats}
            dcfStats={dcfStats}
            combinedStats={combinedStats}
          />
        </section>
      )}

      {/* Histogramm als Balkendiagramm */}
      <section className="mb-8 print-card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
          Verteilung der Immobilienwerte
        </h2>
        <HistogramVisualization histogram={histogram} stats={combinedStats} />
      </section>

      {/* Sensitivitätsanalyse */}
      {sensitivityAnalysis.length > 0 && (
        <section className="mb-8 print-card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
            Sensitivitätsanalyse
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Einfluss der Parameter bei ±20% Variation (Top 8)
          </p>
          <SensitivityTable data={sensitivityAnalysis.slice(0, 8)} />
        </section>
      )}

      {/* Footer */}
      <footer className="mt-12 pt-4 border-t border-gray-200 text-center text-xs text-gray-400">
        <p>Erstellt mit Monte-Carlo Immobilienbewertung</p>
        <p className="mt-1">© {new Date().getFullYear()} Markus Thalhamer, MSc MRICS</p>
      </footer>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center" style={{ backgroundColor: '#F9FAFB' }}>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function PercentileVisualization({ stats }: { stats: Statistics }) {
  const range = stats.max - stats.min;
  const getPosition = (value: number) => ((value - stats.min) / range) * 100;

  return (
    <div className="space-y-4">
      {/* Visual Bar */}
      <div className="relative h-12 bg-gray-100 rounded-lg overflow-hidden" style={{ backgroundColor: '#F3F4F6' }}>
        {/* P10-P90 Range */}
        <div
          className="absolute h-full bg-blue-200"
          style={{
            left: `${getPosition(stats.percentile10)}%`,
            width: `${getPosition(stats.percentile90) - getPosition(stats.percentile10)}%`,
            backgroundColor: '#BFDBFE',
          }}
        />
        {/* P25-P75 Range */}
        <div
          className="absolute h-full bg-blue-400"
          style={{
            left: `${getPosition(stats.percentile25)}%`,
            width: `${getPosition(stats.percentile75) - getPosition(stats.percentile25)}%`,
            backgroundColor: '#60A5FA',
          }}
        />
        {/* Median Line */}
        <div
          className="absolute w-1 h-full bg-blue-600"
          style={{
            left: `${getPosition(stats.median)}%`,
            backgroundColor: '#0066FF',
          }}
        />
        {/* Mean Marker */}
        <div
          className="absolute w-0 h-0 -translate-x-1/2"
          style={{
            left: `${getPosition(stats.mean)}%`,
            top: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '8px solid #DC2626',
          }}
        />
      </div>

      {/* Legend */}
      <div className="grid grid-cols-5 text-xs text-center">
        <div>
          <p className="text-gray-500">P10</p>
          <p className="font-medium">{formatCurrency(stats.percentile10)}</p>
        </div>
        <div>
          <p className="text-gray-500">P25</p>
          <p className="font-medium">{formatCurrency(stats.percentile25)}</p>
        </div>
        <div>
          <p className="text-blue-600 font-medium">Median</p>
          <p className="font-semibold">{formatCurrency(stats.median)}</p>
        </div>
        <div>
          <p className="text-gray-500">P75</p>
          <p className="font-medium">{formatCurrency(stats.percentile75)}</p>
        </div>
        <div>
          <p className="text-gray-500">P90</p>
          <p className="font-medium">{formatCurrency(stats.percentile90)}</p>
        </div>
      </div>
    </div>
  );
}

function MethodComparisonTable({
  mieteinnahmenStats,
  vergleichswertStats,
  dcfStats,
  combinedStats,
}: {
  mieteinnahmenStats: Statistics | null;
  vergleichswertStats: Statistics | null;
  dcfStats: Statistics | null;
  combinedStats: Statistics;
}) {
  const methods = [
    { name: 'Ertragswertverfahren', stats: mieteinnahmenStats, color: '#0066FF' },
    { name: 'Vergleichswertverfahren', stats: vergleichswertStats, color: '#8B5CF6' },
    { name: 'DCF-Modell', stats: dcfStats, color: '#10B981' },
    { name: 'Kombiniert', stats: combinedStats, color: '#F59E0B' },
  ].filter(m => m.stats);

  return (
    <table className="w-full text-sm mb-6">
      <thead>
        <tr className="border-b-2 border-gray-200">
          <th className="text-left py-2 font-medium text-gray-600">Methode</th>
          <th className="text-right py-2 font-medium text-gray-600">Mittelwert</th>
          <th className="text-right py-2 font-medium text-gray-600">P10</th>
          <th className="text-right py-2 font-medium text-gray-600">P90</th>
          <th className="text-right py-2 font-medium text-gray-600">Spanne</th>
        </tr>
      </thead>
      <tbody>
        {methods.map((method) => (
          <tr key={method.name} className="border-b border-gray-100">
            <td className="py-2">
              <span className="flex items-center">
                <span
                  className="w-3 h-3 rounded mr-2"
                  style={{ backgroundColor: method.color }}
                />
                {method.name}
              </span>
            </td>
            <td className="py-2 text-right font-medium">{formatCurrency(method.stats!.mean)}</td>
            <td className="py-2 text-right text-orange-600">{formatCurrency(method.stats!.percentile10)}</td>
            <td className="py-2 text-right text-green-600">{formatCurrency(method.stats!.percentile90)}</td>
            <td className="py-2 text-right text-gray-500">
              {formatCurrency(method.stats!.percentile90 - method.stats!.percentile10)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function MethodComparisonBars({
  mieteinnahmenStats,
  vergleichswertStats,
  dcfStats,
  combinedStats,
}: {
  mieteinnahmenStats: Statistics | null;
  vergleichswertStats: Statistics | null;
  dcfStats: Statistics | null;
  combinedStats: Statistics;
}) {
  const methods = [
    { name: 'Ertragswert', stats: mieteinnahmenStats, color: '#0066FF' },
    { name: 'Vergleichswert', stats: vergleichswertStats, color: '#8B5CF6' },
    { name: 'DCF', stats: dcfStats, color: '#10B981' },
    { name: 'Kombiniert', stats: combinedStats, color: '#F59E0B' },
  ].filter(m => m.stats);

  const allValues = methods.flatMap(m => [m.stats!.percentile10, m.stats!.percentile90]);
  const minVal = Math.min(...allValues) * 0.95;
  const maxVal = Math.max(...allValues) * 1.05;
  const range = maxVal - minVal;

  const getPosition = (value: number) => ((value - minVal) / range) * 100;

  return (
    <div className="space-y-3">
      {methods.map((method) => (
        <div key={method.name} className="flex items-center">
          <div className="w-24 text-xs text-gray-600 flex-shrink-0">{method.name}</div>
          <div className="flex-1 relative h-6 bg-gray-100 rounded" style={{ backgroundColor: '#F3F4F6' }}>
            {/* Error bar (P10-P90) */}
            <div
              className="absolute h-1 top-1/2 -translate-y-1/2 bg-gray-400"
              style={{
                left: `${getPosition(method.stats!.percentile10)}%`,
                width: `${getPosition(method.stats!.percentile90) - getPosition(method.stats!.percentile10)}%`,
              }}
            />
            {/* P10 cap */}
            <div
              className="absolute w-0.5 h-3 top-1/2 -translate-y-1/2 bg-gray-400"
              style={{ left: `${getPosition(method.stats!.percentile10)}%` }}
            />
            {/* P90 cap */}
            <div
              className="absolute w-0.5 h-3 top-1/2 -translate-y-1/2 bg-gray-400"
              style={{ left: `${getPosition(method.stats!.percentile90)}%` }}
            />
            {/* Mean marker */}
            <div
              className="absolute w-4 h-4 rounded-full top-1/2 -translate-y-1/2 -translate-x-1/2"
              style={{
                left: `${getPosition(method.stats!.mean)}%`,
                backgroundColor: method.color,
              }}
            />
          </div>
          <div className="w-24 text-xs text-right font-medium ml-2">
            {formatCurrency(method.stats!.mean)}
          </div>
        </div>
      ))}
    </div>
  );
}

function HistogramVisualization({ histogram, stats }: { histogram: Array<{ rangeStart: number; rangeEnd: number; count: number; percentage: number }>; stats: Statistics }) {
  const maxCount = Math.max(...histogram.map(h => h.count));

  return (
    <div className="space-y-1">
      {histogram.map((bin, index) => {
        const isInMainRange = bin.rangeStart >= stats.percentile10 && bin.rangeEnd <= stats.percentile90;
        const barColor = isInMainRange ? '#60A5FA' : '#D1D5DB';
        const barWidth = (bin.count / maxCount) * 100;

        return (
          <div key={index} className="flex items-center text-xs">
            <div className="w-20 text-right text-gray-500 pr-2 flex-shrink-0">
              {(bin.rangeStart / 1000).toFixed(0)}k
            </div>
            <div className="flex-1 h-4 bg-gray-50 relative" style={{ backgroundColor: '#F9FAFB' }}>
              <div
                className="h-full rounded-r"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: barColor,
                }}
              />
            </div>
            <div className="w-12 text-right text-gray-500 pl-2 flex-shrink-0">
              {bin.percentage.toFixed(1)}%
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#60A5FA' }} />
          <span className="text-gray-600">P10-P90 Bereich</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#D1D5DB' }} />
          <span className="text-gray-600">Außerhalb</span>
        </div>
      </div>
    </div>
  );
}

function SensitivityTable({ data }: { data: Array<{ parameter: string; label: string; lowValue: number; highValue: number; baseValue: number; impact: number }> }) {
  const maxImpact = Math.max(...data.map(d => d.impact));

  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const barWidth = (item.impact / maxImpact) * 100;
        const lowDiff = item.lowValue - item.baseValue;
        const highDiff = item.highValue - item.baseValue;

        return (
          <div key={index} className="flex items-center text-xs">
            <div className="w-28 text-gray-700 pr-2 flex-shrink-0 truncate" title={item.label}>
              {item.label}
            </div>
            <div className="flex-1 h-5 bg-gray-50 relative flex" style={{ backgroundColor: '#F9FAFB' }}>
              {/* Center line */}
              <div className="absolute left-1/2 w-px h-full bg-gray-300" />
              {/* Negative bar (left) */}
              <div className="w-1/2 flex justify-end">
                <div
                  className="h-full rounded-l"
                  style={{
                    width: `${(Math.abs(lowDiff) / (Math.abs(lowDiff) + Math.abs(highDiff))) * barWidth}%`,
                    backgroundColor: '#EF4444',
                    opacity: 0.7,
                  }}
                />
              </div>
              {/* Positive bar (right) */}
              <div className="w-1/2">
                <div
                  className="h-full rounded-r"
                  style={{
                    width: `${(Math.abs(highDiff) / (Math.abs(lowDiff) + Math.abs(highDiff))) * barWidth}%`,
                    backgroundColor: '#10B981',
                    opacity: 0.7,
                  }}
                />
              </div>
            </div>
            <div className="w-20 text-right text-gray-600 pl-2 flex-shrink-0">
              {formatCurrency(item.impact)}
            </div>
          </div>
        );
      })}
      <div className="flex items-center justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#EF4444', opacity: 0.7 }} />
          <span className="text-gray-600">-20% Variation</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded mr-1" style={{ backgroundColor: '#10B981', opacity: 0.7 }} />
          <span className="text-gray-600">+20% Variation</span>
        </div>
      </div>
    </div>
  );
}
