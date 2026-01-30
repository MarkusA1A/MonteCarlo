// Verteilungstypen für Monte-Carlo-Simulation
export type DistributionType = 'normal' | 'triangular' | 'uniform' | 'lognormal';

export interface Distribution {
  type: DistributionType;
  params: {
    mean?: number;
    stdDev?: number;
    min?: number;
    max?: number;
    mode?: number;
  };
}

// Objekt-Stammdaten
export interface PropertyData {
  name: string;
  address: string;
  area: number; // Wohnfläche in m²
  yearBuilt: number;
  propertyType: 'wohnung' | 'haus' | 'mehrfamilienhaus' | 'gewerbe';
  numberOfUnits: number;
}

// Parameter für Mieteinnahmen-Modell (Ertragswertverfahren)
export interface MieteinnahmenParams {
  enabled: boolean;
  monthlyRentPerSqm: Distribution; // €/m²
  vacancyRate: Distribution; // %
  annualRentIncrease: Distribution; // %
  maintenanceCosts: Distribution; // % der Mieteinnahmen
  managementCosts: Distribution; // % der Mieteinnahmen
  capitalizationRate: Distribution; // %
}

// Parameter für Vergleichswert-Modell
export interface VergleichswertParams {
  enabled: boolean;
  basePricePerSqm: Distribution; // €/m²
  locationFactor: Distribution; // Multiplikator
  conditionFactor: Distribution; // Multiplikator
  equipmentFactor: Distribution; // Multiplikator
  marketAdjustmentFactor: Distribution; // Multiplikator
}

// Parameter für DCF-Modell
export interface DCFParams {
  enabled: boolean;
  initialMonthlyRent: Distribution; // € pro Monat gesamt
  annualRentGrowth: Distribution; // %
  discountRate: Distribution; // %
  exitCapRate: Distribution; // %
  holdingPeriod: number; // Jahre (fix)
  operatingExpenseRatio: Distribution; // % der Mieteinnahmen
}

// Alle Simulationsparameter kombiniert
export interface SimulationParams {
  property: PropertyData;
  mieteinnahmen: MieteinnahmenParams;
  vergleichswert: VergleichswertParams;
  dcf: DCFParams;
  numberOfSimulations: number;
}

// Einzelnes Simulationsergebnis
export interface SingleSimulationResult {
  mieteinnahmenValue: number | null;
  vergleichswertValue: number | null;
  dcfValue: number | null;
  combinedValue: number;
}

// Statistische Auswertung
export interface Statistics {
  mean: number;
  median: number;
  stdDev: number;
  min: number;
  max: number;
  percentile10: number;
  percentile25: number;
  percentile75: number;
  percentile90: number;
  confidenceInterval95: [number, number];
}

// Sensitivitätsanalyse-Ergebnis
export interface SensitivityResult {
  parameter: string;
  label: string;
  lowValue: number;
  highValue: number;
  baseValue: number;
  impact: number;
}

// Histogramm-Daten
export interface HistogramBin {
  rangeStart: number;
  rangeEnd: number;
  count: number;
  percentage: number;
}

// Gesamtergebnis der Simulation
export interface SimulationResults {
  rawResults: SingleSimulationResult[];
  mieteinnahmenStats: Statistics | null;
  vergleichswertStats: Statistics | null;
  dcfStats: Statistics | null;
  combinedStats: Statistics;
  histogram: HistogramBin[];
  sensitivityAnalysis: SensitivityResult[];
  runDate: Date;
  params: SimulationParams;
}

// UI-State
export type SimulationStatus = 'idle' | 'running' | 'completed' | 'error';
export type ActiveTab = 'input' | 'results' | 'export' | 'info';
export type ActiveInputSection = 'property' | 'mieteinnahmen' | 'vergleichswert' | 'dcf' | 'settings';

// Default-Werte für Parameter
export const defaultDistribution = (mean: number, stdDev: number): Distribution => ({
  type: 'normal',
  params: { mean, stdDev }
});

export const defaultTriangular = (min: number, mode: number, max: number): Distribution => ({
  type: 'triangular',
  params: { min, mode, max }
});

export const defaultPropertyData: PropertyData = {
  name: 'Musterimmobilie',
  address: 'Musterstraße 1, 80331 München',
  area: 100,
  yearBuilt: 2000,
  propertyType: 'wohnung',
  numberOfUnits: 1,
};

export const defaultMieteinnahmenParams: MieteinnahmenParams = {
  enabled: true,
  monthlyRentPerSqm: defaultDistribution(15, 2),
  vacancyRate: defaultTriangular(0, 3, 10),
  annualRentIncrease: defaultDistribution(2, 0.5),
  maintenanceCosts: defaultTriangular(5, 10, 15),
  managementCosts: defaultTriangular(2, 3, 5),
  capitalizationRate: defaultDistribution(4, 0.5),
};

export const defaultVergleichswertParams: VergleichswertParams = {
  enabled: true,
  basePricePerSqm: defaultDistribution(5000, 800),
  locationFactor: defaultTriangular(0.9, 1.0, 1.2),
  conditionFactor: defaultTriangular(0.85, 1.0, 1.1),
  equipmentFactor: defaultTriangular(0.9, 1.0, 1.15),
  marketAdjustmentFactor: defaultDistribution(1.0, 0.05),
};

export const defaultDCFParams: DCFParams = {
  enabled: true,
  initialMonthlyRent: defaultDistribution(1500, 200),
  annualRentGrowth: defaultDistribution(2, 0.5),
  discountRate: defaultDistribution(5, 0.75),
  exitCapRate: defaultDistribution(4.5, 0.5),
  holdingPeriod: 10,
  operatingExpenseRatio: defaultTriangular(20, 25, 35),
};

export const defaultSimulationParams: SimulationParams = {
  property: defaultPropertyData,
  mieteinnahmen: defaultMieteinnahmenParams,
  vergleichswert: defaultVergleichswertParams,
  dcf: defaultDCFParams,
  numberOfSimulations: 10000,
};
