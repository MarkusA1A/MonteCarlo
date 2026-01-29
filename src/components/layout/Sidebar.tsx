import { Building2, Euro, Scale, TrendingUp, Settings2 } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import type { ActiveInputSection } from '../../types';

export function Sidebar() {
  const { activeInputSection, setActiveInputSection, params } = useSimulationStore();

  const sections: {
    id: ActiveInputSection;
    label: string;
    icon: typeof Building2;
    enabled?: boolean;
  }[] = [
    { id: 'property', label: 'Objektdaten', icon: Building2, enabled: true },
    { id: 'mieteinnahmen', label: 'Ertragswert', icon: Euro, enabled: params.mieteinnahmen.enabled },
    { id: 'vergleichswert', label: 'Vergleichswert', icon: Scale, enabled: params.vergleichswert.enabled },
    { id: 'dcf', label: 'DCF-Modell', icon: TrendingUp, enabled: params.dcf.enabled },
    { id: 'settings', label: 'Einstellungen', icon: Settings2, enabled: true },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-64px)]">
      <nav className="p-4 space-y-1">
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeInputSection === section.id;

          return (
            <button
              key={section.id}
              onClick={() => setActiveInputSection(section.id)}
              className={`
                w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-200
                ${isActive
                  ? 'bg-[#0066FF]/10 text-[#0066FF]'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#0066FF]' : 'text-gray-400'}`} />
              <span>{section.label}</span>
              {section.id !== 'property' && section.id !== 'settings' && (
                <span
                  className={`
                    ml-auto w-2 h-2 rounded-full
                    ${section.enabled ? 'bg-green-500' : 'bg-gray-300'}
                  `}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Simulation Info */}
      <div className="absolute bottom-0 left-0 w-64 p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex justify-between">
            <span>Simulationen:</span>
            <span className="font-medium text-gray-700">
              {params.numberOfSimulations.toLocaleString('de-DE')}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Aktive Modelle:</span>
            <span className="font-medium text-gray-700">
              {[params.mieteinnahmen.enabled, params.vergleichswert.enabled, params.dcf.enabled].filter(Boolean).length} / 3
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
