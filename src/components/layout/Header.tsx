import { Building2, BarChart3, FileText, Settings } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import type { ActiveTab } from '../../types';

export function Header() {
  const { activeTab, setActiveTab, status } = useSimulationStore();

  const tabs: { id: ActiveTab; label: string; icon: typeof Building2 }[] = [
    { id: 'input', label: 'Eingabe', icon: Building2 },
    { id: 'results', label: 'Ergebnisse', icon: BarChart3 },
    { id: 'export', label: 'Export', icon: FileText },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#0066FF] rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">ImmoValue</h1>
              <p className="text-xs text-gray-500">Monte-Carlo Bewertung</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isDisabled = tab.id === 'results' && status !== 'completed';

              return (
                <button
                  key={tab.id}
                  onClick={() => !isDisabled && setActiveTab(tab.id)}
                  disabled={isDisabled}
                  className={`
                    flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200
                    ${isActive
                      ? 'bg-white text-gray-900 shadow-sm'
                      : isDisabled
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Settings */}
          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
