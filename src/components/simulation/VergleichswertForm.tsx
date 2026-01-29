import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { DistributionInput } from './DistributionInput';

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
          <DistributionInput
            label="Basis-Quadratmeterpreis"
            value={vergleichswert.basePricePerSqm}
            onChange={(dist) => updateVergleichswertDistribution('basePricePerSqm', dist)}
            unit="€/m²"
            hint="Durchschnittlicher Preis vergleichbarer Objekte"
          />

          <DistributionInput
            label="Lagefaktor"
            value={vergleichswert.locationFactor}
            onChange={(dist) => updateVergleichswertDistribution('locationFactor', dist)}
            hint="1.0 = durchschnittliche Lage, >1 = bessere Lage"
          />

          <DistributionInput
            label="Zustandsfaktor"
            value={vergleichswert.conditionFactor}
            onChange={(dist) => updateVergleichswertDistribution('conditionFactor', dist)}
            hint="1.0 = durchschnittlicher Zustand"
          />

          <DistributionInput
            label="Ausstattungsfaktor"
            value={vergleichswert.equipmentFactor}
            onChange={(dist) => updateVergleichswertDistribution('equipmentFactor', dist)}
            hint="1.0 = Standardausstattung"
          />

          <DistributionInput
            label="Marktanpassungsfaktor"
            value={vergleichswert.marketAdjustmentFactor}
            onChange={(dist) => updateVergleichswertDistribution('marketAdjustmentFactor', dist)}
            hint="Berücksichtigt aktuelle Marktlage"
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
