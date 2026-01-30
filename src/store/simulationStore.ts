import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  SimulationParams,
  SimulationResults,
  SimulationStatus,
  ActiveTab,
  ActiveInputSection,
  PropertyData,
  MieteinnahmenParams,
  VergleichswertParams,
  DCFParams,
  Distribution,
  defaultSimulationParams,
} from '../types';
import { runMonteCarloSimulation, SimulationPhase, LiveStats } from '../lib/simulation/monteCarloEngine';
import { toast } from './toastStore';

interface SimulationStore {
  // State
  params: SimulationParams;
  results: SimulationResults | null;
  status: SimulationStatus;
  progress: number;
  error: string | null;
  activeTab: ActiveTab;
  activeInputSection: ActiveInputSection;

  // Live Feedback State
  currentPhase: SimulationPhase | null;
  liveStats: LiveStats | null;

  // Property Actions
  setPropertyData: (data: Partial<PropertyData>) => void;

  // Parameter Actions
  setMieteinnahmenParams: (params: Partial<MieteinnahmenParams>) => void;
  setVergleichswertParams: (params: Partial<VergleichswertParams>) => void;
  setDCFParams: (params: Partial<DCFParams>) => void;
  setNumberOfSimulations: (count: number) => void;

  // Distribution Updates
  updateMieteinnahmenDistribution: (key: keyof MieteinnahmenParams, dist: Distribution) => void;
  updateVergleichswertDistribution: (key: keyof VergleichswertParams, dist: Distribution) => void;
  updateDCFDistribution: (key: keyof DCFParams, dist: Distribution) => void;

  // Simulation Actions
  runSimulation: () => Promise<void>;
  resetResults: () => void;
  resetAll: () => void;

  // Import/Export Actions
  setParams: (params: SimulationParams) => void;
  exportParams: () => string;
  importParams: (json: string) => boolean;

  // UI Actions
  setActiveTab: (tab: ActiveTab) => void;
  setActiveInputSection: (section: ActiveInputSection) => void;
}

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set, get) => ({
      // Initial State
      params: defaultSimulationParams,
      results: null,
      status: 'idle',
      progress: 0,
      error: null,
      activeTab: 'input',
      activeInputSection: 'property',

      // Live Feedback Initial State
      currentPhase: null,
      liveStats: null,

  // Property Actions
  setPropertyData: (data) => {
    set((state) => ({
      params: {
        ...state.params,
        property: { ...state.params.property, ...data },
      },
    }));
  },

  // Parameter Actions
  setMieteinnahmenParams: (params) => {
    set((state) => ({
      params: {
        ...state.params,
        mieteinnahmen: { ...state.params.mieteinnahmen, ...params },
      },
    }));
  },

  setVergleichswertParams: (params) => {
    set((state) => ({
      params: {
        ...state.params,
        vergleichswert: { ...state.params.vergleichswert, ...params },
      },
    }));
  },

  setDCFParams: (params) => {
    set((state) => ({
      params: {
        ...state.params,
        dcf: { ...state.params.dcf, ...params },
      },
    }));
  },

  setNumberOfSimulations: (count) => {
    set((state) => ({
      params: {
        ...state.params,
        numberOfSimulations: count,
      },
    }));
  },

  // Distribution Updates
  updateMieteinnahmenDistribution: (key, dist) => {
    set((state) => ({
      params: {
        ...state.params,
        mieteinnahmen: {
          ...state.params.mieteinnahmen,
          [key]: dist,
        },
      },
    }));
  },

  updateVergleichswertDistribution: (key, dist) => {
    set((state) => ({
      params: {
        ...state.params,
        vergleichswert: {
          ...state.params.vergleichswert,
          [key]: dist,
        },
      },
    }));
  },

  updateDCFDistribution: (key, dist) => {
    set((state) => ({
      params: {
        ...state.params,
        dcf: {
          ...state.params.dcf,
          [key]: dist,
        },
      },
    }));
  },

  // Simulation Actions
  runSimulation: async () => {
    const { params } = get();

    set({ status: 'running', progress: 0, error: null, currentPhase: null, liveStats: null });

    try {
      const results = await runMonteCarloSimulation(params, (progress, _iteration, phase, liveStats) => {
        set({ progress, currentPhase: phase ?? null, liveStats: liveStats ?? null });
      });

      set({
        results,
        status: 'completed',
        progress: 100,
        activeTab: 'results',
        currentPhase: null,
        liveStats: null,
      });

      toast.success('Simulation erfolgreich abgeschlossen');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
      set({
        status: 'error',
        error: errorMessage,
        currentPhase: null,
        liveStats: null,
      });

      toast.error(`Simulation fehlgeschlagen: ${errorMessage}`);
    }
  },

  resetResults: () => {
    set({
      results: null,
      status: 'idle',
      progress: 0,
      error: null,
      currentPhase: null,
      liveStats: null,
    });
  },

  resetAll: () => {
    set({
      params: defaultSimulationParams,
      results: null,
      status: 'idle',
      progress: 0,
      error: null,
      activeTab: 'input',
      activeInputSection: 'property',
      currentPhase: null,
      liveStats: null,
    });
  },

  // Import/Export Actions
  setParams: (params) => {
    set({
      params,
      results: null,
      status: 'idle',
      progress: 0,
      error: null,
    });
  },

  exportParams: () => {
    const { params } = get();
    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      params,
    };
    return JSON.stringify(exportData, null, 2);
  },

  importParams: (json: string) => {
    try {
      const data = JSON.parse(json);

      // Validate structure
      if (!data.params || !data.params.property) {
        toast.error('Ungültiges Dateiformat: Fehlende Parameter');
        return false;
      }

      // Import with validation - merge with defaults to handle missing fields
      const importedParams: SimulationParams = {
        ...defaultSimulationParams,
        ...data.params,
        property: {
          ...defaultSimulationParams.property,
          ...data.params.property,
        },
        mieteinnahmen: {
          ...defaultSimulationParams.mieteinnahmen,
          ...data.params.mieteinnahmen,
        },
        vergleichswert: {
          ...defaultSimulationParams.vergleichswert,
          ...data.params.vergleichswert,
        },
        dcf: {
          ...defaultSimulationParams.dcf,
          ...data.params.dcf,
        },
      };

      set({
        params: importedParams,
        results: null,
        status: 'idle',
        progress: 0,
        error: null,
      });

      toast.success('Parameter erfolgreich importiert');
      return true;
    } catch (error) {
      toast.error('Fehler beim Import: Ungültiges JSON-Format');
      return false;
    }
  },

      // UI Actions
      setActiveTab: (tab) => {
        set({ activeTab: tab });
      },

      setActiveInputSection: (section) => {
        set({ activeInputSection: section });
      },
    }),
    {
      name: 'monte-carlo-simulation',
      version: 2, // Version erhöht für Migration
      // Nur Parameter persistieren, keine Ergebnisse oder temporären UI-States
      partialize: (state) => ({
        params: state.params,
      }),
      // Migration von alten Feldnamen (v1) zu neuen (v2)
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          const state = persistedState as { params?: { vergleichswert?: Record<string, unknown> } };
          if (state?.params?.vergleichswert) {
            const vw = state.params.vergleichswert;
            // Alte Faktoren zu neuen Prozent-Anpassungen migrieren
            if ('locationFactor' in vw && !('locationAdjustment' in vw)) {
              // Konvertiere Faktor (z.B. 1.1) zu Prozent (z.B. 10%)
              vw.locationAdjustment = convertFactorToAdjustment(vw.locationFactor);
              delete vw.locationFactor;
            }
            if ('conditionFactor' in vw && !('conditionAdjustment' in vw)) {
              vw.conditionAdjustment = convertFactorToAdjustment(vw.conditionFactor);
              delete vw.conditionFactor;
            }
            if ('equipmentFactor' in vw && !('equipmentAdjustment' in vw)) {
              vw.equipmentAdjustment = convertFactorToAdjustment(vw.equipmentFactor);
              delete vw.equipmentFactor;
            }
            if ('marketAdjustmentFactor' in vw && !('marketAdjustment' in vw)) {
              vw.marketAdjustment = convertFactorToAdjustment(vw.marketAdjustmentFactor);
              delete vw.marketAdjustmentFactor;
            }
          }
        }
        return persistedState as SimulationStore;
      },
    }
  )
);

// Hilfsfunktion: Konvertiert Faktor-Distribution zu Prozent-Distribution
function convertFactorToAdjustment(factor: unknown): Distribution {
  if (!factor || typeof factor !== 'object') {
    return defaultSimulationParams.vergleichswert.locationAdjustment;
  }
  const dist = factor as Distribution;
  const converted: Distribution = {
    type: dist.type,
    params: { ...dist.params },
  };
  // Faktor (z.B. 1.1) zu Prozent (z.B. 10%) umrechnen
  if (converted.params.mean !== undefined) {
    converted.params.mean = (converted.params.mean - 1) * 100;
  }
  if (converted.params.stdDev !== undefined) {
    converted.params.stdDev = converted.params.stdDev * 100;
  }
  if (converted.params.min !== undefined) {
    converted.params.min = (converted.params.min - 1) * 100;
  }
  if (converted.params.max !== undefined) {
    converted.params.max = (converted.params.max - 1) * 100;
  }
  if (converted.params.mode !== undefined) {
    converted.params.mode = (converted.params.mode - 1) * 100;
  }
  return converted;
}
