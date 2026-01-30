import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { NumericInput } from '../ui/NumericInput';
import { DistributionInput } from './DistributionInput';

export function DCFForm() {
  const { params, setDCFParams, updateDCFDistribution } = useSimulationStore();
  const { dcf } = params;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>DCF-Modell</CardTitle>
            <CardDescription>
              Discounted Cash Flow - Barwert zukünftiger Zahlungsströme
            </CardDescription>
          </div>
          <Switch
            checked={dcf.enabled}
            onChange={(checked) => setDCFParams({ enabled: checked })}
          />
        </div>
      </CardHeader>

      {dcf.enabled && (
        <div className="space-y-4">
          <DistributionInput
            label="Anfangs-Monatsmiete (gesamt)"
            value={dcf.initialMonthlyRent}
            onChange={(dist) => updateDCFDistribution('initialMonthlyRent', dist)}
            unit="€"
            hint="Gesamte monatliche Mieteinnahmen zum Start"
          />

          <DistributionInput
            label="Jährliche Mietsteigerung"
            value={dcf.annualRentGrowth}
            onChange={(dist) => updateDCFDistribution('annualRentGrowth', dist)}
            unit="%"
            hint="Erwartete jährliche Steigerung der Mieteinnahmen"
          />

          <DistributionInput
            label="Diskontierungssatz"
            value={dcf.discountRate}
            onChange={(dist) => updateDCFDistribution('discountRate', dist)}
            unit="%"
            hint="Erwartete Rendite / Opportunitätskosten"
          />

          <DistributionInput
            label="Exit-Cap-Rate"
            value={dcf.exitCapRate}
            onChange={(dist) => updateDCFDistribution('exitCapRate', dist)}
            unit="%"
            hint="Kapitalisierungszinssatz beim Verkauf"
          />

          <NumericInput
            label="Haltedauer"
            value={dcf.holdingPeriod}
            onChange={(val) => setDCFParams({ holdingPeriod: Math.round(val) })}
            suffix="Jahre"
            defaultValue={10}
            min={1}
            max={30}
            hint="Geplante Investitionsdauer"
          />

          <DistributionInput
            label="Betriebskostenquote"
            value={dcf.operatingExpenseRatio}
            onChange={(dist) => updateDCFDistribution('operatingExpenseRatio', dist)}
            unit="%"
            hint="Anteil der Mieteinnahmen für Betriebskosten"
          />

          {/* Formel-Erklärung */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <h4 className="font-medium text-blue-900 mb-2">Berechnungsformel</h4>
            <p className="text-blue-800 font-mono text-xs mb-2">
              Wert = Σ(NOI_t / (1+r)^t) + Terminal Value / (1+r)^n
            </p>
            <p className="text-blue-700 text-xs">
              Der DCF-Wert setzt sich aus den diskontierten jährlichen Nettoerträgen (NOI)
              und dem diskontierten Verkaufswert (Terminal Value) am Ende der Haltedauer zusammen.
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
