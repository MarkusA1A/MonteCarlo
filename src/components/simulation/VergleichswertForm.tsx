import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { DistributionInput } from './DistributionInput';
import { Info } from 'lucide-react';

export function VergleichswertForm() {
  const { params, setVergleichswertParams, updateVergleichswertDistribution } = useSimulationStore();
  const { vergleichswert } = params;

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
            hint="Durchschnittspreis aus Vergleichstransaktionen in der Region"
          />

          <DistributionInput
            label="Lagefaktor"
            value={vergleichswert.locationFactor}
            onChange={(dist) => updateVergleichswertDistribution('locationFactor', dist)}
            hint="1.0 = durchschnittlich, <1 = schlechter, >1 = besser als Vergleichsobjekte"
          />

          <DistributionInput
            label="Zustandsfaktor"
            value={vergleichswert.conditionFactor}
            onChange={(dist) => updateVergleichswertDistribution('conditionFactor', dist)}
            hint="1.0 = altersgemäß, <1 = Sanierungsbedarf, >1 = überdurchschnittlich"
          />

          <DistributionInput
            label="Ausstattungsfaktor"
            value={vergleichswert.equipmentFactor}
            onChange={(dist) => updateVergleichswertDistribution('equipmentFactor', dist)}
            hint="1.0 = Standard, <1 = einfach, >1 = gehoben/hochwertig"
          />

          <DistributionInput
            label="Marktanpassungsfaktor"
            value={vergleichswert.marketAdjustmentFactor}
            onChange={(dist) => updateVergleichswertDistribution('marketAdjustmentFactor', dist)}
            hint="Korrektur für Marktentwicklung seit den Vergleichstransaktionen"
          />

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
