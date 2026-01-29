import { useSimulationStore } from './store/simulationStore';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { SimulationPanel } from './components/simulation/SimulationPanel';
import { ResultsPanel } from './components/results/ResultsPanel';
import { ExportPanel } from './components/export/ExportPanel';

function App() {
  const { activeTab } = useSimulationStore();

  const renderContent = () => {
    switch (activeTab) {
      case 'input':
        return <SimulationPanel />;
      case 'results':
        return <ResultsPanel />;
      case 'export':
        return <ExportPanel />;
      default:
        return <SimulationPanel />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F8]">
      <Header />
      <div className="flex">
        {activeTab === 'input' && <Sidebar />}
        <main className={`flex-1 p-6 ${activeTab === 'input' ? '' : 'max-w-7xl mx-auto'}`}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
