import { Play, TrendingUp, TrendingDown, Minus, CheckCircle, Loader2 } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';
import { PropertyForm } from './PropertyForm';
import { MieteinnahmenForm } from './MieteinnahmenForm';
import { VergleichswertForm } from './VergleichswertForm';
import { DCFForm } from './DCFForm';
import { SettingsForm } from './SettingsForm';
import { formatCurrency } from '../../lib/statistics';

export function SimulationPanel() {
  const {
    activeInputSection,
    status,
    progress,
    params,
    runSimulation,
    currentPhase,
    liveStats,
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
            {/* Phasen-Anzeige */}
            {currentPhase && (
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                  <span className="text-sm font-medium text-gray-900">
                    Phase {currentPhase.current}/{currentPhase.total}: {currentPhase.name}
                  </span>
                </div>
                <span className="text-sm text-primary-500 font-medium">
                  {progress.toFixed(0)}%
                </span>
              </div>
            )}

            <Progress value={progress} size="lg" />

            <p className="text-xs text-gray-500 text-center">
              {Math.round((progress / 100) * params.numberOfSimulations).toLocaleString('de-DE')} von{' '}
              {params.numberOfSimulations.toLocaleString('de-DE')} Simulationen
            </p>

            {/* Live-Statistiken */}
            {liveStats && (
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Live-Statistik
                  </span>
                  <div className="flex items-center space-x-1">
                    {liveStats.trend === 'rising' && <TrendingUp className="w-3 h-3 text-green-500" />}
                    {liveStats.trend === 'falling' && <TrendingDown className="w-3 h-3 text-red-500" />}
                    {liveStats.trend === 'stable' && <Minus className="w-3 h-3 text-gray-400" />}
                    <span className="text-xs text-gray-500">
                      {liveStats.trend === 'rising' && 'steigend'}
                      {liveStats.trend === 'falling' && 'fallend'}
                      {liveStats.trend === 'stable' && 'stabil'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-gray-500">Aktueller Mittelwert</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(liveStats.currentMean)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Standardabweichung</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {formatCurrency(liveStats.currentStdDev)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Modell-Status */}
            {currentPhase && currentPhase.models.length > 0 && (
              <div className="flex items-center justify-center space-x-4 pt-2">
                {currentPhase.models.map((model, idx) => (
                  <div key={idx} className="flex items-center space-x-1.5">
                    {model.status === 'completed' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <Loader2 className="w-3.5 h-3.5 text-primary-500 animate-spin" />
                    )}
                    <span className={`text-xs ${model.status === 'completed' ? 'text-green-600' : 'text-gray-600'}`}>
                      {model.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
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
