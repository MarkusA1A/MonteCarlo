import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { DistributionInput } from './DistributionInput';
import { Info, Calculator } from 'lucide-react';
import { getDistributionStats } from '../../lib/distributions';
import { formatCurrency } from '../../lib/statistics';

export function MieteinnahmenForm() {
  const { params, setMieteinnahmenParams, updateMieteinnahmenDistribution } = useSimulationStore();
  const { mieteinnahmen, property } = params;

  // Verteilungsstatistiken holen
  const rentStats = getDistributionStats(mieteinnahmen.monthlyRentPerSqm);
  const vacancyStats = getDistributionStats(mieteinnahmen.vacancyRate);
  const maintenanceStats = getDistributionStats(mieteinnahmen.maintenanceCosts);
  const managementStats = getDistributionStats(mieteinnahmen.managementCosts);

  // Berechnete Mieten (Min | Erwartet | Max)
  const monthlyRent = {
    min: rentStats.p5 * property.area,
    expected: rentStats.expectedMean * property.area,
    max: rentStats.p95 * property.area,
  };
  const annualRent = {
    min: monthlyRent.min * 12,
    expected: monthlyRent.expected * 12,
    max: monthlyRent.max * 12,
  };

  // Effektive Miete nach Leerstand (für Kosten-Berechnung)
  const effectiveRentExpected = annualRent.expected * (1 - vacancyStats.expectedMean / 100);

  // Berechnete Kosten (Min | Erwartet | Max)
  const maintenanceCosts = {
    min: effectiveRentExpected * (maintenanceStats.p5 / 100),
    expected: effectiveRentExpected * (maintenanceStats.expectedMean / 100),
    max: effectiveRentExpected * (maintenanceStats.p95 / 100),
  };
  const managementCosts = {
    min: effectiveRentExpected * (managementStats.p5 / 100),
    expected: effectiveRentExpected * (managementStats.expectedMean / 100),
    max: effectiveRentExpected * (managementStats.p95 / 100),
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Ertragswertverfahren</CardTitle>
            <CardDescription>
              Bewertung basierend auf den zu erwartenden Mieteinnahmen
            </CardDescription>
          </div>
          <Switch
            checked={mieteinnahmen.enabled}
            onChange={(checked) => setMieteinnahmenParams({ enabled: checked })}
          />
        </div>
      </CardHeader>

      {mieteinnahmen.enabled && (
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

          {/* Erklärung der Parameter */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm border border-gray-200">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Erläuterung der Parameter</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li><span className="font-medium text-gray-700">Monatsmiete pro m²:</span> Ortsübliche Vergleichsmiete laut Mietspiegel oder Marktrecherche. Typische Werte: 8-20 €/m² je nach Lage und Ausstattung.</li>
                  <li><span className="font-medium text-gray-700">Leerstandsquote:</span> Erwarteter durchschnittlicher Leerstand über die Nutzungsdauer. Typische Werte: 2-5% (gute Lage) bis 10-15% (schwache Lage).</li>
                  <li><span className="font-medium text-gray-700">Instandhaltungskosten:</span> Jährliche Rücklagen für Reparaturen und Wartung. Typische Werte: 8-15% der Bruttomiete je nach Alter.</li>
                  <li><span className="font-medium text-gray-700">Verwaltungskosten:</span> Kosten für Hausverwaltung, Buchhaltung, etc. Typische Werte: 2-5% der Bruttomiete.</li>
                  <li><span className="font-medium text-gray-700">Kapitalisierungszinssatz:</span> Auch Liegenschaftszins genannt. Spiegelt Renditeerwartung und Risiko wider. Typische Werte: 3-6% je nach Lage und Objektart.</li>
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
                  <li><span className="font-medium">Monatsmiete:</span> Eine Standardabweichung von 1 €/m² bei 12 €/m² Erwartungswert bedeutet: Die Miete liegt mit 68% Wahrscheinlichkeit zwischen 11-13 €/m².</li>
                  <li><span className="font-medium">Leerstandsquote:</span> Eine hohe Standardabweichung (z.B. 3% bei 5% Erwartung) deutet auf unsichere Vermietbarkeit hin – etwa bei Spezialimmobilien oder schwankender Nachfrage.</li>
                  <li><span className="font-medium">Instandhaltungskosten:</span> Ältere Gebäude haben typischerweise eine höhere Standardabweichung, da unvorhergesehene Reparaturen wahrscheinlicher sind.</li>
                  <li><span className="font-medium">Verwaltungskosten:</span> Diese sind meist stabil – eine kleine Standardabweichung (z.B. 0,5%) ist hier realistisch.</li>
                  <li><span className="font-medium">Kapitalisierungszinssatz:</span> Der wichtigste Parameter! Eine Standardabweichung von 0,5% kann den Immobilienwert um 10-15% verändern.</li>
                </ul>
              </div>
            </div>
          </div>

          <DistributionInput
            label="Monatsmiete pro m²"
            value={mieteinnahmen.monthlyRentPerSqm}
            onChange={(dist) => updateMieteinnahmenDistribution('monthlyRentPerSqm', dist)}
            unit="€/m²"
            hint="Ortsübliche Vergleichsmiete · Empfehlung: Dreiecksverteilung (wenn Min/Max aus Mietspiegel bekannt) oder Normalverteilung (bei guter Marktkenntnis)"
          />

          {/* Berechnete Mieten */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Berechnete Miete ({property.area} m² Nutzfläche)</span>
            </div>

            {/* Header */}
            <div className="grid grid-cols-4 gap-2 mb-2 text-xs text-green-600">
              <div></div>
              <div className="text-center">Min (P5)</div>
              <div className="text-center font-medium">Erwartet</div>
              <div className="text-center">Max (P95)</div>
            </div>

            {/* Monatsmiete */}
            <div className="grid grid-cols-4 gap-2 items-center mb-1">
              <div className="text-xs text-green-700">Monatsmiete</div>
              <div className="text-xs text-center text-green-800">{formatCurrency(monthlyRent.min)}</div>
              <div className="text-sm text-center font-semibold text-green-900">{formatCurrency(monthlyRent.expected)}</div>
              <div className="text-xs text-center text-green-800">{formatCurrency(monthlyRent.max)}</div>
            </div>

            {/* Jahresmiete */}
            <div className="grid grid-cols-4 gap-2 items-center">
              <div className="text-xs text-green-700">Jahresmiete</div>
              <div className="text-xs text-center text-green-800">{formatCurrency(annualRent.min)}</div>
              <div className="text-sm text-center font-semibold text-green-900">{formatCurrency(annualRent.expected)}</div>
              <div className="text-xs text-center text-green-800">{formatCurrency(annualRent.max)}</div>
            </div>
          </div>

          <DistributionInput
            label="Leerstandsquote"
            value={mieteinnahmen.vacancyRate}
            onChange={(dist) => updateMieteinnahmenDistribution('vacancyRate', dist)}
            unit="%"
            hint="Erwarteter Leerstand pro Jahr · Empfehlung: Log-Normalverteilung (kann nicht negativ sein, Ausreißer nach oben bei Problemimmobilien möglich)"
          />

          <DistributionInput
            label="Instandhaltungskosten"
            value={mieteinnahmen.maintenanceCosts}
            onChange={(dist) => updateMieteinnahmenDistribution('maintenanceCosts', dist)}
            unit="%"
            hint="Anteil der Bruttomiete · Empfehlung: Dreiecksverteilung (klare Unter-/Obergrenzen je nach Gebäudealter) oder Log-Normal (bei älteren Objekten mit Überraschungspotenzial)"
          />

          <DistributionInput
            label="Verwaltungskosten"
            value={mieteinnahmen.managementCosts}
            onChange={(dist) => updateMieteinnahmenDistribution('managementCosts', dist)}
            unit="%"
            hint="Anteil der Bruttomiete · Empfehlung: Normalverteilung (relativ stabile Kosten mit geringer Schwankung)"
          />

          {/* Berechnete Kosten */}
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center space-x-2 mb-3">
              <Calculator className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-800">Berechnete Kosten (p.a., basierend auf effektiver Miete)</span>
            </div>

            {/* Header */}
            <div className="grid grid-cols-4 gap-2 mb-2 text-xs text-orange-600">
              <div></div>
              <div className="text-center">Min (P5)</div>
              <div className="text-center font-medium">Erwartet</div>
              <div className="text-center">Max (P95)</div>
            </div>

            {/* Instandhaltung */}
            <div className="grid grid-cols-4 gap-2 items-center mb-1">
              <div className="text-xs text-orange-700">Instandhaltung</div>
              <div className="text-xs text-center text-orange-800">{formatCurrency(maintenanceCosts.min)}</div>
              <div className="text-sm text-center font-semibold text-orange-900">{formatCurrency(maintenanceCosts.expected)}</div>
              <div className="text-xs text-center text-orange-800">{formatCurrency(maintenanceCosts.max)}</div>
            </div>

            {/* Verwaltung */}
            <div className="grid grid-cols-4 gap-2 items-center">
              <div className="text-xs text-orange-700">Verwaltung</div>
              <div className="text-xs text-center text-orange-800">{formatCurrency(managementCosts.min)}</div>
              <div className="text-sm text-center font-semibold text-orange-900">{formatCurrency(managementCosts.expected)}</div>
              <div className="text-xs text-center text-orange-800">{formatCurrency(managementCosts.max)}</div>
            </div>
          </div>

          <DistributionInput
            label="Kapitalisierungszinssatz"
            value={mieteinnahmen.capitalizationRate}
            onChange={(dist) => updateMieteinnahmenDistribution('capitalizationRate', dist)}
            unit="%"
            hint="Liegenschaftszins für die Kapitalisierung · Empfehlung: Normalverteilung (symmetrische Unsicherheit) oder Dreiecksverteilung (wenn Bandbreite aus Gutachterausschuss bekannt)"
          />

          {/* Formel-Erklärung */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Berechnungsformel</h4>
            <p className="text-blue-800 font-mono text-xs">
              Wert = Netto-Jahresertrag / Kapitalisierungszins
            </p>
            <p className="text-blue-700 mt-2 text-xs">
              Der Netto-Jahresertrag ergibt sich aus der Bruttomiete abzüglich Leerstand,
              Instandhaltung und Verwaltung.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
