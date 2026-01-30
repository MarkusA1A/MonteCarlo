import { Building2, BarChart3, FileText, Settings, Menu, X, HelpCircle } from 'lucide-react';
import { useSimulationStore } from '../../store/simulationStore';
import type { ActiveTab } from '../../types';

interface HeaderProps {
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  showMenuButton?: boolean;
}

export function Header({ sidebarOpen, onToggleSidebar, showMenuButton }: HeaderProps) {
  const { activeTab, activeInputSection, setActiveTab, setActiveInputSection, status } = useSimulationStore();

  const handleSettingsClick = () => {
    setActiveTab('input');
    setActiveInputSection('settings');
  };

  const isSettingsActive = activeTab === 'input' && activeInputSection === 'settings';

  const tabs: { id: ActiveTab; label: string; icon: typeof Building2 }[] = [
    { id: 'input', label: 'Eingabe', icon: Building2 },
    { id: 'results', label: 'Ergebnisse', icon: BarChart3 },
    { id: 'export', label: 'Export', icon: FileText },
    { id: 'info', label: 'Info', icon: HelpCircle },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 sm:h-16">
          {/* Logo + Title - Links */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            {showMenuButton && (
              <button
                onClick={onToggleSidebar}
                className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#0066FF] rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">Monte-Carlo Bewertung</h1>
            </div>
          </div>

          {/* Navigation Tabs - Mitte */}
          <nav className="flex-1 flex justify-center">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const isDisabled = (tab.id === 'results' || tab.id === 'export') && status !== 'completed';

                return (
                  <button
                    key={tab.id}
                    onClick={() => !isDisabled && setActiveTab(tab.id)}
                    disabled={isDisabled}
                    className={`
                      flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium rounded-md transition-all duration-200 min-h-[44px]
                      ${isActive
                        ? 'bg-white text-gray-900 shadow-sm'
                        : isDisabled
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Settings - Rechts */}
          <button
            onClick={handleSettingsClick}
            className={`flex-shrink-0 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${
              isSettingsActive
                ? 'text-[#0066FF] bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 active:bg-gray-200'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
