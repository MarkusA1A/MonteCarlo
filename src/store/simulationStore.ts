import { create } from 'zustand';
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
import { runMonteCarloSimulation } from '../lib/simulation/monteCarloEngine';

interface SimulationStore {
  // State
  params: SimulationParams;
  results: SimulationResults | null;
  status: SimulationStatus;
  progress: number;
  error: string | null;
  activeTab: ActiveTab;
  activeInputSection: ActiveInputSection;

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

  // UI Actions
  setActiveTab: (tab: ActiveTab) => void;
  setActiveInputSection: (section: ActiveInputSection) => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  // Initial State
  params: defaultSimulationParams,
  results: null,
  status: 'idle',
  progress: 0,
  error: null,
  activeTab: 'input',
  activeInputSection: 'property',

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

    set({ status: 'running', progress: 0, error: null });

    try {
      const results = await runMonteCarloSimulation(params, (progress) => {
        set({ progress });
      });

      set({
        results,
        status: 'completed',
        progress: 100,
        activeTab: 'results',
      });
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
      });
    }
  },

  resetResults: () => {
    set({
      results: null,
      status: 'idle',
      progress: 0,
      error: null,
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
    });
  },

  // UI Actions
  setActiveTab: (tab) => {
    set({ activeTab: tab });
  },

  setActiveInputSection: (section) => {
    set({ activeInputSection: section });
  },
}));
