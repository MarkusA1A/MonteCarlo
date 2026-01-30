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

  // Berechnete Werte basierend auf Erwartungswerten
  const rentPerSqm = getDistributionStats(mieteinnahmen.monthlyRentPerSqm).expectedMean;
  const vacancyRate = getDistributionStats(mieteinnahmen.vacancyRate).expectedMean / 100;
  const maintenanceRate = getDistributionStats(mieteinnahmen.maintenanceCosts).expectedMean / 100;
  const managementRate = getDistributionStats(mieteinnahmen.managementCosts).expectedMean / 100;

  const monthlyRent = rentPerSqm * property.area;
  const annualRent = monthlyRent * 12;
  const effectiveRent = annualRent * (1 - vacancyRate);
  const maintenanceCostsEuro = effectiveRent * maintenanceRate;
  const managementCostsEuro = effectiveRent * managementRate;

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

          <DistributionInput
            label="Monatsmiete pro m²"
            value={mieteinnahmen.monthlyRentPerSqm}
            onChange={(dist) => updateMieteinnahmenDistribution('monthlyRentPerSqm', dist)}
            unit="€/m²"
            hint="Ortsübliche Vergleichsmiete"
          />

          {/* Berechnete Mieten */}
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-800">Berechnete Miete ({property.area} m² Nutzfläche)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-green-600">Monatsmiete (brutto)</div>
                <div className="text-sm font-semibold text-green-900">{formatCurrency(monthlyRent)}</div>
              </div>
              <div>
                <div className="text-xs text-green-600">Jahresmiete (brutto)</div>
                <div className="text-sm font-semibold text-green-900">{formatCurrency(annualRent)}</div>
              </div>
            </div>
          </div>

          <DistributionInput
            label="Leerstandsquote"
            value={mieteinnahmen.vacancyRate}
            onChange={(dist) => updateMieteinnahmenDistribution('vacancyRate', dist)}
            unit="%"
            hint="Erwarteter Leerstand pro Jahr"
          />

          <DistributionInput
            label="Instandhaltungskosten"
            value={mieteinnahmen.maintenanceCosts}
            onChange={(dist) => updateMieteinnahmenDistribution('maintenanceCosts', dist)}
            unit="%"
            hint="Anteil der Bruttomiete"
          />

          <DistributionInput
            label="Verwaltungskosten"
            value={mieteinnahmen.managementCosts}
            onChange={(dist) => updateMieteinnahmenDistribution('managementCosts', dist)}
            unit="%"
            hint="Anteil der Bruttomiete"
          />

          {/* Berechnete Kosten */}
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex items-center space-x-2 mb-2">
              <Calculator className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-800">Berechnete Kosten (p.a., basierend auf effektiver Miete)</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-orange-600">Instandhaltung</div>
                <div className="text-sm font-semibold text-orange-900">{formatCurrency(maintenanceCostsEuro)}</div>
              </div>
              <div>
                <div className="text-xs text-orange-600">Verwaltung</div>
                <div className="text-sm font-semibold text-orange-900">{formatCurrency(managementCostsEuro)}</div>
              </div>
            </div>
          </div>

          <DistributionInput
            label="Kapitalisierungszinssatz"
            value={mieteinnahmen.capitalizationRate}
            onChange={(dist) => updateMieteinnahmenDistribution('capitalizationRate', dist)}
            unit="%"
            hint="Liegenschaftszins für die Kapitalisierung"
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
