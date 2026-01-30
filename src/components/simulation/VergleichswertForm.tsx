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
  const locationStats = getDistributionStats(vergleichswert.locationAdjustment);
  const conditionStats = getDistributionStats(vergleichswert.conditionAdjustment);
  const equipmentStats = getDistributionStats(vergleichswert.equipmentAdjustment);
  const marketStats = getDistributionStats(vergleichswert.marketAdjustment);

  // Berechnete Gesamtpreise (Min | Erwartet | Max)
  // Basis-Gesamtpreis (nur Fläche × Basispreis)
  const baseTotal = {
    min: basePriceStats.p5 * property.area,
    expected: basePriceStats.expectedMean * property.area,
    max: basePriceStats.p95 * property.area,
  };

  // Gesamtanpassung in Prozent (additiv gemäß ImmoWertV)
  const totalAdjustment = {
    min: locationStats.p5 + conditionStats.p5 + equipmentStats.p5 + marketStats.p5,
    expected: locationStats.expectedMean + conditionStats.expectedMean + equipmentStats.expectedMean + marketStats.expectedMean,
    max: locationStats.p95 + conditionStats.p95 + equipmentStats.p95 + marketStats.p95,
  };

  // Angepasster Quadratmeterpreis (additive Formel)
  const adjustedPricePerSqm = {
    min: basePriceStats.p5 * (1 + totalAdjustment.min / 100),
    expected: basePriceStats.expectedMean * (1 + totalAdjustment.expected / 100),
    max: basePriceStats.p95 * (1 + totalAdjustment.max / 100),
  };

  // Angepasster Gesamtpreis
  const adjustedTotal = {
    min: adjustedPricePerSqm.min * property.area,
    expected: adjustedPricePerSqm.expected * property.area,
    max: adjustedPricePerSqm.max * property.area,
  };

  // Formatierung der Prozentanpassung
  const formatAdjustment = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Vergleichswertverfahren</CardTitle>
            <CardDescription>
              Bewertung anhand vergleichbarer Transaktionen (ImmoWertV-konform)
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

          {/* Erklärung der Zu-/Abschläge gemäß ImmoWertV */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm border border-gray-200">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Zu- und Abschläge gemäß ImmoWertV</h4>
                <p className="text-xs text-gray-600 mb-2">
                  Die Anpassungen werden als <strong>Prozent-Zu-/Abschläge addiert</strong> (nicht multipliziert).
                  Die Summe aller Anpassungen sollte gemäß ImmoWertV <strong>unter 35%</strong> liegen.
                </p>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li><span className="font-medium text-gray-700">Lageanpassung:</span> Berücksichtigt Mikro- und Makrolage. Typische Werte: -20% (schlecht) bis +30% (sehr gut).</li>
                  <li><span className="font-medium text-gray-700">Zustandsanpassung:</span> Bewertet baulichen Zustand und Sanierungsbedarf. Typische Werte: -30% (sanierungsbedürftig) bis +20% (neuwertig).</li>
                  <li><span className="font-medium text-gray-700">Ausstattungsanpassung:</span> Erfasst Qualität der Ausstattung. Typische Werte: -10% (einfach) bis +30% (gehoben).</li>
                  <li><span className="font-medium text-gray-700">Marktanpassung:</span> Korrektur für Marktentwicklung seit Vergleichstransaktion. Typische Werte: -10% bis +20%.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Erklärung der Standardabweichung */}
          <div className="bg-amber-50 rounded-lg p-4 text-sm border border-amber-200">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-amber-900 mb-2">Was bedeutet die Standardabweichung?</h4>
                <p className="text-xs text-amber-800 mb-2">
                  Die Standardabweichung zeigt, wie stark ein Wert typischerweise vom Erwartungswert abweicht.
                  Je größer die Standardabweichung, desto unsicherer ist Ihre Schätzung. <strong>Bei der Normalverteilung
                  liegen etwa 68% aller Werte innerhalb einer Standardabweichung</strong> vom Mittelwert.
                </p>
                <ul className="space-y-1.5 text-xs text-amber-700">
                  <li><span className="font-medium">Basis-Quadratmeterpreis:</span> Eine Standardabweichung von 500 €/m² bei 3.000 €/m² Erwartungswert zeigt die Streuung der Vergleichspreise. Mehr Vergleichsdaten = kleinere Standardabweichung.</li>
                  <li><span className="font-medium">Lageanpassung:</span> Eine Standardabweichung von 5% bedeutet Unsicherheit bei der Lageeinschätzung. Bei gut bekannter Mikrolage wählen Sie 2-3%.</li>
                  <li><span className="font-medium">Zustandsanpassung:</span> Bei Gebäuden ohne Gutachten sollte die Standardabweichung höher sein (z.B. 8-10%), da versteckte Mängel möglich sind.</li>
                  <li><span className="font-medium">Ausstattungsanpassung:</span> Die Ausstattung ist meist gut sichtbar – eine Standardabweichung von 3-5% ist oft angemessen.</li>
                  <li><span className="font-medium">Marktanpassung:</span> In volatilen Märkten wählen Sie 5-10%. Bei stabilen Märkten genügen 2-3%.</li>
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
            label="Lageanpassung"
            value={vergleichswert.locationAdjustment}
            onChange={(dist) => updateVergleichswertDistribution('locationAdjustment', dist)}
            unit="%"
            hint="0% = durchschnittliche Lage · Empfehlung: Dreiecksverteilung (bei bekannter Bandbreite) oder Normalverteilung (symmetrische Einschätzung)"
          />

          <DistributionInput
            label="Zustandsanpassung"
            value={vergleichswert.conditionAdjustment}
            onChange={(dist) => updateVergleichswertDistribution('conditionAdjustment', dist)}
            unit="%"
            hint="0% = altersgemäßer Zustand · Empfehlung: Dreiecksverteilung (klare Grenzen durch Gutachten) oder Normalverteilung bei guter Kenntnis"
          />

          <DistributionInput
            label="Ausstattungsanpassung"
            value={vergleichswert.equipmentAdjustment}
            onChange={(dist) => updateVergleichswertDistribution('equipmentAdjustment', dist)}
            unit="%"
            hint="0% = Standardausstattung · Empfehlung: Normalverteilung (Ausstattung ist meist gut einschätzbar)"
          />

          <DistributionInput
            label="Marktanpassung"
            value={vergleichswert.marketAdjustment}
            onChange={(dist) => updateVergleichswertDistribution('marketAdjustment', dist)}
            unit="%"
            hint="Korrektur für Marktentwicklung seit Vergleichstransaktion · Empfehlung: Normalverteilung (bei stabilen Trends) oder Gleichverteilung (bei hoher Unsicherheit)"
          />

          {/* Berechneter angepasster Gesamtpreis */}
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-800">Angepasster Gesamtpreis (ImmoWertV-Methode)</span>
            </div>

            {/* Header */}
            <div className="grid grid-cols-4 gap-2 mb-2 text-xs text-purple-600">
              <div></div>
              <div className="text-center">Min (P5)</div>
              <div className="text-center font-medium">Erwartet</div>
              <div className="text-center">Max (P95)</div>
            </div>

            {/* Gesamtanpassung */}
            <div className="grid grid-cols-4 gap-2 items-center mb-1">
              <div className="text-xs text-purple-700">Σ Anpassungen</div>
              <div className="text-xs text-center text-purple-800">{formatAdjustment(totalAdjustment.min)}</div>
              <div className="text-sm text-center font-semibold text-purple-900">{formatAdjustment(totalAdjustment.expected)}</div>
              <div className="text-xs text-center text-purple-800">{formatAdjustment(totalAdjustment.max)}</div>
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

            {/* Warnung bei >35% Anpassung */}
            {Math.abs(totalAdjustment.expected) > 35 && (
              <div className="mt-3 p-2 bg-amber-100 rounded border border-amber-300">
                <p className="text-xs text-amber-800">
                  <strong>Hinweis:</strong> Die Gesamtanpassung überschreitet 35%. Gemäß ImmoWertV sollten
                  Vergleichsobjekte mit einer Gesamtanpassung über 35% nicht verwendet werden.
                </p>
              </div>
            )}
          </div>

          {/* Formel-Erklärung */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Berechnungsformel (ImmoWertV)</h4>
            <p className="text-blue-800 font-mono text-xs mb-2">
              Wert = Fläche × Basispreis × (1 + Lage% + Zustand% + Ausstattung% + Markt%)
            </p>
            <p className="text-blue-700 text-xs">
              Die Zu- und Abschläge werden gemäß ImmoWertV <strong>addiert</strong> (nicht multipliziert).
              Der Gesamtanpassungsfaktor ergibt sich aus 1 plus der Summe aller Prozentanpassungen.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
