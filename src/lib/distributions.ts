import { Distribution } from '../types';

// Box-Muller-Transformation für Normalverteilung
function boxMuller(): [number, number] {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const mag = Math.sqrt(-2.0 * Math.log(u1));
  const z0 = mag * Math.cos(2.0 * Math.PI * u2);
  const z1 = mag * Math.sin(2.0 * Math.PI * u2);
  return [z0, z1];
}

// Normalverteilung
export function sampleNormal(mean: number, stdDev: number): number {
  const [z] = boxMuller();
  return mean + stdDev * z;
}

// Gleichverteilung
export function sampleUniform(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

// Dreiecksverteilung
export function sampleTriangular(min: number, mode: number, max: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);

  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  } else {
    return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
  }
}

// Log-Normalverteilung
export function sampleLognormal(mean: number, stdDev: number): number {
  // Parameter für die zugrundeliegende Normalverteilung berechnen
  const variance = stdDev * stdDev;
  const mu = Math.log(mean * mean / Math.sqrt(variance + mean * mean));
  const sigma = Math.sqrt(Math.log(variance / (mean * mean) + 1));

  const [z] = boxMuller();
  return Math.exp(mu + sigma * z);
}

// Generische Sample-Funktion basierend auf Verteilungstyp
export function sampleDistribution(dist: Distribution): number {
  const { type, params } = dist;

  switch (type) {
    case 'normal': {
      const stdDev = Math.max(params.stdDev ?? 1, 0); // Keine negative Std.-Abw.
      return sampleNormal(params.mean ?? 0, stdDev);
    }

    case 'uniform': {
      const min = params.min ?? 0;
      const max = params.max ?? 1;
      // Falls min > max, tausche die Werte
      return min <= max ? sampleUniform(min, max) : sampleUniform(max, min);
    }

    case 'triangular': {
      let min = params.min ?? 0;
      let max = params.max ?? 1;
      // Falls min > max, tausche die Werte
      if (min > max) [min, max] = [max, min];
      // Mode muss zwischen min und max liegen
      const mode = Math.max(min, Math.min(params.mode ?? (min + max) / 2, max));
      return sampleTriangular(min, mode, max);
    }

    case 'lognormal': {
      const mean = Math.max(params.mean ?? 1, 0.001); // Lognormal braucht positiven Mean
      const stdDev = Math.max(params.stdDev ?? 0.5, 0.001); // Positive Std.-Abw.
      return sampleLognormal(mean, stdDev);
    }

    default:
      return params.mean ?? 0;
  }
}

// Batch-Sampling für Performance
export function sampleDistributionBatch(dist: Distribution, count: number): number[] {
  const results: number[] = new Array(count);
  for (let i = 0; i < count; i++) {
    results[i] = sampleDistribution(dist);
  }
  return results;
}

// Verteilungs-Statistiken für Vorschau
export function getDistributionStats(dist: Distribution): {
  expectedMean: number;
  expectedStdDev: number;
  p5: number;
  p95: number;
} {
  const { type, params } = dist;

  switch (type) {
    case 'normal':
      return {
        expectedMean: params.mean ?? 0,
        expectedStdDev: params.stdDev ?? 1,
        p5: (params.mean ?? 0) - 1.645 * (params.stdDev ?? 1),
        p95: (params.mean ?? 0) + 1.645 * (params.stdDev ?? 1),
      };

    case 'uniform':
      const uMin = params.min ?? 0;
      const uMax = params.max ?? 1;
      return {
        expectedMean: (uMin + uMax) / 2,
        expectedStdDev: (uMax - uMin) / Math.sqrt(12),
        p5: uMin + 0.05 * (uMax - uMin),
        p95: uMin + 0.95 * (uMax - uMin),
      };

    case 'triangular':
      const tMin = params.min ?? 0;
      const tMode = params.mode ?? 0.5;
      const tMax = params.max ?? 1;
      const tMean = (tMin + tMode + tMax) / 3;
      const tVar = (tMin*tMin + tMode*tMode + tMax*tMax - tMin*tMode - tMin*tMax - tMode*tMax) / 18;
      return {
        expectedMean: tMean,
        expectedStdDev: Math.sqrt(tVar),
        p5: tMin + 0.1 * (tMax - tMin), // Approximation
        p95: tMax - 0.1 * (tMax - tMin), // Approximation
      };

    case 'lognormal':
      const lMean = params.mean ?? 1;
      const lStd = params.stdDev ?? 0.5;
      return {
        expectedMean: lMean,
        expectedStdDev: lStd,
        p5: lMean * 0.5, // Approximation
        p95: lMean * 2, // Approximation
      };

    default:
      return {
        expectedMean: params.mean ?? 0,
        expectedStdDev: params.stdDev ?? 1,
        p5: (params.mean ?? 0) * 0.9,
        p95: (params.mean ?? 0) * 1.1,
      };
  }
}
