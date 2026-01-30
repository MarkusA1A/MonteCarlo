import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { DistributionInput } from './DistributionInput';
import { Info, Calculator } from 'lucide-react';
import { getDistributionStats } from '../../lib/distributions';
import { formatCurrency } from '../../lib/statistics';

export function VergleichswertForm() {
  const { params, setVergleichswertParams, updateVergleichswertDistribution } = useSimulationStore();
  const { vergleichswert, property } = params;

  // Verteilungsstatistiken holen
  const basePriceStats = getDistributionStats(vergleichswert.basePricePerSqm);
  const locationStats = getDistributionStats(vergleichswert.locationFactor);
  const conditionStats = getDistributionStats(vergleichswert.conditionFactor);
  const equipmentStats = getDistributionStats(vergleichswert.equipmentFactor);
  const marketStats = getDistributionStats(vergleichswert.marketAdjustmentFactor);

  // Berechnete Gesamtpreise (Min | Erwartet | Max)
  // Basis-Gesamtpreis (nur Fläche × Basispreis)
  const baseTotal = {
    min: basePriceStats.p5 * property.area,
    expected: basePriceStats.expectedMean * property.area,
    max: basePriceStats.p95 * property.area,
  };

  // Angepasster Quadratmeterpreis (alle Faktoren)
  const adjustedPricePerSqm = {
    min: basePriceStats.p5 * locationStats.p5 * conditionStats.p5 * equipmentStats.p5 * marketStats.p5,
    expected: basePriceStats.expectedMean * locationStats.expectedMean * conditionStats.expectedMean * equipmentStats.expectedMean * marketStats.expectedMean,
    max: basePriceStats.p95 * locationStats.p95 * conditionStats.p95 * equipmentStats.p95 * marketStats.p95,
  };

  // Angepasster Gesamtpreis
  const adjustedTotal = {
    min: adjustedPricePerSqm.min * property.area,
    expected: adjustedPricePerSqm.expected * property.area,
    max: adjustedPricePerSqm.max * property.area,
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vergleichswertverfahren</CardTitle>
            <CardDescription>
              Bewertung anhand vergleichbarer Transaktionen
            </CardDescription>
          </div>
          <Switch
            checked={vergleichswert.enabled}
            onChange={(checked) => setVergleichswertParams({ enabled: checked })}
          />
        </div>
      </CardHeader>

      {vergleichswert.enabled && (
        <div className="space-y-4">
          {/* Erklärung der Verteilungsarten */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm border border-gray-200">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Erläuterung der Verteilungsarten</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li><span className="font-medium text-gray-700">Normalverteilung:</span> Symmetrische Verteilung um den Erwartungswert. Ideal wenn Sie einen wahrscheinlichsten Wert mit gleichmäßiger Unsicherheit nach oben und unten kennen.</li>
                  <li><span className="font-medium text-gray-700">Dreiecksverteilung:</span> Definiert durch Minimum, wahrscheinlichsten Wert und Maximum. Gut geeignet für Expertenschätzungen mit klaren Grenzen.</li>
                  <li><span className="font-medium text-gray-700">Gleichverteilung:</span> Alle Werte im definierten Bereich sind gleich wahrscheinlich. Verwenden Sie diese bei hoher Unsicherheit ohne bevorzugten Wert.</li>
                  <li><span className="font-medium text-gray-700">Log-Normalverteilung:</span> Rechtsschiefe Verteilung für Werte, die nicht negativ werden können (z.B. Preise, Kosten). Berücksichtigt Ausreißer nach oben.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Erklärung der Faktoren */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm border border-gray-200">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Erläuterung der Anpassungsfaktoren</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li><span className="font-medium text-gray-700">Lagefaktor:</span> Berücksichtigt Mikro- und Makrolage (Infrastruktur, Verkehrsanbindung, Nachbarschaft). Werte: 0.8 (schlecht) bis 1.3 (sehr gut).</li>
                  <li><span className="font-medium text-gray-700">Zustandsfaktor:</span> Bewertet den baulichen Zustand und Sanierungsbedarf. Werte: 0.7 (sanierungsbedürftig) bis 1.2 (neuwertig).</li>
                  <li><span className="font-medium text-gray-700">Ausstattungsfaktor:</span> Erfasst Qualität der Ausstattung (Böden, Sanitär, Küche, Heizung). Werte: 0.9 (einfach) bis 1.3 (gehoben).</li>
                  <li><span className="font-medium text-gray-700">Marktanpassung:</span> Korrektur für zeitliche Unterschiede und aktuelle Marktdynamik. Werte: 0.9 (schwacher Markt) bis 1.2 (starker Markt).</li>
                </ul>
              </div>
            </div>
          </div>

          <DistributionInput
            label="Basis-Quadratmeterpreis"
            value={vergleichswert.basePricePerSqm}
            onChange={(dist) => updateVergleichswertDistribution('basePricePerSqm', dist)}
            unit="€/m²"
            hint="Durchschnittspreis aus Vergleichstransaktionen · Empfehlung: Dreiecksverteilung (bei bekannter Preisspanne aus Kaufpreissammlung) oder Log-Normal (bei wenigen Vergleichsdaten mit möglichen Ausreißern)"
          />

          {/* Berechneter Basis-Gesamtpreis */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Berechneter Basis-Gesamtpreis ({property.area} m² Nutzfläche)</span>
            </div>

            {/* Header */}
            <div className="grid grid-cols-4 gap-2 mb-2 text-xs text-green-600">
              <div></div>
              <div className="text-center">Min (P5)</div>
              <div className="text-center font-medium">Erwartet</div>
              <div className="text-center">Max (P95)</div>
            </div>

            {/* Basis-Gesamtpreis */}
            <div className="grid grid-cols-4 gap-2 items-center">
              <div className="text-xs text-green-700">Gesamtpreis</div>
              <div className="text-xs text-center text-green-800">{formatCurrency(baseTotal.min)}</div>
              <div className="text-sm text-center font-semibold text-green-900">{formatCurrency(baseTotal.expected)}</div>
              <div className="text-xs text-center text-green-800">{formatCurrency(baseTotal.max)}</div>
            </div>
          </div>

          <DistributionInput
            label="Lagefaktor"
            value={vergleichswert.locationFactor}
            onChange={(dist) => updateVergleichswertDistribution('locationFactor', dist)}
            hint="1.0 = durchschnittlich · Empfehlung: Normalverteilung (symmetrische Einschätzung um den Referenzwert 1.0)"
          />

          <DistributionInput
            label="Zustandsfaktor"
            value={vergleichswert.conditionFactor}
            onChange={(dist) => updateVergleichswertDistribution('conditionFactor', dist)}
            hint="1.0 = altersgemäß · Empfehlung: Dreiecksverteilung (klare Grenzen durch Gutachten möglich) oder Normalverteilung bei guter Kenntnis des Zustands"
          />

          <DistributionInput
            label="Ausstattungsfaktor"
            value={vergleichswert.equipmentFactor}
            onChange={(dist) => updateVergleichswertDistribution('equipmentFactor', dist)}
            hint="1.0 = Standard · Empfehlung: Normalverteilung (Ausstattung ist meist gut einschätzbar mit symmetrischer Unsicherheit)"
          />

          <DistributionInput
            label="Marktanpassungsfaktor"
            value={vergleichswert.marketAdjustmentFactor}
            onChange={(dist) => updateVergleichswertDistribution('marketAdjustmentFactor', dist)}
            hint="Korrektur für Marktentwicklung · Empfehlung: Gleichverteilung (bei hoher Marktunsicherheit) oder Normalverteilung (bei stabilen Markttrends)"
          />

          {/* Berechneter angepasster Gesamtpreis */}
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">Angepasster Gesamtpreis (inkl. aller Faktoren)</span>
            </div>

            {/* Header */}
            <div className="grid grid-cols-4 gap-2 mb-2 text-xs text-purple-600">
              <div></div>
              <div className="text-center">Min (P5)</div>
              <div className="text-center font-medium">Erwartet</div>
              <div className="text-center">Max (P95)</div>
            </div>

            {/* Angepasster m²-Preis */}
            <div className="grid grid-cols-4 gap-2 items-center mb-1">
              <div className="text-xs text-purple-700">m²-Preis</div>
              <div className="text-xs text-center text-purple-800">{formatCurrency(adjustedPricePerSqm.min)}</div>
              <div className="text-sm text-center font-semibold text-purple-900">{formatCurrency(adjustedPricePerSqm.expected)}</div>
              <div className="text-xs text-center text-purple-800">{formatCurrency(adjustedPricePerSqm.max)}</div>
            </div>

            {/* Angepasster Gesamtpreis */}
            <div className="grid grid-cols-4 gap-2 items-center">
              <div className="text-xs text-purple-700">Gesamtpreis</div>
              <div className="text-xs text-center text-purple-800">{formatCurrency(adjustedTotal.min)}</div>
              <div className="text-sm text-center font-semibold text-purple-900">{formatCurrency(adjustedTotal.expected)}</div>
              <div className="text-xs text-center text-purple-800">{formatCurrency(adjustedTotal.max)}</div>
            </div>
          </div>

          {/* Formel-Erklärung */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Berechnungsformel</h4>
            <p className="text-blue-800 font-mono text-xs">
              Wert = Fläche × Basispreis × Lage × Zustand × Ausstattung × Markt
            </p>
            <p className="text-blue-700 mt-2 text-xs">
              Alle Faktoren werden miteinander multipliziert, um den angepassten
              Immobilienwert zu ermitteln.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
