import { useRef } from 'react';
import { useSimulationStore } from '../../store/simulationStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Slider } from '../ui/Slider';
import { Button } from '../ui/Button';
import { RefreshCw, Download, Upload, Info } from 'lucide-react';

export function SettingsForm() {
  const { params, setNumberOfSimulations, resetAll, exportParams, importParams } = useSimulationStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulationPresets = [1000, 5000, 10000, 50000, 100000];

  const handleExport = () => {
    const json = exportParams();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const timestamp = new Date().toISOString().slice(0, 10);
    const propertyName = params.property.name || 'Bewertung';
    a.download = `${propertyName.replace(/[^a-zA-Z0-9äöüÄÖÜß]/g, '_')}_${timestamp}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importParams(content);
    };
    reader.readAsText(file);

    // Reset file input so the same file can be imported again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
                    ? 'bg-primary-500 text-white'
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

        {/* Export/Import */}
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Bewertung speichern / laden</h4>

          <div className="bg-blue-50 rounded-lg p-3 mb-4 border border-blue-200">
            <div className="flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                Speichern Sie Ihre aktuellen Eingaben als JSON-Datei, um sie später wieder zu laden.
                Alle Parameter aller Bewertungsverfahren werden gespeichert.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={handleExport}
              className="w-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportieren
            </Button>
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importieren
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
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
