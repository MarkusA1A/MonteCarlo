import { useState } from 'react';
import { useSimulationStore } from './store/simulationStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { ResultsPanel } from './components/results/ResultsPanel';
import { ExportPanel } from './components/export/ExportPanel';
import { InfoPanel } from './components/info/InfoPanel';
import { ToastContainer } from './components/ui/ToastContainer';

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
        <main className={`flex-1 p-4 sm:p-6 ${activeTab === 'input' ? 'md:ml-0' : 'max-w-7xl mx-auto'}`}>
          {renderContent()}
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
