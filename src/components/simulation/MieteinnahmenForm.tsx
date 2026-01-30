import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { DistributionInput } from './DistributionInput';
import { Info } from 'lucide-react';

export function MieteinnahmenForm() {
  const { params, setMieteinnahmenParams, updateMieteinnahmenDistribution } = useSimulationStore();
  const { mieteinnahmen } = params;

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
