import { useSimulationStore } from '../../store/simulationStore';
import { StatisticsCards } from './StatisticsCards';
import { HistogramChart } from './HistogramChart';
import { TornadoChart } from './TornadoChart';
import { MethodComparisonChart } from './MethodComparisonChart';
import { Card } from '../ui/Card';
import { Building2, Calendar, Hash, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                {params.property.name}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{params.property.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs sm:text-sm ml-13 sm:ml-0">
            <div className="flex items-center space-x-1.5 text-gray-500">
              <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{params.numberOfSimulations.toLocaleString('de-DE')} Sim.</span>
            </div>
            <div className="flex items-center space-x-1.5 text-gray-500">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
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

  // Bestimme Unsicherheitslevel basierend auf Variationskoeffizient
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

  // Standardabweichung als Prozent des Mittelwerts
  const stdDevPercent = ((combinedStats.stdDev / combinedStats.mean) * 100).toFixed(1);
  let stdDevColor: string;
  let stdDevBg: string;
  if (Number(stdDevPercent) < 15) {
    stdDevColor = 'text-green-700';
    stdDevBg = 'bg-green-50 border-green-200';
  } else if (Number(stdDevPercent) < 25) {
    stdDevColor = 'text-amber-700';
    stdDevBg = 'bg-amber-50 border-amber-200';
  } else {
    stdDevColor = 'text-red-700';
    stdDevBg = 'bg-red-50 border-red-200';
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
              Marktwert der Immobilie auf <span className="font-semibold text-primary-500">{formatCurrency(combinedStats.mean)}</span> geschätzt.
            </p>

            <p>
              Mit einer <span className="font-medium">80%igen Wahrscheinlichkeit</span> liegt der tatsächliche Wert zwischen{' '}
              {formatCurrency(combinedStats.percentile10)} und {formatCurrency(combinedStats.percentile90)}{' '}
              (Spanne: {rangePercent}% des Mittelwerts).
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-3">
              <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm ${uncertaintyBg}`}>
                <span className="text-gray-600">Unsicherheit:</span>
                <span className={`font-semibold ${uncertaintyColor}`}>{uncertaintyLevel}</span>
                <span className="text-gray-500">(CV: {cv.toFixed(1)}%)</span>
              </div>
              <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 px-3 py-1.5 rounded-lg border text-xs sm:text-sm ${stdDevBg}`}>
                <span className="text-gray-600">Std.-Abw.:</span>
                <span className={`font-semibold ${stdDevColor}`}>{formatCurrency(combinedStats.stdDev)}</span>
                <span className="text-gray-500">({stdDevPercent}%)</span>
              </div>
            </div>

            {/* CV-Interpretation */}
            <CvInterpretation
              cv={cv}
              uncertaintyLevel={uncertaintyLevel}
              uncertaintyBg={uncertaintyBg}
              sensitivityAnalysis={sensitivityAnalysis}
              methodStats={methodStats}
              combinedStats={combinedStats}
              methods={methods}
              methodComparison={methodComparison}
            />

            {topFactors.length > 0 && (
              <p>
                <span className="font-medium">Wichtigste Einflussfaktoren:</span> {topFactors.join(', ')}.
              </p>
            )}

            {/* Szenario-Analyse: Pessimistisch vs. Optimistisch */}
            {sensitivityAnalysis && sensitivityAnalysis.length > 0 && (
              <ScenarioAnalysis
                sensitivityAnalysis={sensitivityAnalysis}
                combinedStats={combinedStats}
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function CvInterpretation({
  cv,
  uncertaintyLevel,
  uncertaintyBg,
  sensitivityAnalysis,
  methodStats,
  combinedStats,
  methods,
  methodComparison,
}: {
  cv: number;
  uncertaintyLevel: string;
  uncertaintyBg: string;
  sensitivityAnalysis: import('../../types').SensitivityResult[];
  methodStats: { name: string; stats: import('../../types').Statistics | null }[];
  combinedStats: import('../../types').Statistics;
  methods: string[];
  methodComparison: string;
}) {
  // Bestimme die Hauptgründe für den CV-Wert
  const reasons: string[] = [];

  // 1. Top-Parameter mit größtem Einfluss identifizieren
  if (sensitivityAnalysis && sensitivityAnalysis.length > 0) {
    const topParam = sensitivityAnalysis[0];
    const topImpactPercent = ((topParam.impact / topParam.baseValue) * 100).toFixed(0);
    reasons.push(
      `Der Parameter "${topParam.label}" hat mit ±${topImpactPercent}% den größten Einfluss auf das Ergebnis`
    );

    // Prüfe ob mehrere Parameter starken Einfluss haben
    const significantParams = sensitivityAnalysis.filter(
      (s) => s.impact > topParam.impact * 0.5
    );
    if (significantParams.length >= 3) {
      reasons.push(
        `${significantParams.length} Parameter haben einen erheblichen Einfluss – die Unsicherheit verteilt sich auf mehrere Stellschrauben`
      );
    }
  }

  // 2. Methodenabweichung als Grund
  if (methodStats.length > 1) {
    const means = methodStats.map((m) => m.stats!.mean);
    const maxDiff = Math.max(...means) - Math.min(...means);
    const maxDiffPercent = (maxDiff / combinedStats.mean) * 100;

    if (maxDiffPercent > 20) {
      const highest = methodStats.reduce((a, b) => (a.stats!.mean > b.stats!.mean ? a : b));
      const lowest = methodStats.reduce((a, b) => (a.stats!.mean < b.stats!.mean ? a : b));
      reasons.push(
        `${highest.name} (${formatCurrency(highest.stats!.mean)}) und ${lowest.name} (${formatCurrency(lowest.stats!.mean)}) liefern deutlich unterschiedliche Werte, was die Streuung erhöht`
      );
    } else if (maxDiffPercent < 10) {
      reasons.push(
        'Die Bewertungsmethoden stimmen gut überein, was die Bewertung stützt'
      );
    }
  }

  // 3. Breite der P10-P90-Spanne
  const rangeRatio = ((combinedStats.percentile90 - combinedStats.percentile10) / combinedStats.mean) * 100;
  if (rangeRatio > 40) {
    reasons.push(
      `Die Spanne zwischen pessimistischem und optimistischem Szenario beträgt ${rangeRatio.toFixed(0)}% des Mittelwerts – ein Zeichen breiter Eingabebandbreiten`
    );
  }

  // Erklärungstext je nach CV-Level
  let explanation: string;
  if (cv < 15) {
    explanation = `Ein Variationskoeffizient von ${cv.toFixed(1)}% bedeutet eine geringe Bewertungsunsicherheit. Die Eingabeparameter sind relativ eng gefasst und die Simulation liefert konsistente Ergebnisse. Der geschätzte Marktwert ist gut abgesichert.`;
  } else if (cv < 25) {
    explanation = `Ein Variationskoeffizient von ${cv.toFixed(1)}% zeigt eine moderate Bewertungsunsicherheit. Einige Eingabeparameter haben eine nennenswerte Bandbreite, was zu einer spürbaren Streuung der Ergebnisse führt. Die Bewertung ist plausibel, aber mit Vorsicht zu interpretieren.`;
  } else {
    explanation = `Ein Variationskoeffizient von ${cv.toFixed(1)}% signalisiert eine hohe Bewertungsunsicherheit. Die Eingabeparameter weisen breite Bandbreiten auf, was zu stark schwankenden Ergebnissen führt. Bevor diese Bewertung als Grundlage dient, sollten die unsichersten Parameter genauer recherchiert werden.`;
  }

  return (
    <div className={`rounded-lg p-4 border ${uncertaintyBg}`}>
      <p className="text-sm text-gray-700 mb-2">{explanation}</p>
      {reasons.length > 0 && (
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-900 mb-1.5">Gründe für die {uncertaintyLevel}e Unsicherheit:</p>
          <ul className="space-y-1">
            {reasons.map((reason, i) => (
              <li key={i} className="flex items-start space-x-2 text-xs text-gray-700">
                <span className="text-gray-400 mt-0.5 flex-shrink-0">&#x2022;</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {methods.length > 0 && methodComparison && (
        <p className="text-xs text-gray-600 mt-2">
          Die Bewertung basiert auf {methods.length === 1 ? methods[0] : methods.length === 2 ? methods.join(' und ') : methods.slice(0, -1).join(', ') + ' und ' + methods[methods.length - 1]}.
          {' '}{methodComparison}
        </p>
      )}
    </div>
  );
}

// Mapping: Parameter → verständliche Erklärungen für pessimistisches/optimistisches Szenario
const PARAMETER_EXPLANATIONS: Record<string, { pessimistic: string; optimistic: string }> = {
  monthlyRentPerSqm: {
    pessimistic: 'Niedrigere Mieteinnahmen pro m²',
    optimistic: 'Höhere Mieteinnahmen pro m²',
  },
  capitalizationRate: {
    pessimistic: 'Höherer Kapitalisierungszins (mehr Risiko)',
    optimistic: 'Niedrigerer Kapitalisierungszins (weniger Risiko)',
  },
  basePricePerSqm: {
    pessimistic: 'Niedrigere Vergleichspreise am Markt',
    optimistic: 'Höhere Vergleichspreise am Markt',
  },
  locationAdjustment: {
    pessimistic: 'Ungünstigere Lagebewertung',
    optimistic: 'Bessere Lagebewertung',
  },
  conditionAdjustment: {
    pessimistic: 'Schlechterer Gebäudezustand',
    optimistic: 'Besserer Gebäudezustand',
  },
  equipmentAdjustment: {
    pessimistic: 'Geringwertigere Ausstattung',
    optimistic: 'Hochwertigere Ausstattung',
  },
  marketAdjustment: {
    pessimistic: 'Ungünstigere Marktlage',
    optimistic: 'Günstigere Marktlage',
  },
  discountRate: {
    pessimistic: 'Höherer Diskontierungssatz',
    optimistic: 'Niedrigerer Diskontierungssatz',
  },
  exitCapRate: {
    pessimistic: 'Höhere Exit-Cap-Rate (geringerer Verkaufspreis)',
    optimistic: 'Niedrigere Exit-Cap-Rate (höherer Verkaufspreis)',
  },
  vacancyRate: {
    pessimistic: 'Höherer Leerstand',
    optimistic: 'Niedrigerer Leerstand',
  },
  maintenanceCosts: {
    pessimistic: 'Höhere Instandhaltungskosten',
    optimistic: 'Niedrigere Instandhaltungskosten',
  },
  managementCosts: {
    pessimistic: 'Höhere Verwaltungskosten',
    optimistic: 'Niedrigere Verwaltungskosten',
  },
  initialMonthlyRent: {
    pessimistic: 'Niedrigere Anfangsmiete',
    optimistic: 'Höhere Anfangsmiete',
  },
  annualRentGrowth: {
    pessimistic: 'Geringeres Mietwachstum',
    optimistic: 'Stärkeres Mietwachstum',
  },
  operatingExpenseRatio: {
    pessimistic: 'Höhere Betriebskosten',
    optimistic: 'Niedrigere Betriebskosten',
  },
};

function ScenarioAnalysis({
  sensitivityAnalysis,
  combinedStats,
}: {
  sensitivityAnalysis: import('../../types').SensitivityResult[];
  combinedStats: import('../../types').Statistics;
}) {
  // Berechne pessimistische und optimistische Treiber
  const drivers = sensitivityAnalysis.map((item) => {
    const pessimisticValue = Math.min(item.lowValue, item.highValue);
    const optimisticValue = Math.max(item.lowValue, item.highValue);
    const pessimisticImpact = item.baseValue - pessimisticValue;
    const optimisticImpact = optimisticValue - item.baseValue;

    return {
      parameter: item.parameter,
      label: item.label,
      pessimisticImpact,
      optimisticImpact,
      pessimisticPercent: ((pessimisticImpact / item.baseValue) * 100).toFixed(1),
      optimisticPercent: ((optimisticImpact / item.baseValue) * 100).toFixed(1),
    };
  });

  const topPessimistic = [...drivers]
    .sort((a, b) => b.pessimisticImpact - a.pessimisticImpact)
    .slice(0, 3);

  const topOptimistic = [...drivers]
    .sort((a, b) => b.optimisticImpact - a.optimisticImpact)
    .slice(0, 3);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1">
      {/* Pessimistisches Szenario */}
      <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingDown className="w-4 h-4 text-orange-600" />
          <h4 className="font-semibold text-orange-900 text-sm">Pessimistisches Szenario (P10)</h4>
        </div>
        <p className="text-lg font-bold text-orange-700 mb-3">
          {formatCurrency(combinedStats.percentile10)}
        </p>
        <p className="text-xs text-orange-800 mb-2">
          Diesen Wert unterschreiten nur 10% aller Szenarien. Die wichtigsten Faktoren, die den Wert nach unten treiben:
        </p>
        <ul className="space-y-1.5">
          {topPessimistic.map((driver) => {
            const explanation = PARAMETER_EXPLANATIONS[driver.parameter];
            return (
              <li key={driver.parameter} className="flex items-start space-x-2 text-xs">
                <span className="text-orange-400 mt-0.5 flex-shrink-0">&#x25BC;</span>
                <span className="text-orange-900">
                  <strong>{explanation?.pessimistic || driver.label}</strong>
                  <span className="text-orange-600"> (−{driver.pessimisticPercent}%)</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Optimistisches Szenario */}
      <div className="bg-green-50 rounded-lg p-4 border border-green-200">
        <div className="flex items-center space-x-2 mb-3">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <h4 className="font-semibold text-green-900 text-sm">Optimistisches Szenario (P90)</h4>
        </div>
        <p className="text-lg font-bold text-green-700 mb-3">
          {formatCurrency(combinedStats.percentile90)}
        </p>
        <p className="text-xs text-green-800 mb-2">
          90% aller Szenarien liegen unter diesem Wert. Die wichtigsten Faktoren, die den Wert nach oben treiben:
        </p>
        <ul className="space-y-1.5">
          {topOptimistic.map((driver) => {
            const explanation = PARAMETER_EXPLANATIONS[driver.parameter];
            return (
              <li key={driver.parameter} className="flex items-start space-x-2 text-xs">
                <span className="text-green-400 mt-0.5 flex-shrink-0">&#x25B2;</span>
                <span className="text-green-900">
                  <strong>{explanation?.optimistic || driver.label}</strong>
                  <span className="text-green-600"> (+{driver.optimisticPercent}%)</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
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
    blue: 'border-l-primary-500 bg-blue-50/50',
    purple: 'border-l-purple-500 bg-purple-50/50',
    green: 'border-l-green-500 bg-green-50/50',
  };

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
