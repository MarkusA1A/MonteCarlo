import { MieteinnahmenParams, PropertyData } from '../../types';
import { sampleDistribution } from '../distributions';

/**
 * Ertragswertverfahren / Mieteinnahmen-Modell
 *
 * Berechnet den Immobilienwert basierend auf den zu erwartenden Mieteinnahmen.
 * Verwendet das Gordon Growth Model für ewige Rente mit Wachstum:
 * Formel: Wert = Jahresreinertrag / (Kapitalisierungszinssatz - Wachstumsrate)
 */
export function calculateMieteinnahmenValue(
  property: PropertyData,
  params: MieteinnahmenParams
): number {
  // Parameter samplen
  const monthlyRentPerSqm = sampleDistribution(params.monthlyRentPerSqm);
  const vacancyRate = sampleDistribution(params.vacancyRate) / 100; // In Dezimal
  const annualRentIncrease = sampleDistribution(params.annualRentIncrease) / 100; // In Dezimal
  const maintenanceCostRate = sampleDistribution(params.maintenanceCosts) / 100;
  const managementCostRate = sampleDistribution(params.managementCosts) / 100;
  const capRate = sampleDistribution(params.capitalizationRate) / 100;

  // Validierung: Cap Rate muss größer als Wachstumsrate sein (Gordon Growth Model)
  // Minimum 0.5% effektive Rate um Division durch ~0 zu vermeiden
  const effectiveCapRate = Math.max(capRate - annualRentIncrease, 0.005);

  // Brutto-Jahresmiete
  const grossAnnualRent = monthlyRentPerSqm * property.area * 12;

  // Effektive Jahresmiete (nach Leerstand)
  const effectiveGrossIncome = grossAnnualRent * (1 - vacancyRate);

  // Betriebskosten
  const maintenanceCosts = effectiveGrossIncome * maintenanceCostRate;
  const managementCosts = effectiveGrossIncome * managementCostRate;

  // Nettoertrag
  const netOperatingIncome = effectiveGrossIncome - maintenanceCosts - managementCosts;

  // Kapitalisierung mit Gordon Growth Model
  const propertyValue = netOperatingIncome / effectiveCapRate;

  return Math.max(0, propertyValue);
}

/**
 * Detaillierte Berechnung mit allen Zwischenwerten (für Analyse)
 */
export function calculateMieteinnahmenDetailed(
  property: PropertyData,
  params: MieteinnahmenParams,
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
