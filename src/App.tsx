import { useState, lazy, Suspense } from 'react';
import { useSimulationStore } from './store/simulationStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ToastContainer } from './components/ui/ToastContainer';
import { ErrorBoundary } from './components/ui/ErrorBoundary';

const SimulationPanel = lazy(() => import('./components/simulation/SimulationPanel').then(m => ({ default: m.SimulationPanel })));
const ResultsPanel = lazy(() => import('./components/results/ResultsPanel').then(m => ({ default: m.ResultsPanel })));
const ExportPanel = lazy(() => import('./components/export/ExportPanel').then(m => ({ default: m.ExportPanel })));
const InfoPanel = lazy(() => import('./components/info/InfoPanel').then(m => ({ default: m.InfoPanel })));

function App() {
  const { activeTab } = useSimulationStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'input':
        return <SimulationPanel />;
      case 'results':
        return <ResultsPanel />;
      case 'export':
        return <ExportPanel />;
      case 'info':
        return <InfoPanel />;
      default:
        return <SimulationPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F8]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:bg-white focus:px-4 focus:py-2 focus:rounded-lg focus:shadow-lg focus:text-primary-500 focus:font-medium"
      >
        Zum Inhalt springen
      </a>
      <Header
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={activeTab === 'input'}
      />
      <div className="flex">
        {activeTab === 'input' && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}
        <main
          id="main-content"
          className={`flex-1 p-4 sm:p-6 ${activeTab === 'input' ? 'md:ml-0' : 'max-w-7xl mx-auto'}`}
        >
          <ErrorBoundary fallbackTitle="Panel konnte nicht geladen werden">
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              </div>
            }>
              {renderContent()}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
