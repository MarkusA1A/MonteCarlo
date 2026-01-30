import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Switch } from '../ui/Switch';
import { NumericInput } from '../ui/NumericInput';
import { DistributionInput } from './DistributionInput';
import { Info } from 'lucide-react';

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

          {/* Erklärung der Zinssätze */}
          <div className="bg-gray-50 rounded-lg p-4 text-sm border border-gray-200">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Erläuterung der Zinssätze</h4>
                <ul className="space-y-1.5 text-xs text-gray-600">
                  <li><span className="font-medium text-gray-700">Diskontierungssatz:</span> Der Zinssatz, mit dem zukünftige Cashflows auf den heutigen Barwert abgezinst werden. Setzt sich zusammen aus risikofreiem Zins + Risikoprämie für Immobilieninvestments. Typische Werte: 4-8% je nach Risikoeinschätzung und Marktlage.</li>
                  <li><span className="font-medium text-gray-700">Exit-Cap-Rate (Kapitalisierungszins):</span> Der Zinssatz zur Berechnung des Terminal Value (Verkaufswert) am Ende der Haltedauer. Ergibt sich aus NOI / Immobilienwert. Niedrigere Cap-Rates bedeuten höhere Bewertungen. Typische Werte: 3-6% je nach Lage und Objektqualität.</li>
                  <li><span className="font-medium text-gray-700">Zusammenhang:</span> Die Exit-Cap-Rate sollte typischerweise 0.25-0.5% höher als die aktuelle Cap-Rate sein, um eine konservative Annahme für den Verkaufszeitpunkt zu treffen.</li>
                </ul>
              </div>
            </div>
          </div>

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
