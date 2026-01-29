import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { RefreshCw } from 'lucide-react';

export function SettingsForm() {
  const { params, setNumberOfSimulations, resetAll } = useSimulationStore();

  const simulationPresets = [1000, 5000, 10000, 50000, 100000];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulationseinstellungen</CardTitle>
        <CardDescription>
          Konfiguration der Monte-Carlo-Simulation
        </CardDescription>
      </CardHeader>

      <div className="space-y-6">
        {/* Anzahl Simulationen */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Anzahl Simulationen
          </label>
          <Slider
            value={params.numberOfSimulations}
            min={1000}
            max={100000}
            step={1000}
            onChange={(e) => setNumberOfSimulations(parseInt(e.target.value))}
            formatValue={(v) => v.toLocaleString('de-DE')}
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {simulationPresets.map((preset) => (
              <button
                key={preset}
                onClick={() => setNumberOfSimulations(preset)}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-md transition-colors
                  ${params.numberOfSimulations === preset
                    ? 'bg-[#0066FF] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                {preset.toLocaleString('de-DE')}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Mehr Simulationen = genauere Ergebnisse, aber längere Rechenzeit
          </p>
        </div>

        {/* Aktive Modelle Übersicht */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Aktive Bewertungsmodelle</h4>
          <div className="space-y-2">
            <ModelStatus
              label="Ertragswertverfahren"
              enabled={params.mieteinnahmen.enabled}
            />
            <ModelStatus
              label="Vergleichswertverfahren"
              enabled={params.vergleichswert.enabled}
            />
            <ModelStatus
              label="DCF-Modell"
              enabled={params.dcf.enabled}
            />
          </div>
          {!params.mieteinnahmen.enabled && !params.vergleichswert.enabled && !params.dcf.enabled && (
            <p className="mt-2 text-xs text-red-600">
              Mindestens ein Bewertungsmodell muss aktiviert sein.
            </p>
          )}
        </div>

        {/* Reset Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={resetAll}
            className="w-full"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Alle Einstellungen zurücksetzen
          </Button>
        </div>
      </div>
    </Card>
  );
}

function ModelStatus({ label, enabled }: { label: string; enabled: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${enabled ? 'text-green-600' : 'text-gray-400'}`}>
        {enabled ? 'Aktiv' : 'Deaktiviert'}
      </span>
    </div>
  );
}
