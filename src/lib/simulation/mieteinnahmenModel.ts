import { MieteinnahmenParams, PropertyData, Distribution } from '../../types';
import { sampleDistribution } from '../distributions';
import { generateCorrelatedMieteinnahmenSamples } from '../correlation';

/**
 * Ertragswertverfahren / Mieteinnahmen-Modell
 *
 * Berechnet den Immobilienwert basierend auf den aktuellen Mieteinnahmen.
 * Klassisches Ertragswertverfahren ohne Wachstumskomponente:
 * Formel: Wert = Jahresreinertrag / Kapitalisierungszinssatz
 *
 * NEU: Unterstützt korrelierte Zufallsvariablen für realistischere Szenarien.
 * Die Korrelationsmatrix basiert auf empirischen Zusammenhängen zwischen
 * Miete, Leerstand, Instandhaltung und Kapitalisierungszins.
 *
 * Fat-Tail-Logik: Bei hohem Cap Rate (Krisenszenario) wird der Leerstand verstärkt.
 */
export function calculateMieteinnahmenValue(
  property: PropertyData,
  params: MieteinnahmenParams,
  useCorrelation: boolean = true
): number {
  let monthlyRentPerSqm: number;
  let vacancyRate: number;
  let maintenanceCostRate: number;
  let capRate: number;
  let managementCostRate: number;

  if (useCorrelation) {
    // Korrelierte Samples generieren
    const correlatedSamples = generateCorrelatedMieteinnahmenSamples({
      monthlyRentPerSqm: convertDistribution(params.monthlyRentPerSqm),
      vacancyRate: convertDistribution(params.vacancyRate),
      maintenanceCosts: convertDistribution(params.maintenanceCosts),
      capitalizationRate: convertDistribution(params.capitalizationRate),
    });

    monthlyRentPerSqm = correlatedSamples.monthlyRentPerSqm;
    vacancyRate = correlatedSamples.vacancyRate / 100; // In Dezimal
    maintenanceCostRate = correlatedSamples.maintenanceCostRate / 100;
    capRate = Math.max(correlatedSamples.capRate / 100, 0.005); // Min 0.5%

    // Verwaltungskosten bleiben unkorreliert (weniger volatil)
    managementCostRate = sampleDistribution(params.managementCosts) / 100;
  } else {
    // Fallback: Unkorrelierte Samples (Original-Verhalten)
    monthlyRentPerSqm = sampleDistribution(params.monthlyRentPerSqm);
    vacancyRate = sampleDistribution(params.vacancyRate) / 100;
    maintenanceCostRate = sampleDistribution(params.maintenanceCosts) / 100;
    managementCostRate = sampleDistribution(params.managementCosts) / 100;
    capRate = Math.max(sampleDistribution(params.capitalizationRate) / 100, 0.005);
  }

  // Brutto-Jahresmiete
  const grossAnnualRent = monthlyRentPerSqm * property.area * 12;

  // Effektive Jahresmiete (nach Leerstand)
  const effectiveGrossIncome = grossAnnualRent * (1 - vacancyRate);

  // Betriebskosten
  const maintenanceCosts = effectiveGrossIncome * maintenanceCostRate;
  const managementCosts = effectiveGrossIncome * managementCostRate;

  // Nettoertrag (Jahresreinertrag)
  const netOperatingIncome = effectiveGrossIncome - maintenanceCosts - managementCosts;

  // Kapitalisierung: Wert = NOI / Cap Rate
  const propertyValue = netOperatingIncome / capRate;

  return Math.max(0, propertyValue);
}

/**
 * Konvertiert ein Distribution-Objekt in das Format für die Korrelationsfunktion
 */
function convertDistribution(dist: Distribution): {
  type: 'normal' | 'triangular' | 'uniform' | 'lognormal';
  params: Record<string, number>;
} {
  return {
    type: dist.type,
    params: dist.params as Record<string, number>,
  };
}

/**
 * Detaillierte Berechnung mit allen Zwischenwerten (für Analyse)
 */
export function calculateMieteinnahmenDetailed(
  property: PropertyData,
  _params: MieteinnahmenParams,
  samples: {
    monthlyRentPerSqm: number;
    vacancyRate: number;
    maintenanceCostRate: number;
    managementCostRate: number;
    capRate: number;
  }
): {
  grossAnnualRent: number;
  effectiveGrossIncome: number;
  maintenanceCosts: number;
  managementCosts: number;
  netOperatingIncome: number;
  propertyValue: number;
} {
  const { monthlyRentPerSqm, vacancyRate, maintenanceCostRate, managementCostRate, capRate } = samples;

  const grossAnnualRent = monthlyRentPerSqm * property.area * 12;
  const effectiveGrossIncome = grossAnnualRent * (1 - vacancyRate / 100);
  const maintenanceCosts = effectiveGrossIncome * (maintenanceCostRate / 100);
  const managementCosts = effectiveGrossIncome * (managementCostRate / 100);
  const netOperatingIncome = effectiveGrossIncome - maintenanceCosts - managementCosts;
  const propertyValue = netOperatingIncome / (capRate / 100);

  return {
    grossAnnualRent,
    effectiveGrossIncome,
    maintenanceCosts,
    managementCosts,
    netOperatingIncome,
    propertyValue: Math.max(0, propertyValue),
  };
}
