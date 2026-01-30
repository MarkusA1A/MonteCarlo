import {
  SimulationParams,
  SimulationResults,
  SingleSimulationResult,
  SensitivityResult,
  Distribution,
} from '../../types';
import { calculateMieteinnahmenValue } from './mieteinnahmenModel';
import { calculateVergleichswertValue } from './vergleichswertModel';
import { calculateDCFValue } from './dcfModel';
import { calculateStatistics, createHistogram, mean } from '../statistics';

export type SimulationProgressCallback = (progress: number, currentIteration: number) => void;

/**
 * Führt eine einzelne Simulation durch
 */
function runSingleSimulation(params: SimulationParams): SingleSimulationResult {
  let mieteinnahmenValue: number | null = null;
  let vergleichswertValue: number | null = null;
  let dcfValue: number | null = null;

  if (params.mieteinnahmen.enabled) {
    mieteinnahmenValue = calculateMieteinnahmenValue(params.property, params.mieteinnahmen);
  }

  if (params.vergleichswert.enabled) {
    vergleichswertValue = calculateVergleichswertValue(params.property, params.vergleichswert);
  }

  if (params.dcf.enabled) {
    dcfValue = calculateDCFValue(params.property, params.dcf);
  }

  // Kombinierter Wert als gewichteter Durchschnitt der aktiven Methoden
  const values: number[] = [];
  if (mieteinnahmenValue !== null) values.push(mieteinnahmenValue);
  if (vergleichswertValue !== null) values.push(vergleichswertValue);
  if (dcfValue !== null) values.push(dcfValue);

  const combinedValue = values.length > 0 ? mean(values) : 0;

  return {
    mieteinnahmenValue,
    vergleichswertValue,
    dcfValue,
    combinedValue,
  };
}

/**
 * Führt die vollständige Monte-Carlo-Simulation durch
 */
export async function runMonteCarloSimulation(
  params: SimulationParams,
  onProgress?: SimulationProgressCallback
): Promise<SimulationResults> {
  const rawResults: SingleSimulationResult[] = [];
  const batchSize = 100;

  for (let i = 0; i < params.numberOfSimulations; i++) {
    rawResults.push(runSingleSimulation(params));

    // Progress-Update alle 100 Iterationen
    if (onProgress && (i + 1) % batchSize === 0) {
      const progress = ((i + 1) / params.numberOfSimulations) * 100;
      onProgress(progress, i + 1);
      // Yield to UI thread
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  // Finale Progress-Update
  if (onProgress) {
    onProgress(100, params.numberOfSimulations);
  }

  // Statistiken berechnen
  const mieteinnahmenValues = rawResults
    .map(r => r.mieteinnahmenValue)
    .filter((v): v is number => v !== null);

  const vergleichswertValues = rawResults
    .map(r => r.vergleichswertValue)
    .filter((v): v is number => v !== null);

  const dcfValues = rawResults
    .map(r => r.dcfValue)
    .filter((v): v is number => v !== null);

  const combinedValues = rawResults.map(r => r.combinedValue);

  // Sensitivitätsanalyse
  const sensitivityAnalysis = runSensitivityAnalysis(params);

  return {
    rawResults,
    mieteinnahmenStats: mieteinnahmenValues.length > 0 ? calculateStatistics(mieteinnahmenValues) : null,
    vergleichswertStats: vergleichswertValues.length > 0 ? calculateStatistics(vergleichswertValues) : null,
    dcfStats: dcfValues.length > 0 ? calculateStatistics(dcfValues) : null,
    combinedStats: calculateStatistics(combinedValues),
    histogram: createHistogram(combinedValues, 50),
    sensitivityAnalysis,
    runDate: new Date(),
    params,
  };
}

/**
 * Sensitivitätsanalyse: Berechnet den Einfluss jedes Parameters auf das Ergebnis
 */
function runSensitivityAnalysis(params: SimulationParams): SensitivityResult[] {
  const results: SensitivityResult[] = [];
  const baselineSimulations = 1000;

  // Baseline berechnen
  const baselineResults: number[] = [];
  for (let i = 0; i < baselineSimulations; i++) {
    const result = runSingleSimulation(params);
    baselineResults.push(result.combinedValue);
  }
  const baseValue = mean(baselineResults);

  // Helper: Parameter um ±20% variieren und Auswirkung messen
  const analyzeParameter = (
    parameter: string,
    label: string,
    getModifiedParams: (factor: number) => SimulationParams
  ) => {
    // Low case (-20%)
    const lowParams = getModifiedParams(0.8);
    const lowResults: number[] = [];
    for (let i = 0; i < baselineSimulations; i++) {
      lowResults.push(runSingleSimulation(lowParams).combinedValue);
    }
    const lowValue = mean(lowResults);

    // High case (+20%)
    const highParams = getModifiedParams(1.2);
    const highResults: number[] = [];
    for (let i = 0; i < baselineSimulations; i++) {
      highResults.push(runSingleSimulation(highParams).combinedValue);
    }
    const highValue = mean(highResults);

    results.push({
      parameter,
      label,
      lowValue,
      highValue,
      baseValue,
      impact: Math.abs(highValue - lowValue),
    });
  };

  // Mieteinnahmen-Parameter
  if (params.mieteinnahmen.enabled) {
    analyzeParameter('monthlyRentPerSqm', 'Monatsmiete (€/m²)', (factor) => ({
      ...params,
      mieteinnahmen: {
        ...params.mieteinnahmen,
        monthlyRentPerSqm: scaleDistribution(params.mieteinnahmen.monthlyRentPerSqm, factor),
      },
    }));

    analyzeParameter('capitalizationRate', 'Kapitalisierungszinssatz', (factor) => ({
      ...params,
      mieteinnahmen: {
        ...params.mieteinnahmen,
        capitalizationRate: scaleDistribution(params.mieteinnahmen.capitalizationRate, factor),
      },
    }));
  }

  // Vergleichswert-Parameter
  if (params.vergleichswert.enabled) {
    analyzeParameter('basePricePerSqm', 'Basis-Quadratmeterpreis', (factor) => ({
      ...params,
      vergleichswert: {
        ...params.vergleichswert,
        basePricePerSqm: scaleDistribution(params.vergleichswert.basePricePerSqm, factor),
      },
    }));

    analyzeParameter('locationFactor', 'Lagefaktor', (factor) => ({
      ...params,
      vergleichswert: {
        ...params.vergleichswert,
        locationFactor: scaleDistribution(params.vergleichswert.locationFactor, factor),
      },
    }));
  }

  // DCF-Parameter
  if (params.dcf.enabled) {
    analyzeParameter('discountRate', 'Diskontierungssatz', (factor) => ({
      ...params,
      dcf: {
        ...params.dcf,
        discountRate: scaleDistribution(params.dcf.discountRate, factor),
      },
    }));

    analyzeParameter('exitCapRate', 'Exit-Cap-Rate', (factor) => ({
      ...params,
      dcf: {
        ...params.dcf,
        exitCapRate: scaleDistribution(params.dcf.exitCapRate, factor),
      },
    }));
  }

  // Nach Impact sortieren
  results.sort((a, b) => b.impact - a.impact);

  return results;
}

/**
 * Skaliert eine Verteilung um einen Faktor
 */
function scaleDistribution(dist: Distribution, factor: number): Distribution {
  const scaled = { ...dist, params: { ...dist.params } };

  if (scaled.params.mean !== undefined) {
    scaled.params.mean *= factor;
  }
  if (scaled.params.min !== undefined) {
    scaled.params.min *= factor;
  }
  if (scaled.params.max !== undefined) {
    scaled.params.max *= factor;
  }
  if (scaled.params.mode !== undefined) {
    scaled.params.mode *= factor;
  }

  return scaled;
}

/**
 * Schnelle Vorschau-Simulation mit weniger Iterationen
 */
export function runQuickPreview(params: SimulationParams, iterations: number = 500): {
  estimatedMean: number;
  estimatedRange: [number, number];
} {
  const values: number[] = [];
  for (let i = 0; i < iterations; i++) {
    values.push(runSingleSimulation(params).combinedValue);
  }

  values.sort((a, b) => a - b);

  return {
    estimatedMean: mean(values),
    estimatedRange: [
      values[Math.floor(iterations * 0.1)],
      values[Math.floor(iterations * 0.9)],
    ],
  };
}
