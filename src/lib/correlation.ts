/**
 * Korrelationsmatrix und Cholesky-Zerlegung für korrelierte Zufallsvariablen
 *
 * Variablen-Reihenfolge:
 * 0: Miete (monthlyRentPerSqm)
 * 1: Leerstand (vacancyRate)
 * 2: Instandhaltung (maintenanceCosts)
 * 3: Kapitalisierungszins (capitalizationRate)
 *
 * Korrelationsmatrix basiert auf empirischen Zusammenhängen:
 * - Hohe Mieten korrelieren negativ mit Leerstand (gute Lagen)
 * - Hoher Leerstand korreliert positiv mit hohem Cap Rate (Risiko)
 * - Hoher Cap Rate korreliert positiv mit Leerstand (Krisenszenarien)
 */

// Korrelationsmatrix für Mieteinnahmen-Parameter
// Format: [Miete, Leerstand, Instandhaltung, CapRate]
export const MIETEINNAHMEN_CORRELATION_MATRIX: number[][] = [
  [1.0,   -0.65,  0.2,   -0.35],  // Miete
  [-0.65,  1.0,   0.4,    0.6],   // Leerstand
  [0.2,    0.4,   1.0,    0.15],  // Instandhaltung
  [-0.35,  0.6,   0.15,   1.0],   // CapRate
];

/**
 * Cholesky-Zerlegung einer positiv-definiten symmetrischen Matrix.
 * Gibt die untere Dreiecksmatrix L zurück, sodass A = L * L^T.
 *
 * @param matrix - Die Korrelationsmatrix (muss positiv-definit und symmetrisch sein)
 * @returns Die untere Dreiecksmatrix L
 * @throws Error wenn die Matrix nicht positiv-definit ist
 */
export function choleskyDecomposition(matrix: number[][]): number[][] {
  const n = matrix.length;
  const L: number[][] = Array(n)
    .fill(null)
    .map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = 0;

      if (j === i) {
        // Diagonalelement
        for (let k = 0; k < j; k++) {
          sum += L[j][k] * L[j][k];
        }
        const diagonalValue = matrix[j][j] - sum;
        if (diagonalValue <= 0) {
          throw new Error(
            `Matrix ist nicht positiv-definit. Diagonalelement ${j} wäre ${diagonalValue}`
          );
        }
        L[j][j] = Math.sqrt(diagonalValue);
      } else {
        // Nicht-Diagonalelement
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k];
        }
        L[i][j] = (matrix[i][j] - sum) / L[j][j];
      }
    }
  }

  return L;
}

// Vorberechnete Cholesky-Matrix für Performance
let _cachedCholeskyMatrix: number[][] | null = null;

/**
 * Gibt die vorberechnete Cholesky-Matrix für die Mieteinnahmen-Korrelationen zurück.
 */
export function getMieteinnahmenCholeskyMatrix(): number[][] {
  if (_cachedCholeskyMatrix === null) {
    _cachedCholeskyMatrix = choleskyDecomposition(MIETEINNAHMEN_CORRELATION_MATRIX);
  }
  return _cachedCholeskyMatrix;
}

/**
 * Generiert unabhängige Standard-Normalverteilte Zufallsvariablen (Z-Scores).
 * Verwendet Box-Muller-Transformation.
 *
 * @param count - Anzahl der zu generierenden Z-Scores
 * @returns Array von Z-Scores
 */
export function generateIndependentZScores(count: number): number[] {
  const zScores: number[] = new Array(count);

  for (let i = 0; i < count; i += 2) {
    // Box-Muller-Transformation
    let u1 = 0, u2 = 0;
    while (u1 === 0) u1 = Math.random();
    while (u2 === 0) u2 = Math.random();

    const mag = Math.sqrt(-2.0 * Math.log(u1));
    zScores[i] = mag * Math.cos(2.0 * Math.PI * u2);

    if (i + 1 < count) {
      zScores[i + 1] = mag * Math.sin(2.0 * Math.PI * u2);
    }
  }

  return zScores;
}

/**
 * Transformiert unabhängige Z-Scores in korrelierte Z-Scores
 * mittels der Cholesky-Matrix.
 *
 * @param independentZ - Unabhängige Standard-Normalverteilte Variablen
 * @param choleskyMatrix - Die untere Dreiecksmatrix aus der Cholesky-Zerlegung
 * @returns Korrelierte Z-Scores
 */
export function transformToCorrelatedZScores(
  independentZ: number[],
  choleskyMatrix: number[][]
): number[] {
  const n = independentZ.length;
  const correlatedZ: number[] = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      correlatedZ[i] += choleskyMatrix[i][j] * independentZ[j];
    }
  }

  return correlatedZ;
}

/**
 * Fat-Tail-Verstärkung: Wenn der Kapitalisierungszins-Z-Score im oberen Tail liegt,
 * verstärke die Korrelation zum Leerstand (Marktcrash-Szenario).
 *
 * @param correlatedZ - Die korrelierten Z-Scores [Miete, Leerstand, Instandhaltung, CapRate]
 * @param fatTailThreshold - Z-Score-Schwellwert (Standard: 1.64 = oberstes 5%)
 * @param amplificationFactor - Verstärkungsfaktor für den Leerstand (Standard: 1.5)
 * @returns Modifizierte korrelierte Z-Scores
 */
export function applyFatTailLogic(
  correlatedZ: number[],
  fatTailThreshold: number = 1.64,
  amplificationFactor: number = 1.5
): number[] {
  const result = [...correlatedZ];

  const capRateZScore = correlatedZ[3]; // Index 3 = Kapitalisierungszins

  // Wenn Cap Rate im oberen Tail (Krisenszenario)
  if (capRateZScore > fatTailThreshold) {
    // Verstärke den Leerstand-Z-Score (Index 1)
    // Der Verstärkungseffekt skaliert mit der Überschreitung des Thresholds
    const excessZ = capRateZScore - fatTailThreshold;
    const dynamicAmplification = 1 + (amplificationFactor - 1) * Math.min(excessZ / 1.0, 1.5);

    result[1] = correlatedZ[1] * dynamicAmplification;
  }

  return result;
}

/**
 * Transformiert einen Z-Score in einen Wert basierend auf der Verteilungsparameter.
 * Unterstützt Normal-, Dreiecks-, Gleichverteilung und Log-Normal.
 *
 * @param zScore - Der Z-Score (-∞ bis +∞)
 * @param distType - Der Verteilungstyp
 * @param params - Die Verteilungsparameter
 * @returns Der transformierte Wert
 */
export function zScoreToValue(
  zScore: number,
  distType: 'normal' | 'triangular' | 'uniform' | 'lognormal',
  params: { mean?: number; stdDev?: number; min?: number; max?: number; mode?: number }
): number {
  switch (distType) {
    case 'normal': {
      const mean = params.mean ?? 0;
      const stdDev = Math.max(params.stdDev ?? 1, 0);
      return mean + stdDev * zScore;
    }

    case 'triangular': {
      // Transformiere Z-Score zu Uniform [0, 1] via Normalverteilungs-CDF
      const u = normalCDF(zScore);

      let min = params.min ?? 0;
      let max = params.max ?? 1;
      if (min > max) [min, max] = [max, min];
      const mode = Math.max(min, Math.min(params.mode ?? (min + max) / 2, max));

      // Inverse CDF der Dreiecksverteilung
      const fc = (mode - min) / (max - min);
      if (u < fc) {
        return min + Math.sqrt(u * (max - min) * (mode - min));
      } else {
        return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
      }
    }

    case 'uniform': {
      // Transformiere Z-Score zu Uniform [0, 1] via Normalverteilungs-CDF
      const u = normalCDF(zScore);

      const min = params.min ?? 0;
      const max = params.max ?? 1;
      return min <= max ? min + u * (max - min) : max + u * (min - max);
    }

    case 'lognormal': {
      const mean = Math.max(params.mean ?? 1, 0.001);
      const stdDev = Math.max(params.stdDev ?? 0.5, 0.001);

      // Parameter für die zugrundeliegende Normalverteilung
      const variance = stdDev * stdDev;
      const mu = Math.log(mean * mean / Math.sqrt(variance + mean * mean));
      const sigma = Math.sqrt(Math.log(variance / (mean * mean) + 1));

      return Math.exp(mu + sigma * zScore);
    }

    default:
      return params.mean ?? 0;
  }
}

/**
 * Kumulative Verteilungsfunktion der Standardnormalverteilung.
 * Approximation nach Abramowitz and Stegun (1964).
 */
export function normalCDF(z: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  // Vorzeichen speichern
  const sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.SQRT2;

  // Approximation
  const t = 1.0 / (1.0 + p * z);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);

  return 0.5 * (1.0 + sign * y);
}

/**
 * Begrenzt einen Wert auf physikalisch sinnvolle Grenzen.
 *
 * @param value - Der zu begrenzende Wert
 * @param min - Minimaler erlaubter Wert
 * @param max - Maximaler erlaubter Wert
 * @returns Der begrenzte Wert
 */
export function clampValue(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Korrelierte Mieteinnahmen-Samples
 */
export interface CorrelatedMieteinnahmenSamples {
  monthlyRentPerSqm: number;
  vacancyRate: number;        // in %
  maintenanceCostRate: number; // in %
  capRate: number;            // in %
  // Debug-Info
  zScores?: {
    independent: number[];
    correlated: number[];
    fatTailApplied: boolean;
  };
}

/**
 * Generiert korrelierte Samples für alle Mieteinnahmen-Parameter.
 *
 * @param params - Die Verteilungsparameter für alle Variablen
 * @param enableFatTail - Ob Fat-Tail-Logik aktiviert werden soll
 * @param debug - Ob Debug-Informationen zurückgegeben werden sollen
 * @returns Korrelierte Samples
 */
export function generateCorrelatedMieteinnahmenSamples(
  params: {
    monthlyRentPerSqm: { type: 'normal' | 'triangular' | 'uniform' | 'lognormal'; params: Record<string, number> };
    vacancyRate: { type: 'normal' | 'triangular' | 'uniform' | 'lognormal'; params: Record<string, number> };
    maintenanceCosts: { type: 'normal' | 'triangular' | 'uniform' | 'lognormal'; params: Record<string, number> };
    capitalizationRate: { type: 'normal' | 'triangular' | 'uniform' | 'lognormal'; params: Record<string, number> };
  },
  enableFatTail: boolean = true,
  debug: boolean = false
): CorrelatedMieteinnahmenSamples {
  // 1. Generiere unabhängige Z-Scores
  const independentZ = generateIndependentZScores(4);

  // 2. Transformiere zu korrelierten Z-Scores mittels Cholesky
  const choleskyMatrix = getMieteinnahmenCholeskyMatrix();
  let correlatedZ = transformToCorrelatedZScores(independentZ, choleskyMatrix);

  // 3. Fat-Tail-Logik anwenden
  const fatTailApplied = enableFatTail && correlatedZ[3] > 1.64;
  if (enableFatTail) {
    correlatedZ = applyFatTailLogic(correlatedZ);
  }

  // 4. Z-Scores in Werte transformieren
  const monthlyRentPerSqm = zScoreToValue(
    correlatedZ[0],
    params.monthlyRentPerSqm.type,
    params.monthlyRentPerSqm.params
  );

  const vacancyRateRaw = zScoreToValue(
    correlatedZ[1],
    params.vacancyRate.type,
    params.vacancyRate.params
  );

  const maintenanceCostRateRaw = zScoreToValue(
    correlatedZ[2],
    params.maintenanceCosts.type,
    params.maintenanceCosts.params
  );

  const capRateRaw = zScoreToValue(
    correlatedZ[3],
    params.capitalizationRate.type,
    params.capitalizationRate.params
  );

  // 5. Physikalisch sinnvolle Grenzen anwenden
  const result: CorrelatedMieteinnahmenSamples = {
    monthlyRentPerSqm: clampValue(monthlyRentPerSqm, 0, 1000), // Max 1000 €/m²
    vacancyRate: clampValue(vacancyRateRaw, 0, 100),           // 0-100%
    maintenanceCostRate: clampValue(maintenanceCostRateRaw, 0, 50), // Max 50%
    capRate: clampValue(capRateRaw, 0.5, 20),                  // 0.5-20%
  };

  if (debug) {
    result.zScores = {
      independent: independentZ,
      correlated: correlatedZ,
      fatTailApplied,
    };
  }

  return result;
}
