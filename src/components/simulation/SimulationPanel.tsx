import { Play } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { PropertyForm } from './PropertyForm';
import { MieteinnahmenForm } from './MieteinnahmenForm';
import { VergleichswertForm } from './VergleichswertForm';
import { DCFForm } from './DCFForm';
import { SettingsForm } from './SettingsForm';

export function SimulationPanel() {
  const {
    activeInputSection,
    status,
    progress,
    params,
    runSimulation,
  } = useSimulationStore();

  const isRunning = status === 'running';
  const hasActiveModel =
    params.mieteinnahmen.enabled ||
    params.vergleichswert.enabled ||
    params.dcf.enabled;

  const renderActiveSection = () => {
    switch (activeInputSection) {
      case 'property':
        return <PropertyForm />;
      case 'mieteinnahmen':
        return <MieteinnahmenForm />;
      case 'vergleichswert':
        return <VergleichswertForm />;
      case 'dcf':
        return <DCFForm />;
      case 'settings':
        return <SettingsForm />;
      default:
        return <PropertyForm />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Aktive Sektion */}
      {renderActiveSection()}

      {/* Simulation starten */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {isRunning ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Simulation läuft...
              </span>
              <span className="text-sm text-[#0066FF] font-medium">
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} size="lg" />
            <p className="text-xs text-gray-500 text-center">
              {Math.round((progress / 100) * params.numberOfSimulations).toLocaleString('de-DE')} von{' '}
              {params.numberOfSimulations.toLocaleString('de-DE')} Simulationen
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  Bereit zur Simulation
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {params.numberOfSimulations.toLocaleString('de-DE')} Durchläufe mit{' '}
                  {[params.mieteinnahmen.enabled, params.vergleichswert.enabled, params.dcf.enabled].filter(Boolean).length}{' '}
                  aktiven Modellen
                </p>
              </div>
              <Button
                onClick={runSimulation}
                disabled={!hasActiveModel}
                size="lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Simulation starten
              </Button>
            </div>
            {!hasActiveModel && (
              <p className="text-xs text-red-600">
                Bitte aktivieren Sie mindestens ein Bewertungsmodell.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
