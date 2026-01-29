import { Statistics, HistogramBin } from '../types';

// Mittelwert
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Median
export function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

// Standardabweichung
export function standardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const squaredDiffs = values.map(v => Math.pow(v - m, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, v) => sum + v, 0) / (values.length - 1));
}

// Perzentil
export function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (upper >= sorted.length) return sorted[sorted.length - 1];
  if (lower < 0) return sorted[0];

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

// Minimum und Maximum
export function minMax(values: number[]): { min: number; max: number } {
  if (values.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...values),
    max: Math.max(...values),
  };
}

// Konfidenzintervall (95%)
export function confidenceInterval95(values: number[]): [number, number] {
  const m = mean(values);
  const std = standardDeviation(values);
  const marginOfError = 1.96 * (std / Math.sqrt(values.length));
  return [m - marginOfError, m + marginOfError];
}

// Alle Statistiken berechnen
export function calculateStatistics(values: number[]): Statistics {
  const { min, max } = minMax(values);
  const ci = confidenceInterval95(values);

  return {
    mean: mean(values),
    median: median(values),
    stdDev: standardDeviation(values),
    min,
    max,
    percentile10: percentile(values, 10),
    percentile25: percentile(values, 25),
    percentile75: percentile(values, 75),
    percentile90: percentile(values, 90),
    confidenceInterval95: ci,
  };
}

// Histogramm erstellen
export function createHistogram(values: number[], bins: number = 50): HistogramBin[] {
  if (values.length === 0) return [];

  const { min, max } = minMax(values);
  const range = max - min;
  const binWidth = range / bins;

  const histogram: HistogramBin[] = Array(bins).fill(null).map((_, i) => ({
    rangeStart: min + i * binWidth,
    rangeEnd: min + (i + 1) * binWidth,
    count: 0,
    percentage: 0,
  }));

  values.forEach(value => {
    let binIndex = Math.floor((value - min) / binWidth);
    if (binIndex >= bins) binIndex = bins - 1;
    if (binIndex < 0) binIndex = 0;
    histogram[binIndex].count++;
  });

  const total = values.length;
  histogram.forEach(bin => {
    bin.percentage = (bin.count / total) * 100;
  });

  return histogram;
}

// Währungsformatierung
export function formatCurrency(value: number, locale: string = 'de-DE'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// Prozentformatierung
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// Große Zahlen formatieren
export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)} Mio. €`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)} Tsd. €`;
  }
  return formatCurrency(value);
}
